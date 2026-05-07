import { motion } from "framer-motion";
import { FileText, Download, FileSpreadsheet, FileBarChart, Calendar } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { downloadText, downloadCSV, generateReportText } from "@/lib/download";
import { toast } from "sonner";

const reports = [
  { id: "RPT-2026-0451", title: "Daily Grid Operations Brief", desc: "24h load, peaks, alerts & recommendations.", date: "06 May 2026", size: "2.4 MB", type: "PDF", icon: FileText, freq: "Daily" },
  { id: "RPT-2026-0450", title: "Weekly Risk & Capacity Review", desc: "Risk distribution, transformer headroom, capex hints.", date: "05 May 2026", size: "5.1 MB", type: "PDF", icon: FileBarChart, freq: "Weekly" },
  { id: "RPT-2026-0449", title: "Monthly Substation Health Sheet", desc: "Per-substation KPIs, anomalies & maintenance windows.", date: "01 May 2026", size: "8.7 MB", type: "XLSX", icon: FileSpreadsheet, freq: "Monthly" },
  { id: "RPT-2026-0448", title: "Quarterly Regulatory Filing (KERC)", desc: "ARR-aligned EV load, DSM impact & ToU outcomes.", date: "01 Apr 2026", size: "12.3 MB", type: "PDF", icon: FileText, freq: "Quarterly" },
  { id: "RPT-2026-0447", title: "EV Adoption Impact Study", desc: "Zone-wise growth, charger gap & infra recommendations.", date: "28 Apr 2026", size: "6.2 MB", type: "PDF", icon: FileBarChart, freq: "Ad-hoc" },
  { id: "RPT-2026-0446", title: "ToU Pilot Performance", desc: "Off-peak shift adoption, demand smoothing, savings.", date: "22 Apr 2026", size: "3.9 MB", type: "PDF", icon: FileText, freq: "Ad-hoc" },
];

export default function Reports() {
  const handleDownload = (r: typeof reports[number]) => {
    if (r.type === "XLSX") {
      downloadCSV(`${r.id}-${r.title.replace(/\s+/g, "_")}.csv`, [
        ["Substation", "Load (MW)", "Capacity (MW)", "Utilization", "Risk", "Status"],
        ["WHF-220kV", 18.4, 22, "84%", 92, "HIGH"],
        ["KOR-110kV", 14.1, 20, "71%", 74, "HIGH"],
        ["IND-66kV", 11.6, 18, "64%", 61, "MEDIUM"],
        ["ECY-220kV", 16.8, 21, "80%", 81, "HIGH"],
        ["HBL-110kV", 7.4, 16, "46%", 38, "LOW"],
      ]);
    } else {
      downloadText(`${r.id}-${r.title.replace(/\s+/g, "_")}.txt`, generateReportText(r));
    }
    toast.success(`${r.id} downloaded`, { description: r.title });
  };

  const schedule = () => toast.success("Report schedule updated", { description: "Daily brief at 06:00 IST" });

  return (
    <>
      <PageHeader
        eyebrow="Governance"
        title="Reports & Briefings"
        description="Auto-generated, regulator-ready reports. Filed against KERC, CEA and BESCOM compliance schedules."
        actions={<Button onClick={schedule} className="bg-gradient-primary text-primary-foreground"><Calendar className="w-4 h-4 mr-2" /> Schedule</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Reports YTD", v: "451", s: "+38 this month" },
          { l: "Pending review", v: "3", s: "BESCOM ops" },
          { l: "Auto-filed", v: "98.4%", s: "regulator submissions" },
          { l: "Avg. SLA", v: "1.2h", s: "well under 6h target" },
        ].map((k) => (
          <div key={k.l} className="glass rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{k.l}</p>
            <p className="font-display text-2xl mt-1">{k.v}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{k.s}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl p-4 flex flex-wrap items-center gap-4 hover:border-primary/30 transition-colors"
          >
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <r.icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-display font-semibold">{r.title}</p>
                <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{r.freq}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{r.desc}</p>
              <p className="text-[10px] font-mono text-muted-foreground mt-1">{r.id} · {r.date} · {r.size} · {r.type}</p>
            </div>
            <Button variant="outline" size="sm" className="glass border-border" onClick={() => handleDownload(r)}>
              <Download className="w-3.5 h-3.5 mr-2" /> Download
            </Button>
          </motion.div>
        ))}
      </div>
    </>
  );
}
