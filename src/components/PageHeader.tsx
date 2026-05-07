import { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6"
    >
      <div>
        {eyebrow && (
          <p className="text-xs font-mono uppercase tracking-[0.2em] text-primary mb-2">{eyebrow}</p>
        )}
        <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
          <span className="text-gradient">{title}</span>
        </h1>
        {description && <p className="text-muted-foreground mt-2 max-w-2xl">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </motion.div>
  );
}
