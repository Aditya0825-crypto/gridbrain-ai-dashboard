import { useState } from "react";
import { motion } from "framer-motion";
import { zones as defaultZones, riskColor, type Zone } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Props {
  zones?: Zone[];
  height?: string;
  onSelect?: (z: Zone) => void;
  selectedId?: string;
}

const levelToHsl = {
  high: "hsl(var(--danger))",
  medium: "hsl(var(--warning))",
  low: "hsl(var(--success))",
};

export function HeatmapMap({ zones = defaultZones, height = "h-[420px]", onSelect, selectedId }: Props) {
  const [hover, setHover] = useState<Zone | null>(null);

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl glass bg-grid", height)}>
      {/* aurora wash */}
      <div className="absolute inset-0 bg-aurora opacity-60 pointer-events-none" />

      {/* abstract roads */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id="road" x1="0" x2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
            <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="0.35" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path d="M 0 50 Q 30 30 55 55 T 100 45" stroke="url(#road)" strokeWidth="0.3" fill="none" />
        <path d="M 50 0 Q 45 40 55 60 T 60 100" stroke="url(#road)" strokeWidth="0.3" fill="none" />
        <path d="M 10 80 Q 40 70 70 85 T 100 80" stroke="url(#road)" strokeWidth="0.25" fill="none" />
        <path d="M 0 20 Q 30 35 60 25 T 100 30" stroke="url(#road)" strokeWidth="0.25" fill="none" />
      </svg>

      {/* zones */}
      {zones.map((z, i) => {
        const level = riskColor(z.riskScore);
        const color = levelToHsl[level];
        const radius = 36 + (z.load / 25) * 28;
        const isSelected = selectedId === z.id;
        return (
          <motion.button
            key={z.id}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i, type: "spring", stiffness: 180, damping: 18 }}
            onClick={() => onSelect?.(z)}
            onMouseEnter={() => setHover(z)}
            onMouseLeave={() => setHover(null)}
            className="absolute -translate-x-1/2 -translate-y-1/2 group focus:outline-none"
            style={{ left: `${z.x}%`, top: `${z.y}%`, width: radius, height: radius }}
          >
            <span
              className="absolute inset-0 rounded-full blur-xl opacity-70 group-hover:opacity-100 transition-opacity"
              style={{ background: color }}
            />
            <span
              className="absolute inset-[22%] rounded-full opacity-90"
              style={{ background: color, boxShadow: `0 0 24px ${color}` }}
            />
            <span
              className={cn(
                "absolute inset-[38%] rounded-full bg-background/80 border-2",
                isSelected && "ring-2 ring-primary"
              )}
              style={{ borderColor: color }}
            />
            {level === "high" && (
              <span
                className="absolute inset-[22%] rounded-full animate-ping opacity-50"
                style={{ background: color }}
              />
            )}
          </motion.button>
        );
      })}

      {/* tooltip */}
      {hover && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute glass-strong rounded-xl p-3 text-xs pointer-events-none z-10 min-w-[180px]"
          style={{
            left: `min(${hover.x}%, calc(100% - 200px))`,
            top: `calc(${hover.y}% + 30px)`,
          }}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-display font-semibold text-sm text-foreground">{hover.name}</span>
            <span
              className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded"
              style={{ background: levelToHsl[riskColor(hover.riskScore)] + "20", color: levelToHsl[riskColor(hover.riskScore)] }}
            >
              {riskColor(hover.riskScore)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-muted-foreground">
            <span>Load</span><span className="font-mono text-foreground text-right">{hover.load} MW</span>
            <span>Capacity</span><span className="font-mono text-foreground text-right">{hover.capacity} MW</span>
            <span>Risk</span><span className="font-mono text-foreground text-right">{hover.riskScore}</span>
            <span>Peak</span><span className="font-mono text-foreground text-right">{hover.peakTime}</span>
          </div>
        </motion.div>
      )}

      {/* legend */}
      <div className="absolute bottom-3 left-3 glass-strong rounded-lg px-3 py-2 flex items-center gap-3 text-[11px]">
        <span className="text-muted-foreground uppercase tracking-wider mr-1">Risk</span>
        {(["low", "medium", "high"] as const).map((l) => (
          <span key={l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: levelToHsl[l], boxShadow: `0 0 8px ${levelToHsl[l]}` }} />
            <span className="capitalize text-foreground">{l}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
