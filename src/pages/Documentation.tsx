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
  { id: "intro", icon: BookOpen, title: "Introduction", desc: "What GridBrain OS is and who it's for." },
  { id: "ops",   icon: Zap,      title: "Operations Guide", desc: "Daily workflows for grid operators." },
  { id: "risk",  icon: Shield,   title: "Risk Intelligence", desc: "How risk scores and sync risk are computed." },
  { id: "infra", icon: Map,      title: "Infrastructure Planning", desc: "Charger placement & deployment policies." },
  { id: "xai",   icon: Brain,    title: "Explainable AI", desc: "SHAP, decision trace & model lineage." },
  { id: "api",   icon: Code2,    title: "REST API Reference", desc: "Endpoints, auth & rate limits." },
];

const articles: Record<string, { title: string; body: string }[]> = {
  intro: [
    { title: "What is GridBrain OS?", body: "GridBrain OS is an AI-powered grid intelligence platform built for BESCOM and partnering DISCOMs. It unifies SCADA telemetry, EV registrations, and weather signals into a single decision surface for operators, analysts and auditors." },
    { title: "System architecture", body: "Edge SCADA collectors → Kafka stream → feature store → ML models (DemandForecaster v4.2.1, RiskClassifier v3.1) → operator UI. All decisions are hash-chained into the audit ledger." },
    { title: "Quick start", body: "1. Sign in with your BESCOM SSO account. 2. Open the Overview page to see citywide health. 3. Use the GridBrain Agent (bottom-right) for natural-language queries." },
  ],
  ops: [
    { title: "Acknowledging an alert", body: "Click the alert banner → review AI explanation → choose 'Acknowledge', 'Mitigate' or 'Escalate'. All actions are signed against your operator key." },
    { title: "Approving a load shift", body: "Open Risk Intelligence → select a high-risk zone → review the recommended off-peak window → click 'Approve'. Approval requires L3 clearance." },
    { title: "Notifying EV Mitra users", body: "Use the 'Notify via EV Mitra' button on any high-risk row. Notifications are throttled to 1 per user per hour and target a 1.5 km radius." },
  ],
  risk: [
    { title: "Risk scoring model", body: "Each zone receives a 0–100 score. Inputs: transformer headroom, evening peak demand, charger:EV ratio, weather, ToU adoption. Risk ≥ 70 = HIGH, 45–69 = MEDIUM." },
    { title: "Synchronization risk", body: "Detects when AI-recommended schedules cause concurrent arrival spikes. Uses a Poisson-burst model on station check-in timestamps." },
  ],
  infra: [
    { title: "Charger placement policy", body: "Suggested locations are derived from a multi-objective optimizer balancing demand growth, transformer headroom, land availability and equity (underserved wards weighted 1.4×)." },
  ],
  xai: [
    { title: "SHAP feature attributions", body: "Every risk prediction ships with per-feature SHAP values. Open Explainable AI to inspect which factors moved the score for any zone." },
    { title: "Decision trace", body: "A signed, append-only log showing exactly which rules and model versions produced each recommendation." },
  ],
  api: [
    { title: "Authentication", body: "OAuth 2.0 client credentials. Tokens last 1h. Send `Authorization: Bearer <token>` on every request." },
    { title: "GET /v1/zones", body: "Returns the latest snapshot for all monitored zones. Rate limit: 600 req/min." },
    { title: "POST /v1/notifications/ev-mitra", body: "Triggers a push notification campaign. Body: { zoneId, severity, alternates[] }." },
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
