import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, Bell, Shield, Database, Palette } from "lucide-react";
import { toast } from "sonner";

const initial = [
  { key: "alerts",   label: "Critical risk alerts",     desc: "Notify on transformer overload risk above 80%", on: true },
  { key: "summary",  label: "Daily AI summary",         desc: "Email summary of grid health every morning",     on: true },
  { key: "shift",    label: "Predictive load shifting", desc: "Auto-suggest load shifts during forecast peaks", on: true },
  { key: "public",   label: "Public dashboard",          desc: "Expose anonymized zone metrics to citizens",     on: false },
  { key: "beta",     label: "Beta features",             desc: "Enable experimental simulation models",         on: false },
];

const groups = [
  { label: "Notifications", icon: Bell,     keys: ["alerts", "summary"] },
  { label: "Automation",    icon: Database, keys: ["shift"] },
  { label: "Workspace",     icon: Palette,  keys: ["public", "beta"] },
];

export default function Settings() {
  const [prefs, setPrefs] = useState(initial);
  const [profile, setProfile] = useState({ name: "Bhavya Chandrashekar", email: "ops.bhavya@bescom.gov.in", phone: "+91 98765 43210" });

  const toggle = (k: string) => setPrefs((p) => p.map((x) => x.key === k ? { ...x, on: !x.on } : x));
  const save = () => toast.success("Preferences saved", { description: "Your changes are live across the workspace" });
  const saveProfile = () => toast.success("Profile updated");
  const rotateKey = () => {
    const key = `gb_live_${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 12)}`;
    navigator.clipboard.writeText(key);
    toast.success("New API key generated", { description: "Copied to clipboard · old key revoked in 24h" });
  };

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Workspace Preferences"
        description="Manage notifications, automations, profile and API access for your GridBrain workspace."
        actions={<Button onClick={save} className="bg-gradient-primary text-primary-foreground"><Save className="w-4 h-4 mr-2" /> Save Changes</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile */}
        <div className="glass rounded-2xl p-5 lg:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold">Profile</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-base font-semibold text-primary-foreground glow-primary">BC</div>
            <div>
              <p className="text-sm font-medium">{profile.name}</p>
              <p className="text-[10px] font-mono text-success">L3 OPERATOR · BESCOM</p>
            </div>
          </div>
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Display name</label>
          <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="mt-1 mb-3" />
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Email</label>
          <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} className="mt-1 mb-3" />
          <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Phone</label>
          <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} className="mt-1 mb-4" />
          <Button onClick={saveProfile} variant="outline" className="w-full glass border-border">Save profile</Button>
        </div>

        {/* Preference groups */}
        <div className="space-y-4 lg:col-span-2">
          {groups.map((g) => (
            <div key={g.label} className="glass rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <g.icon className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-sm">{g.label}</h3>
              </div>
              <div className="space-y-2">
                {prefs.filter((p) => g.keys.includes(p.key)).map((s, i) => (
                  <motion.div key={s.key}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/10 p-3">
                    <div>
                      <p className="text-sm font-medium">{s.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                    </div>
                    <Switch checked={s.on} onCheckedChange={() => toggle(s.key)} />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}

          {/* API */}
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Database className="w-4 h-4 text-primary" />
              <h3 className="font-display font-semibold text-sm">API Access</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Generate a new API key to integrate GridBrain with external SCADA, BI or notification systems.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono px-3 py-2 rounded-md bg-muted/30 border border-border truncate">gb_live_••••••••••••••••••••</code>
              <Button onClick={rotateKey} variant="outline" className="glass border-border">Rotate key</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
