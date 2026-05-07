import { Construction } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";

export default function Placeholder({ title, eyebrow }: { title: string; eyebrow: string }) {
  return (
    <>
      <PageHeader eyebrow={eyebrow} title={title} description="This module is part of the GridBrain.AI roadmap and will be enabled for your tenant." />
      <div className="glass rounded-2xl p-12 flex flex-col items-center justify-center text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
          <Construction className="w-6 h-6 text-primary" />
        </div>
        <p className="font-display text-lg">Coming soon</p>
        <p className="text-sm text-muted-foreground mt-1 max-w-md">
          Reach out to your BESCOM admin or GridBrain support to enable this module for your operator group.
        </p>
      </div>
    </>
  );
}
