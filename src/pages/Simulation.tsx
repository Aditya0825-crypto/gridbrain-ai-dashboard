import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/PageHeader";
import { BengaluruMap } from "@/components/BengaluruMap";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { forecast24, zones as baseZones } from "@/data/mock";
import { FlaskConical, Sparkles, RotateCcw, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Behavior = "normal" | "peak-shift" | "off-peak";

const tt = {
  contentStyle: { background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" },
  labelStyle: { color: "hsl(var(--muted-foreground))", fontSize: "11px" },
};

export default function Simulation() {
  const [growth, setGrowth] = useState(50); // 0-100
  const [behavior, setBehavior] = useState<Behavior>("normal");
  const [chargersDelta, setChargersDelta] = useState(0);

  const reset = () => { setGrowth(50); setBehavior("normal"); setChargersDelta(0); };

  const growthMul = 0.7 + (growth / 100) * 0.9; // 0.7x → 1.6x

  const simulated = useMemo(() => {
    return forecast24.map((p) => {
      const h = parseInt(p.time);
      let val = p.forecast * growthMul;
      if (behavior === "peak-shift") {
        // smear evening peak earlier
        if (h >= 18 && h <= 22) val *= 0.78;
        if (h >= 14 && h <= 17) val *= 1.18;
      } else if (behavior === "off-peak") {
        if (h >= 18 && h <= 22) val *= 0.65;
        if (h >= 0 && h <= 5) val *= 1.45;
      }
      // chargers reduce per-charger queue stress slightly (as proxy)
      val *= 1 - Math.max(-0.15, Math.min(0.12, chargersDelta * 0.012));
      return { ...p, simulated: +val.toFixed(1) };
    });
  }, [growthMul, behavior, chargersDelta]);

  const simZones = useMemo(() => {
    return baseZones.map((z) => {
      let load = z.load * growthMul;
      if (behavior === "off-peak") load *= 0.85;
      if (behavior === "peak-shift") load *= 0.93;
      load *= 1 - Math.max(-0.1, Math.min(0.08, chargersDelta * 0.008));
      const util = (load / z.capacity) * 100;
      const riskScore = Math.min(100, Math.max(5, Math.round(util * 0.95)));
      return { ...z, load: +load.toFixed(1), riskScore };
    });
  }, [growthMul, behavior, chargersDelta]);

  const peak = simulated.reduce((m, p) => (p.simulated > m.simulated ? p : m), simulated[0]);
  const newRisk = simZones.filter((z) => z.riskScore >= 70).length;

  const recommendation =
    growth > 70 && behavior === "normal"
      ? "EV growth ahead of grid capacity — recommend immediate transformer upgrade in top 3 risk zones."
      : behavior === "off-peak"
      ? "Off-peak shift reduces evening peak by ~35%. Recommend ToU pricing rollout citywide."
      : behavior === "peak-shift"
      ? "Behavioral peak-shift smooths the curve. Expand workplace charging incentives."
      : chargersDelta > 5
      ? "Adequate charger expansion. Monitor for induced demand within 90 days."
      : "Baseline scenario. Maintain current monitoring cadence.";

  return (
    <>
      <PageHeader
        eyebrow="Simulation Lab"
        title="Grid Scenario Simulator"
        description="Model EV growth, behavioral changes, and infrastructure upgrades. See impact across the entire grid in real time."
        actions={
          <Button variant="outline" onClick={reset} className="glass border-border">
            <RotateCcw className="w-3.5 h-3.5 mr-2" /> Reset
          </Button>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Controls */}
        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
          className="glass rounded-2xl p-6 space-y-7"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
              <FlaskConical className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-display font-semibold">Scenario Controls</h3>
              <p className="text-xs text-muted-foreground">Adjust to model the grid</p>
            </div>
          </div>

          {/* growth slider */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">EV Adoption Growth</label>
              <span className="font-mono text-xs text-primary">{growthMul.toFixed(2)}×</span>
            </div>
            <Slider value={[growth]} onValueChange={(v) => setGrowth(v[0])} max={100} step={1} />
            <div className="flex justify-between mt-1.5 text-[10px] font-mono text-muted-foreground uppercase">
              <span>Low</span><span>Baseline</span><span>Aggressive</span>
            </div>
          </div>

          {/* behavior */}
          <div>
            <label className="text-sm font-medium block mb-2">Charging Behavior</label>
            <Select value={behavior} onValueChange={(v: Behavior) => setBehavior(v)}>
              <SelectTrigger className="glass border-border"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal (current)</SelectItem>
                <SelectItem value="peak-shift">Peak Shift (workplace)</SelectItem>
                <SelectItem value="off-peak">Off-Peak Incentive (ToU)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* chargers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">Infrastructure Δ</label>
              <span className="font-mono text-xs text-accent">{chargersDelta > 0 ? `+${chargersDelta}` : chargersDelta} chargers</span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => setChargersDelta((c) => Math.max(-50, c - 1))} className="glass border-border shrink-0 hover:bg-primary/10 hover:text-primary active:scale-95 transition">
                <Minus className="w-4 h-4" />
              </Button>
              <input
                type="number"
                value={chargersDelta}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  setChargersDelta(isNaN(v) ? 0 : Math.max(-50, Math.min(50, v)));
                }}
                className="flex-1 h-10 glass rounded-md text-center font-mono text-lg bg-transparent border border-border outline-none focus:ring-2 focus:ring-primary/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => setChargersDelta((c) => Math.min(50, c + 1))} className="glass border-border shrink-0 hover:bg-primary/10 hover:text-primary active:scale-95 transition">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] font-mono text-muted-foreground uppercase">Add or remove chargers (−50 to +50)</p>
          </div>

          {/* output stats */}
          <div className="pt-4 border-t border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Projected Peak</span>
              <span className="font-mono text-sm text-primary">{peak.simulated} MW @ {peak.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">High Risk Zones</span>
              <span className={cn("font-mono text-sm", newRisk > 4 ? "text-danger" : newRisk > 2 ? "text-warning" : "text-success")}>{newRisk} zones</span>
            </div>
          </div>
        </motion.div>

        {/* Output map + chart */}
        <div className="xl:col-span-2 space-y-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display font-semibold">Simulated Grid Risk</h3>
                <p className="text-xs text-muted-foreground">Live response to your scenario</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-accent/15 text-accent border border-accent/30">SIMULATING</span>
            </div>
            <BengaluruMap zones={simZones} height="h-[320px]" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <div className="mb-3">
              <h3 className="font-display font-semibold">Forecast vs Simulated</h3>
              <p className="text-xs text-muted-foreground">Next 24h · MW</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={simulated}>
                <defs>
                  <linearGradient id="sg1" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="sg2" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 6" vertical={false} />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={10} interval={2} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <Tooltip {...tt} />
                <Area type="monotone" dataKey="forecast" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#sg1)" />
                <Area type="monotone" dataKey="simulated" stroke="hsl(var(--accent))" strokeWidth={2.5} fill="url(#sg2)" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </div>

      {/* recommendation */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-6 border-primary/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-aurora opacity-50 pointer-events-none" />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-primary mb-1">GridBrain Recommendation</p>
            <p className="font-display text-lg leading-snug">{recommendation}</p>
          </div>
        </div>
      </motion.div>
    </>
  );
}
