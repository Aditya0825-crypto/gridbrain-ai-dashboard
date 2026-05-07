import { motion } from "framer-motion";
import { Sparkles, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { aiInsights } from "@/data/mock";
import { cn } from "@/lib/utils";

const iconMap = {
  high: AlertTriangle,
  medium: TrendingUp,
  low: Lightbulb,
};

const sevColor = {
  high: "text-danger bg-danger/10 border-danger/30",
  medium: "text-warning bg-warning/10 border-warning/30",
  low: "text-success bg-success/10 border-success/30",
};

export function AiInsightsPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="glass rounded-2xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center glow-primary">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-sm">AI Recommendations</h3>
          <p className="text-[11px] text-muted-foreground">GridBrain assistant · live</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" /> ONLINE
        </span>
      </div>

      <div className={cn("space-y-3 overflow-auto pr-1", compact ? "max-h-[280px]" : "flex-1")}>
        {aiInsights.map((ins, i) => {
          const Icon = iconMap[ins.severity as keyof typeof iconMap];
          return (
            <motion.div
              key={ins.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className={cn(
                "rounded-xl border p-3 transition-colors hover:bg-muted/30",
                sevColor[ins.severity as keyof typeof sevColor]
              )}
            >
              <div className="flex items-start gap-2.5">
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground leading-tight">{ins.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{ins.body}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
