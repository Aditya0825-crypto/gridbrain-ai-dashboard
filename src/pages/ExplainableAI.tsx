import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { Brain, Sparkles, GitBranch, ShieldCheck, Cpu, Database, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { zones } from "@/data/mock";
import { cn } from "@/lib/utils";

const tt = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: "12px",
    fontFamily: "DM Sans",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontSize: "11px" },
};

// SHAP-style feature contributions per zone (mock)
const featureFor = (zoneId: string) => {
  const seed = zoneId.charCodeAt(1) + (zoneId.charCodeAt(2) || 0);
  const r = (n: number) => ((Math.sin(seed * n) + 1) / 2);
  return [
    { name: "Evening peak demand",      value: +(0.22 + r(1) * 0.18).toFixed(2) },
    { name: "Transformer utilization",  value: +(0.16 + r(2) * 0.14).toFixed(2) },
    { name: "EV charger density",       value: +(0.12 + r(3) * 0.10).toFixed(2) },
    { name: "Historical overloads",     value: +(0.08 + r(4) * 0.08).toFixed(2) },
    { name: "Ambient temperature",      value: +(0.04 + r(5) * 0.06).toFixed(2) },
    { name: "Workplace charging share", value: -(0.05 + r(6) * 0.05).toFixed(2) },
    { name: "ToU tariff adoption",      value: -(0.06 + r(7) * 0.06).toFixed(2) },
    { name: "Solar feed-in (local)",    value: -(0.04 + r(8) * 0.04).toFixed(2) },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
};

const decisionTrace = (zoneName: string, score: number) => [
  { step: "1. Ingest", text: `Pulled 24h SCADA telemetry & ${zoneName} substation feed (sampling 5s).`, status: "ok" },
  { step: "2. Forecast", text: "LSTM-Attn forecaster projected 19:00–22:00 demand window.", status: "ok" },
  { step: "3. Stress test", text: "Monte-Carlo rollout (n=2,000) over EV-arrival distribution.", status: "ok" },
  { step: "4. Risk score", text: `Aggregated overload probability → risk index ${score}/100.`, status: score >= 70 ? "warn" : "ok" },
  { step: "5. Recommend", text: score >= 70
      ? "Trigger ToU nudge + reserve 2.4 MW from neighbouring substation."
      : "Maintain current dispatch profile; monitor at 15 min cadence.",
    status: score >= 70 ? "warn" : "ok" },
  { step: "6. Audit", text: "Decision logged to audit ledger #GB-AUD-" + Math.round(score * 137 + 1000), status: "ok" },
];

const confidenceCurve = Array.from({ length: 24 }, (_, h) => ({
  time: `${String(h).padStart(2, "0")}:00`,
  confidence: Math.round(78 + 14 * Math.sin((h - 4) / 24 * Math.PI * 2)),
}));

const models = [
  { name: "DemandForecaster v4.2", type: "LSTM-Attn", acc: 94.6, drift: 0.8, status: "healthy" },
  { name: "RiskClassifier v3.1",   type: "GBM",       acc: 91.2, drift: 1.4, status: "healthy" },
  { name: "BehaviorSegmenter v2.0", type: "k-means+",  acc: 88.7, drift: 2.9, status: "watch"   },
  { name: "AnomalyDetector v1.6",  type: "IsolationF", acc: 96.1, drift: 0.4, status: "healthy" },
];

export default function ExplainableAI() {
  const [zoneId, setZoneId] = useState(zones[0].id);
  const zone = zones.find((z) => z.id === zoneId)!;
  const features = featureFor(zoneId);
  const trace = decisionTrace(zone.name, zone.riskScore);

  const pos = features.filter((f) => f.value > 0);
  const neg = features.filter((f) => f.value < 0);
  const baseRisk = 50;
  const projected = Math.round(
    Math.min(100, Math.max(0, baseRisk + features.reduce((s, f) => s + f.value * 100, 0)))
  );

  return (
    <>
      <PageHeader
        eyebrow="Explainable AI · XAI"
        title="Why GridBrain Decided"
        description="Transparent, auditable reasoning behind every grid recommendation. Trace contributions, confidence, and model lineage — designed for regulator review."
        actions={
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="px-2 py-1 rounded bg-success/15 text-success border border-success/30">
              ISO 42001 · XAI Compliant
            </span>
          </div>
        }
      />

      {/* Zone selector */}
      <div className="glass rounded-2xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Explain decision for:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {zones.slice(0, 8).map((z) => (
            <button
              key={z.id}
              onClick={() => setZoneId(z.id)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-md border transition-all",
                zoneId === z.id
                  ? "bg-primary text-primary-foreground border-primary glow-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
              )}
            >
              {z.name}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono">
          <span className="text-muted-foreground">Risk score</span>
          <span className={cn(
            "px-2 py-1 rounded border",
            zone.riskScore >= 70 ? "bg-danger/15 text-danger border-danger/30"
              : zone.riskScore >= 45 ? "bg-warning/15 text-warning border-warning/30"
              : "bg-success/15 text-success border-success/30"
          )}>
            {zone.riskScore}/100
          </span>
        </div>
      </div>

      {/* Top row: contributions + confidence */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-5 xl:col-span-2"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Feature Contributions (SHAP)
              </h3>
              <p className="text-xs text-muted-foreground">
                What pushed risk up vs. down for <span className="text-foreground">{zone.name}</span>.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-accent/15 text-accent border border-accent/30">
              MODEL: RiskClassifier v3.1
            </span>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={features} layout="vertical" margin={{ left: 110 }}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" horizontal={false} />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10}
                tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(0)}%`} />
              <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} width={100} />
              <Tooltip {...tt} formatter={(v: number) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {features.map((f, i) => (
                  <Cell key={i} fill={f.value > 0 ? "hsl(var(--danger))" : "hsl(var(--success))"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-border">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Baseline</p>
              <p className="font-display text-xl">{baseRisk}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Net impact</p>
              <p className={cn("font-display text-xl",
                projected - baseRisk > 0 ? "text-danger" : "text-success")}>
                {projected - baseRisk > 0 ? "+" : ""}{projected - baseRisk}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Final score</p>
              <p className="font-display text-xl text-primary">{projected}</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-success" /> Model Confidence
          </h3>
          <p className="text-xs text-muted-foreground mb-4">24h calibrated probability bands</p>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={confidenceCurve}>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={9} interval={3} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} domain={[60, 100]} />
              <Tooltip {...tt} />
              <Line type="monotone" dataKey="confidence" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="space-y-2 mt-4 pt-4 border-t border-border text-xs">
            <Row label="Mean confidence" value="89.4%" tone="success" />
            <Row label="Calibration error" value="0.031 (ECE)" tone="muted" />
            <Row label="Counterfactual stability" value="High" tone="success" />
            <Row label="Out-of-distribution flag" value="None detected" tone="success" />
          </div>
        </motion.div>
      </div>

      {/* Decision trace + drivers */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 xl:col-span-2"
        >
          <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" /> Decision Trace
          </h3>
          <p className="text-xs text-muted-foreground mb-4">Every step is logged & cryptographically signed for audit.</p>
          <ol className="relative border-l-2 border-border ml-2 space-y-4">
            {trace.map((t, i) => (
              <li key={i} className="ml-5 relative">
                <span className={cn(
                  "absolute -left-[27px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center",
                  t.status === "warn"
                    ? "bg-warning/20 border-warning"
                    : "bg-success/20 border-success"
                )}>
                  {t.status === "warn"
                    ? <AlertTriangle className="w-2 h-2 text-warning" />
                    : <CheckCircle2 className="w-2 h-2 text-success" />}
                </span>
                <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">{t.step}</p>
                <p className="text-sm text-foreground leading-snug">{t.text}</p>
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-accent" /> Plain-English Summary
          </h3>
          <p className="text-sm leading-relaxed text-foreground">
            For <span className="text-primary font-medium">{zone.name}</span>, risk is driven primarily by{" "}
            <span className="text-danger">{pos[0]?.name.toLowerCase()}</span>
            {pos[1] && <> and <span className="text-danger">{pos[1].name.toLowerCase()}</span></>}.
            It is partially offset by{" "}
            <span className="text-success">{neg[0]?.name.toLowerCase()}</span>.
            The model is <span className="text-success">89.4% confident</span> and the recommendation is
            {" "}{zone.riskScore >= 70
              ? <span className="text-warning">to act within 30 minutes</span>
              : <span className="text-success">to continue normal operations</span>}.
          </p>

          <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
            <Row label="Counterfactual" value={`If ToU adoption +20% → risk ${Math.max(0, projected - 18)}`} tone="muted" />
            <Row label="Fairness check" value="Passed (zone-balanced)" tone="success" />
            <Row label="Bias audit" value="Last run 2h ago" tone="muted" />
          </div>
        </motion.div>
      </div>

      {/* Model registry / data lineage */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" /> Model Registry
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Active models powering this decision</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left py-2 font-medium">Model</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-right py-2 font-medium">Acc</th>
                  <th className="text-right py-2 font-medium">Drift</th>
                  <th className="text-right py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {models.map((m) => (
                  <tr key={m.name} className="border-b border-border/40">
                    <td className="py-2.5 font-medium">{m.name}</td>
                    <td className="py-2.5 font-mono text-muted-foreground">{m.type}</td>
                    <td className="py-2.5 font-mono text-right">{m.acc}%</td>
                    <td className="py-2.5 font-mono text-right">{m.drift}σ</td>
                    <td className="py-2.5 text-right">
                      <span className={cn(
                        "text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
                        m.status === "healthy"
                          ? "bg-success/15 text-success border-success/30"
                          : "bg-warning/15 text-warning border-warning/30"
                      )}>
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-semibold mb-1 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Data Lineage
          </h3>
          <p className="text-xs text-muted-foreground mb-3">Sources used in this prediction</p>
          <div className="space-y-2.5 text-xs">
            {[
              { src: "BESCOM SCADA · 220kV feeders",  freshness: "5s",  rows: "1.2M" },
              { src: "EV charger telemetry · OCPP 2.0", freshness: "11s", rows: "84k" },
              { src: "IMD weather · Bengaluru station", freshness: "10m", rows: "2.4k" },
              { src: "Vahan EV registry (state)",       freshness: "24h", rows: "612k" },
              { src: "Historical outage ledger",         freshness: "1h",  rows: "9.8k" },
            ].map((d) => (
              <div key={d.src} className="flex items-center justify-between p-2.5 rounded-md border border-border bg-muted/20">
                <span className="font-medium truncate">{d.src}</span>
                <span className="font-mono text-[10px] text-muted-foreground shrink-0 ml-2">
                  {d.rows} · {d.freshness}
                </span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-3 pt-3 border-t border-border">
            All sources comply with CEA Cyber Security Guidelines 2021 & DPDP Act 2023.
          </p>
        </motion.div>
      </div>
    </>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone: "success" | "muted" | "warn" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn(
        "font-mono",
        tone === "success" && "text-success",
        tone === "warn" && "text-warning",
        tone === "muted" && "text-foreground"
      )}>{value}</span>
    </div>
  );
}
