import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: string;
  trend?: "up" | "down" | "neutral";
  icon: ReactNode;
  accent?: "primary" | "secondary" | "accent" | "warning" | "success" | "danger";
  delay?: number;
}

const accentMap = {
  primary: "from-primary/30 to-primary/0 text-primary",
  secondary: "from-secondary/30 to-secondary/0 text-secondary",
  accent: "from-accent/30 to-accent/0 text-accent",
  warning: "from-warning/30 to-warning/0 text-warning",
  success: "from-success/30 to-success/0 text-success",
  danger: "from-danger/30 to-danger/0 text-danger",
};

export function KpiCard({ label, value, unit, delta, trend = "neutral", icon, accent = "primary", delay = 0 }: KpiCardProps) {
  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="glass relative overflow-hidden rounded-2xl p-5 group hover:border-primary/40 transition-colors"
    >
      <div className={cn("absolute -top-12 -right-12 w-40 h-40 rounded-full bg-gradient-to-br blur-2xl opacity-60 group-hover:opacity-90 transition-opacity", accentMap[accent])} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="font-display text-3xl font-semibold text-foreground tabular-nums">{value}</span>
            {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
          </div>
          {delta && (
            <p className={cn("mt-2 text-xs font-medium font-mono", trendColor)}>{delta}</p>
          )}
        </div>
        <div className={cn("w-11 h-11 rounded-xl glass-strong flex items-center justify-center", accentMap[accent].split(" ").pop())}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}
