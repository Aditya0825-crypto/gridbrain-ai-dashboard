import { motion } from "framer-motion";
import { ScrollText, ShieldCheck, Search, Download } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { downloadCSV } from "@/lib/download";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const events = [
  { ts: "2026-05-06 14:42:11", actor: "ops.kumar@bescom.gov.in",   action: "Acknowledged alert",     target: "Whitefield · OVL-19:30",   sev: "high",   hash: "a91f…7c2e" },
  { ts: "2026-05-06 14:38:02", actor: "system.gridbrain",          action: "Generated recommendation", target: "Sarjapur · ToU nudge",     sev: "medium", hash: "b22c…118f" },
  { ts: "2026-05-06 14:30:55", actor: "model.RiskClassifier@3.1",  action: "Risk score updated",     target: "All zones (12)",            sev: "info",   hash: "f87a…0d31" },
  { ts: "2026-05-06 14:22:09", actor: "ops.shreya@bescom.gov.in",  action: "Approved load shift",    target: "Koramangala → off-peak",    sev: "medium", hash: "c104…aa56" },
  { ts: "2026-05-06 13:55:41", actor: "system.scada",              action: "Telemetry sync",         target: "220kV ECY substation",      sev: "info",   hash: "d550…ee01" },
  { ts: "2026-05-06 13:47:22", actor: "auditor.kerc",              action: "Read-only export",       target: "Quarterly filing Q1-26",    sev: "info",   hash: "9921…bb73" },
  { ts: "2026-05-06 13:30:08", actor: "system.gridbrain",          action: "Model retrained",         target: "DemandForecaster v4.2.1",   sev: "info",   hash: "771e…3a90" },
  { ts: "2026-05-06 13:11:45", actor: "ops.kumar@bescom.gov.in",   action: "Login",                  target: "Web · 10.42.18.221",        sev: "info",   hash: "0a4d…91cc" },
];

const sevTone = {
  high:   "bg-danger/15 text-danger border-danger/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  info:   "bg-muted text-muted-foreground border-border",
};

export default function Audit() {
  const [q, setQ] = useState("");
  const filtered = events.filter((e) => !q || [e.actor, e.action, e.target, e.hash, e.sev].join(" ").toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => {
    downloadCSV("gridbrain-audit-log.csv", [
      ["Timestamp", "Actor", "Action", "Target", "Severity", "Hash"],
      ...events.map((e) => [e.ts, e.actor, e.action, e.target, e.sev, e.hash]),
    ]);
    toast.success("Audit log exported");
  };
  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Audit Log"
        description="Tamper-evident, append-only ledger of every operator and AI action. Hash-chained for regulator review."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-success/15 text-success border border-success/30 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3" /> CHAIN INTEGRITY · OK
            </span>
            <Button onClick={exportCsv} variant="outline" size="sm" className="glass border-border"><Download className="w-3.5 h-3.5 mr-2" /> Export CSV</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Events (24h)", v: "1,284" },
          { l: "Operators active", v: "9" },
          { l: "AI decisions logged", v: "612" },
          { l: "Chain depth", v: "248,710" },
        ].map((k) => (
          <div key={k.l} className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{k.l}</p>
            <p className="font-display text-2xl mt-1">{k.v}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold">Recent Activity</h3>
          </div>
          <div className="flex items-center gap-2 glass rounded-md px-2.5 py-1.5 w-72 max-w-full">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} className="bg-transparent outline-none text-xs flex-1 placeholder:text-muted-foreground"
              placeholder="Filter actor, action, hash…" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 font-medium">Timestamp</th>
                <th className="text-left py-2.5 font-medium">Actor</th>
                <th className="text-left py-2.5 font-medium">Action</th>
                <th className="text-left py-2.5 font-medium">Target</th>
                <th className="text-left py-2.5 font-medium">Severity</th>
                <th className="text-left py-2.5 font-medium">Hash</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e, i) => (
                <motion.tr key={i} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/40 hover:bg-muted/20"
                >
                  <td className="py-2.5 font-mono text-xs text-muted-foreground">{e.ts}</td>
                  <td className="py-2.5 font-mono text-xs">{e.actor}</td>
                  <td className="py-2.5 text-xs">{e.action}</td>
                  <td className="py-2.5 text-xs text-muted-foreground">{e.target}</td>
                  <td className="py-2.5">
                    <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border", sevTone[e.sev as keyof typeof sevTone])}>
                      {e.sev}
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-xs text-primary">{e.hash}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
