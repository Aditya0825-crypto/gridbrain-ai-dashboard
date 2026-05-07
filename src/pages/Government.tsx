import { motion } from "framer-motion";
import { Landmark, TrendingUp, IndianRupee, Zap, ShieldCheck, Building2, FileCheck2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { governmentPolicies, smartCityMetrics, gridReadiness } from "@/data/mock";
import { cn } from "@/lib/utils";

const statusTone: Record<string, string> = {
  Active: "bg-success/15 text-success border-success/30",
  Upcoming: "bg-accent/15 text-accent border-accent/30",
  "Under Review": "bg-warning/15 text-warning border-warning/30",
  Approved: "bg-primary/15 text-primary border-primary/30",
};

const trendIcon: Record<string, string> = { up: "text-success", down: "text-danger", neutral: "text-muted-foreground" };

const fundingPipeline = [
  { phase: "Sanctioned", amount: "₹4,820 Cr", pct: 100 },
  { phase: "Released", amount: "₹3,140 Cr", pct: 65 },
  { phase: "Utilized", amount: "₹1,240 Cr", pct: 26 },
  { phase: "Audited", amount: "₹980 Cr", pct: 20 },
];

const integrations = [
  { name: "Bengaluru Smart City Ltd", status: "Connected", icon: Building2 },
  { name: "BESCOM SCADA Network", status: "Live Sync", icon: Zap },
  { name: "KERC Regulatory Portal", status: "Auto-filed", icon: FileCheck2 },
  { name: "Vahan National Registry", status: "API Active", icon: ExternalLink },
  { name: "CERT-In Threat Feed", status: "Monitoring", icon: ShieldCheck },
];

export default function Government() {
  return (
    <>
      <PageHeader
        eyebrow="Government Command Center"
        title="Policy & Smart City Intelligence"
        description="Track government EV policies, budget utilization, BESCOM grid readiness, and smart city integration status — all in one command center."
        actions={
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-primary/15 text-primary border border-primary/30 flex items-center gap-1.5">
            <Landmark className="w-3 h-3" /> GOV DASHBOARD · LIVE
          </span>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {smartCityMetrics.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5 relative overflow-hidden group hover:border-primary/40 transition-colors"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-primary/0 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" />
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono relative">{m.label}</p>
            <p className="font-display text-2xl mt-2 text-gradient relative">{m.value}</p>
            <p className={cn("text-xs font-mono mt-1.5 relative", trendIcon[m.trend])}>{m.subtext}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Policy tracker */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-5 xl:col-span-2"
        >
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold">Active Government Policies</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <th className="text-left py-2.5 font-medium">Policy / Scheme</th>
                  <th className="text-left py-2.5 font-medium">Ministry</th>
                  <th className="text-left py-2.5 font-medium">Status</th>
                  <th className="text-right py-2.5 font-medium">Budget</th>
                  <th className="text-left py-2.5 font-medium">Target</th>
                  <th className="text-right py-2.5 font-medium">Progress</th>
                </tr>
              </thead>
              <tbody>
                {governmentPolicies.map((p, i) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.03 }}
                    className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-3 font-medium">
                      <p>{p.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{p.lastUpdated}</p>
                    </td>
                    <td className="py-3 text-xs font-mono text-muted-foreground">{p.ministry}</td>
                    <td className="py-3">
                      <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border", statusTone[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono text-xs text-primary">{p.budget}</td>
                    <td className="py-3 text-xs text-muted-foreground">{p.evTarget}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-primary"
                            style={{ width: `${p.progress}%` }}
                          />
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground w-8 text-right">{p.progress}%</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Grid readiness */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">BESCOM Grid Readiness</h3>
          </div>
          <div className="space-y-3">
            {gridReadiness.map((g) => (
              <div key={g.metric} className="flex items-center justify-between">
                <span className="text-xs text-foreground">{g.metric}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-primary">{g.value}</span>
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      g.status === "ok" ? "bg-success" : "bg-warning animate-glow-pulse"
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Overall Score</span>
              <span className="font-display text-xl text-gradient">87/100</span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: "87%" }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Funding pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <IndianRupee className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Government Funding Pipeline</h3>
          </div>
          <div className="space-y-4">
            {fundingPipeline.map((f, i) => (
              <div key={f.phase}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-medium">{f.phase}</span>
                  <span className="text-xs font-mono text-primary">{f.amount}</span>
                </div>
                <div className="h-3 rounded-full bg-muted overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${f.pct}%` }}
                    transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full bg-gradient-primary"
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-4 pt-3 border-t border-border">
            Source: MoHI&PE Quarterly Release Statement · FY 2025-26
          </p>
        </motion.div>

        {/* Smart city integrations */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Smart City Integrations</h3>
          </div>
          <div className="space-y-2.5">
            {integrations.map((itg, i) => (
              <motion.div
                key={itg.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/10 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <itg.icon className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium">{itg.name}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-success/15 text-success border border-success/30">
                  {itg.status}
                </span>
              </motion.div>
            ))}
          </div>
          <p className="text-[10px] font-mono text-muted-foreground mt-4 pt-3 border-t border-border">
            All integrations comply with CEA Cyber Security Guidelines 2021 · DPDP Act 2023
          </p>
        </motion.div>
      </div>
    </>
  );
}
