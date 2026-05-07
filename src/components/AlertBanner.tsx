import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";

export function AlertBanner() {
  const [open, setOpen] = useState(true);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: "auto" }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          className="relative overflow-hidden border-b border-danger/30 bg-danger/10"
        >
          <div className="absolute inset-0 animate-shimmer pointer-events-none" />
          <div className="relative flex items-center gap-3 px-6 py-2.5 text-sm">
            <span className="flex items-center gap-2 text-danger font-medium">
              <AlertTriangle className="w-4 h-4 animate-glow-pulse" />
              <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-danger/20">Alert</span>
            </span>
            <span className="text-foreground/90">
              High overload risk detected in <strong className="text-danger">Whitefield</strong> · forecast 19:00–22:00 IST
            </span>
            <button onClick={() => setOpen(false)} className="ml-auto p-1 rounded hover:bg-danger/20 transition">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
