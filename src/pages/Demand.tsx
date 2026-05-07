import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { zones } from "@/data/mock";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const tt = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontSize: "11px" },
};

function genTrend(seed: number) {
  return Array.from({ length: 24 }, (_, h) => {
    const base = 8 + 6 * Math.sin(((h - 6) / 24) * Math.PI * 2);
    const evening = 9 * Math.exp(-Math.pow((h - 20) / 2.5, 2));
    return { time: `${String(h).padStart(2, "0")}:00`, demand: Math.max(2, +(base + evening + (seed % 3)).toFixed(1)) };
  });
}

const weekly = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => ({
  day: d, weekday: 60 + i * 4 + Math.random() * 8, weekend: 75 + Math.random() * 12,
}));

export default function Demand() {
  const [zoneId, setZoneId] = useState(zones[0].id);
  const zone = zones.find((z) => z.id === zoneId)!;
  const trend = useMemo(() => genTrend(zone.riskScore), [zone]);

  return (
    <>
      <PageHeader
        eyebrow="Demand Analytics"
        title="Charging Demand Patterns"
        description="Hourly trends, peak windows, and behavioral usage patterns by zone."
        actions={
          <Select value={zoneId} onValueChange={setZoneId}>
            <SelectTrigger className="w-[200px] glass border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {zones.map((z) => <SelectItem key={z.id} value={z.id}>{z.name}</SelectItem>)}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Current Load", v: `${zone.load}`, u: "MW" },
          { label: "Peak Hour", v: zone.peakTime, u: "IST" },
          { label: "YoY Growth", v: `+${zone.growth}%`, u: "" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <p className="text-xs uppercase text-muted-foreground tracking-wider">{s.label}</p>
            <p className="font-display text-2xl mt-2 text-gradient">{s.v} <span className="text-sm text-muted-foreground">{s.u}</span></p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 lg:col-span-2"
        >
          <h3 className="font-display font-semibold mb-1">{zone.name} · 24h Demand</h3>
          <p className="text-xs text-muted-foreground mb-4">Hourly load · MW</p>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="dg" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
              <Tooltip {...tt} />
              <Area type="monotone" dataKey="demand" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#dg)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <AiInsightsPanel compact />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="font-display font-semibold mb-1">Weekday vs Weekend Pattern</h3>
        <p className="text-xs text-muted-foreground mb-4">Avg daily load · MW</p>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weekly}>
            <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
            <Tooltip {...tt} cursor={{ fill: "hsl(var(--muted) / 0.3)" }} />
            <Bar dataKey="weekday" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            <Bar dataKey="weekend" fill="hsl(var(--accent))" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </>
  );
}
