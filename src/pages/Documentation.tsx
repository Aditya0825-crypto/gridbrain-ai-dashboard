import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { BookOpen, Search, Download, ExternalLink, FileText, Code2, Zap, Shield, Brain, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { downloadText } from "@/lib/download";
import { useNavigate } from "react-router-dom";

const sections = [
  { id: "intro",   icon: BookOpen, title: "Introduction",          desc: "What GridBrain OS is and who it's for." },
  { id: "ops",     icon: Zap,      title: "Operations Guide",      desc: "Daily workflows for grid operators." },
  { id: "risk",    icon: Shield,   title: "Risk Intelligence",     desc: "How risk scores and sync risk are computed." },
  { id: "infra",   icon: Map,      title: "Infrastructure Planning", desc: "Charger placement & deployment policies." },
  { id: "xai",     icon: Brain,    title: "Explainable AI",        desc: "SHAP, decision trace & model lineage." },
  { id: "api",     icon: Code2,    title: "REST API Reference",    desc: "Endpoints, auth & rate limits." },
  { id: "sec",     icon: Shield,   title: "Security & Compliance", desc: "DPDP Act, CEA cyber guidelines, ISO 42001." },
  { id: "faq",     icon: FileText, title: "FAQ & Troubleshooting", desc: "Common issues and resolutions." },
  { id: "release", icon: FileText, title: "Release Notes",         desc: "Versioned change log for GridBrain OS." },
];

const articles: Record<string, { title: string; body: string }[]> = {
  intro: [
    { title: "What is GridBrain OS?", body: "GridBrain OS is an AI-powered grid intelligence platform commissioned for BESCOM and partnering DISCOMs across Karnataka. It unifies SCADA telemetry, EV registrations from Parivahan, weather signals from IMD, and ToU billing data into a single decision surface used by operators, planners, analysts and auditors. The system is designed to operate at sub-second latency for alerting and 5-minute granularity for forecasting." },
    { title: "Who uses it", body: "Four primary personas: (1) Field Operators — monitor live grid health and acknowledge alerts; (2) Planners — model scenarios and approve infrastructure capex; (3) Analysts — investigate post-incident causality via Explainable AI; (4) Auditors / KERC — review tamper-evident decision ledgers for regulatory compliance." },
    { title: "System architecture", body: "Layer 1: Edge SCADA collectors poll 412 substations every 5s. Layer 2: A Kafka stream (3 brokers, RF=3) buffers 14 days of telemetry. Layer 3: A Feast feature store materializes 87 features used by ML models. Layer 4: DemandForecaster v4.2.1 (Temporal Fusion Transformer) and RiskClassifier v3.1 (XGBoost) run on a Triton inference server. Layer 5: Operator UI (this app), all decisions hash-chained into the Audit Ledger via SHA-256 + Ed25519 signatures." },
    { title: "Quick start (5 minutes)", body: "1. Sign in with your BESCOM SSO account at https://gridbrain.bescom.in. 2. Open the Overview page to see citywide health (12 zones, color-coded). 3. Click any zone for drill-down. 4. Use the GridBrain Agent (bottom-right ⚡ icon) to ask natural-language questions like 'Why is Whitefield risk spiking?'. 5. Set your alert preferences in Settings → Notifications." },
    { title: "Glossary", body: "ToU = Time-of-Use tariff. SCADA = Supervisory Control and Data Acquisition. SHAP = SHapley Additive exPlanations. RBAC = Role-Based Access Control. KERC = Karnataka Electricity Regulatory Commission. EV Mitra = the consumer-facing companion app. Headroom = (capacity − live load) / capacity, expressed as a percentage." },
  ],
  ops: [
    { title: "Acknowledging an alert", body: "When the alert banner appears at the top of any page, click it to expand the AI explanation. You will see: (a) the triggering metric and threshold, (b) the top-3 SHAP contributing features, (c) recommended action with confidence score, (d) three buttons: 'Acknowledge' (you've seen it), 'Mitigate' (apply the recommended action), 'Escalate' (page L4 supervisor). All actions are signed against your operator key and appear in the Audit ledger within 2 seconds." },
    { title: "Approving a load shift", body: "Open Risk Intelligence → select a high-risk zone (red marker) → review the recommended off-peak window in the right panel → click 'Approve'. Approval requires L3 clearance or higher. Once approved, EV Mitra users in the affected radius receive a push notification within 30 seconds offering ₹15/kWh discount during the off-peak window. Typical adoption: 31–46% of notified users." },
    { title: "Notifying EV Mitra users", body: "Use the 'Notify via EV Mitra' button on any high-risk row. Notifications are throttled to 1 per user per hour and target a 1.5 km radius around the affected substation. Message templates are localized to Kannada, English and Hindi based on user preference. Delivery rates: ~94% within 60s. You can review delivery telemetry under Reports → Notification Campaigns." },
    { title: "Shift handover checklist", body: "Before logging off: (1) clear or reassign all yellow/red zones in your purview; (2) ensure no acknowledged-but-unresolved alerts older than 4h; (3) post a shift summary note in the Audit ledger via Settings → Shift Note; (4) confirm SCADA sync is < 10s in the sidebar footer." },
  ],
  risk: [
    { title: "Risk scoring model", body: "Each of 12 zones receives a 0–100 score every 60s. Inputs (with default weights): transformer headroom (0.28), evening peak demand vs forecast (0.22), charger:EV ratio (0.16), weather temperature anomaly (0.12), ToU adoption rate (0.10), historical incident density (0.08), feeder age factor (0.04). Risk ≥ 70 = HIGH (red), 45–69 = MEDIUM (yellow), < 45 = LOW (green)." },
    { title: "Synchronization risk", body: "Detects when AI-recommended schedules cause concurrent arrival spikes at the same charging station. Uses a Poisson-burst model on station check-in timestamps. If predicted concurrent arrivals exceed station port count × 1.4, the system auto-fans-out alternates. Read the full whitepaper at /docs/sync-risk-v2.pdf." },
    { title: "Calibration & drift monitoring", body: "Risk thresholds are recalibrated monthly using a Platt-scaling pass against the prior 30 days of incidents. Drift is tracked via Population Stability Index (PSI) per feature; PSI > 0.2 triggers an MLOps ticket. Current PSI for all 87 features is < 0.15." },
    { title: "Manual override", body: "L4+ operators can manually downgrade a risk score with mandatory justification text. Overrides expire after 4 hours and are highlighted in the Audit ledger with an amber badge." },
  ],
  infra: [
    { title: "Charger placement policy", body: "Suggested locations are derived from a multi-objective optimizer (NSGA-II) balancing four objectives: (1) projected demand growth over 18 months, (2) transformer headroom availability, (3) land/lease availability from BBMP records, (4) social equity (underserved wards weighted 1.4×). Top-3 Pareto-optimal sites are shown per zone." },
    { title: "Deployment workflow", body: "Planner clicks 'Approve Deployment' → work order WO-XXXX is created → BESCOM field ops receive SMS + email → site survey scheduled within 7 days → installation typically completed in 21–35 days for AC chargers, 45–60 days for DC Fast. Status updates appear in Reports → Deployment Tracker." },
    { title: "Capex modelling", body: "Default unit costs (FY25): AC 22kW = ₹2.8L, DC 60kW = ₹8.5L, DC 150kW = ₹17L (excludes civil works ~30% uplift). The Simulation page lets you adjust these and re-run NPV across a 10-year horizon at 8% discount rate." },
  ],
  xai: [
    { title: "SHAP feature attributions", body: "Every risk and demand prediction ships with per-feature SHAP values computed via the TreeSHAP algorithm (exact for XGBoost). Open Explainable AI to inspect which factors moved the score up or down for any zone. Hover any bar to see the raw feature value at prediction time." },
    { title: "Decision trace", body: "A signed, append-only log showing exactly which rules and model versions produced each recommendation. Each entry contains: input feature snapshot (hash), model version, output score, rule path, signing key fingerprint. Export any trace as a court-admissible PDF via the 'Export trace' button." },
    { title: "Model registry & lineage", body: "All models are versioned via MLflow (https://mlflow.gridbrain.bescom.in). Each version records: training dataset hash, hyperparameters, validation metrics, approval signatures from two ML engineers + one ops lead. Rollback to any prior version is one click and propagates to all serving replicas in < 90s." },
    { title: "Counterfactual explanations", body: "On any prediction, click 'What would change this?' to see the minimum feature deltas required to flip the classification (e.g. 'reduce evening load by 4.2 MW OR increase ToU adoption by 9%')." },
  ],
  api: [
    { title: "Authentication", body: "OAuth 2.0 client credentials flow. POST to /oauth/token with client_id + client_secret to obtain a bearer token (TTL 1h, refresh TTL 24h). Send 'Authorization: Bearer <token>' on every request. mTLS is required on all production endpoints; CA bundle at /docs/ca.pem." },
    { title: "GET /v1/zones", body: "Returns the latest snapshot for all 12 monitored zones. Response: array of {id, name, lat, lng, load, capacity, riskScore, chargers, growth, substation}. Rate limit: 600 req/min per client. Cache TTL: 30s." },
    { title: "GET /v1/zones/:id/forecast", body: "Returns 24h ahead demand forecast at 15-minute granularity. Query params: horizon (1–48h, default 24), quantiles (p10,p50,p90). Rate limit: 120 req/min." },
    { title: "POST /v1/notifications/ev-mitra", body: "Triggers a push notification campaign. Body: { zoneId, severity ('info'|'warn'|'critical'), alternates: [{stationId, etaMins}], radiusKm }. Returns campaignId. Requires scope 'notify:write'. Rate limit: 30 req/min." },
    { title: "Webhooks", body: "Subscribe to events at /v1/webhooks: 'risk.elevated', 'deployment.approved', 'audit.entry'. Payloads are signed with HMAC-SHA256 using your webhook secret; verify the X-GridBrain-Signature header. Retries: 5 attempts with exponential backoff." },
    { title: "Errors", body: "Standard HTTP codes. 401 = expired/invalid token, 403 = scope missing, 422 = validation failed (body includes 'errors' array), 429 = rate-limited (Retry-After header set), 503 = upstream SCADA degraded." },
  ],
  sec: [
    { title: "DPDP Act 2023 compliance", body: "All EV-owner personal data is processed under explicit consent obtained via the EV Mitra onboarding flow. Data minimization is enforced at the feature store layer — only ward-level aggregates (k ≥ 50) are exposed to the operator UI. Subject access requests (SAR) are fulfilled within 30 days via the /privacy portal." },
    { title: "CEA Cyber Security Guidelines (2021)", body: "Network segmented per CEA Annexure-II: OT (SCADA) and IT (this app) are separated by an industrial DMZ with one-way data diodes for telemetry ingestion. No control commands flow from IT to OT. Annual third-party audit by CERT-In empanelled auditor." },
    { title: "ISO 42001 (AI Management System)", body: "Models are governed by a documented AI lifecycle: impact assessment → data sheet → training → red-team → human-in-the-loop pilot → staged rollout. Bias audits run quarterly across 9 protected attributes (ward income decile, language, etc.)." },
    { title: "Data residency", body: "All data is stored within India (ap-south-1 + ap-south-2 multi-AZ). No cross-border transfers. Backups encrypted with AES-256 GCM, keys rotated every 90 days via AWS KMS." },
  ],
  faq: [
    { title: "The map is blank — what do I do?", body: "Hard-refresh (Ctrl/Cmd-Shift-R). If still blank, check the SCADA sync indicator in the sidebar footer; if > 60s, telemetry is delayed and the map will repopulate automatically once sync resumes. If sync is healthy, file a support ticket with your browser console logs attached." },
    { title: "Why did my notification not deliver?", body: "Most common causes: (1) the user has muted GridBrain notifications in EV Mitra; (2) throttle window (1/hr) is active; (3) device offline > 24h. Delivery telemetry is visible per-campaign under Reports → Notification Campaigns." },
    { title: "How accurate is the demand forecast?", body: "Current MAPE on 24h-ahead forecasts is 4.7% citywide and 6.2% per-zone (rolling 30-day). Accuracy degrades during festival weeks (Diwali, Dasara) where MAPE may rise to 9–11%; the system flags these periods automatically." },
    { title: "Can I export data to Excel?", body: "Yes — every table view has a 'Download' button (CSV) in the top-right. For large extracts (> 100k rows), use the REST API with pagination (cursor-based, page size up to 5000)." },
  ],
  release: [
    { title: "v2.4.1 — May 2026", body: "Added Synchronization Risk Detection module on Risk Intelligence. New 'Add to Plan' workflow on Infrastructure. Documentation expanded with Security, FAQ and Release Notes sections. EV Mitra alternates now include real-time wait estimates." },
    { title: "v2.4.0 — April 2026", body: "Launched Explainable AI module (SHAP + decision trace + counterfactuals). Audit ledger upgraded to Ed25519 signatures. Performance: page-load p95 reduced from 1.8s to 0.9s." },
    { title: "v2.3.x — Q1 2026", body: "Government Command Center page added. ISO 42001 certification achieved. RBAC matrix expanded to 6 clearance levels. Forecast horizon extended to 48h." },
    { title: "v2.2.0 — Dec 2025", body: "Initial public deployment for BESCOM. 12 zones, 412 substations onboarded. Kannada localization shipped." },
  ],
};

export default function Documentation() {
  const [active, setActive] = useState("intro");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const matches = (txt: string) => txt.toLowerCase().includes(query.toLowerCase());
  const visible = articles[active]?.filter((a) => !query || matches(a.title) || matches(a.body)) ?? [];

  const downloadHandbook = () => {
    const text = Object.entries(articles).map(([k, list]) =>
      `# ${sections.find(s => s.id === k)?.title}\n\n` +
      list.map((a) => `## ${a.title}\n${a.body}`).join("\n\n")
    ).join("\n\n" + "═".repeat(60) + "\n\n");
    downloadText("gridbrain-handbook.md", `# GridBrain OS · Operator Handbook\nv2.4.1 · Generated ${new Date().toISOString()}\n\n${text}`);
    toast.success("Handbook downloaded");
  };

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Documentation"
        description="Operator handbook, API reference and architectural guides for GridBrain OS."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="glass border-border" onClick={() => navigate("/")}>
              <ExternalLink className="w-4 h-4 mr-2" /> External docs
            </Button>
            <Button onClick={downloadHandbook} className="bg-gradient-primary text-primary-foreground">
              <Download className="w-4 h-4 mr-2" /> Download handbook
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="glass rounded-2xl p-3 mb-6 flex items-center gap-2">
        <Search className="w-4 h-4 text-muted-foreground ml-2" />
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="Search documentation… (e.g. 'load shift', 'SHAP', 'API')"
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground py-2" />
        <span className="text-[10px] font-mono text-muted-foreground pr-2">v2.4.1</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar */}
        <aside className="glass rounded-2xl p-3 h-fit lg:sticky lg:top-20">
          <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground px-2 py-1">Sections</p>
          <nav className="space-y-1">
            {sections.map((s) => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className={cn("w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left transition",
                  active === s.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                )}>
                <s.icon className="w-4 h-4" />
                <span className="text-xs font-medium truncate">{s.title}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <div className="space-y-3">
          <div className="glass rounded-2xl p-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-aurora opacity-20 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-1">
                {(() => { const S = sections.find((x) => x.id === active)!; return <S.icon className="w-5 h-5 text-primary" />; })()}
                <h2 className="font-display text-xl">{sections.find((s) => s.id === active)?.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground">{sections.find((s) => s.id === active)?.desc}</p>
            </div>
          </div>

          {visible.map((a, i) => (
            <motion.article key={a.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-display font-semibold">{a.title}</h3>
                <button onClick={() => { navigator.clipboard.writeText(`${a.title}\n\n${a.body}`); toast.success("Copied to clipboard"); }}
                  className="text-[10px] font-mono uppercase text-muted-foreground hover:text-primary transition">
                  Copy
                </button>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
            </motion.article>
          ))}
          {visible.length === 0 && (
            <div className="glass rounded-2xl p-8 text-center text-sm text-muted-foreground">
              <FileText className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No articles match your search.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
