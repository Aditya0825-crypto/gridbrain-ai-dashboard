import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Activity, AlertTriangle, Clock, Gauge } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { BengaluruMap } from "@/components/BengaluruMap";
import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { PageHeader } from "@/components/PageHeader";
import { forecast24, loadCurve, zones } from "@/data/mock";

const chartTooltip = {
  contentStyle: {
    background: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "12px",
    fontSize: "12px",
    fontFamily: "DM Sans",
  },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontSize: "11px" },
};

export default function Overview() {
  const totalLoad = zones.reduce((s, z) => s + z.load, 0).toFixed(1);
  const highRisk = zones.filter((z) => z.riskScore >= 70).length;

  const zoneBars = zones.map((z) => ({ name: z.name.split(" ")[0], load: z.load, capacity: z.capacity }));

  return (
    <>
      <PageHeader
        eyebrow="Grid Intelligence"
        title="Grid Intelligence Overview"
        description="Real-time view of EV charging demand, transformer health, and forecast risk across the Bengaluru grid."
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total EV Load" value={totalLoad} unit="MW" delta="▲ 12.4% vs yesterday" trend="up" icon={<Activity className="w-5 h-5" />} accent="primary" delay={0} />
        <KpiCard label="Active Risk Zones" value={String(highRisk)} unit="of 12" delta="▲ 2 new today" trend="down" icon={<AlertTriangle className="w-5 h-5" />} accent="danger" delay={0.05} />
        <KpiCard label="Peak Load Time" value="20:15" unit="IST" delta="Δ −15 min vs forecast" trend="neutral" icon={<Clock className="w-5 h-5" />} accent="accent" delay={0.1} />
        <KpiCard label="Stability Score" value="86" unit="/100" delta="▲ 4.2 last 24h" trend="up" icon={<Gauge className="w-5 h-5" />} accent="success" delay={0.15} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">EV Load · Predicted vs Actual</h3>
              <p className="text-xs text-muted-foreground">Last 24 hours · MW</p>
            </div>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary" />Actual</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent" />Predicted</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={loadCurve}>
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip {...chartTooltip} />
              <Line type="monotone" dataKey="actual" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="predicted" stroke="hsl(var(--accent))" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <div className="mb-4">
            <h3 className="font-display font-semibold">Demand Forecast</h3>
            <p className="text-xs text-muted-foreground">Next 24 hours · confidence band</p>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={forecast24}>
              <defs>
                <linearGradient id="g2" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--secondary))" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={3} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip {...chartTooltip} />
              <Area type="monotone" dataKey="confidence" stroke="none" fill="url(#g2)" />
              <Area type="monotone" dataKey="forecast" stroke="hsl(var(--secondary))" strokeWidth={2.5} fill="none" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Heatmap + AI */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">Live Risk Heatmap</h3>
                <p className="text-xs text-muted-foreground">Bengaluru · 12 monitored zones</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-primary/10 text-primary border border-primary/30">REAL-TIME</span>
            </div>
            <BengaluruMap height="h-[420px]" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <AiInsightsPanel />
        </motion.div>
      </div>

      {/* Zone bars */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-semibold">Zone Load vs Capacity</h3>
            <p className="text-xs text-muted-foreground">All zones · MW</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={zoneBars}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip {...chartTooltip} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
            <Bar dataKey="capacity" fill="hsl(var(--muted))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="load" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </>
  );
}
