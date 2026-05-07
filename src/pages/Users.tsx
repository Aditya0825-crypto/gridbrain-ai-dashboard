import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Users as UsersIcon, Shield, UserPlus, Search, Trash2, X, KeyRound, Mail, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Role = "Admin" | "L3 Operator" | "L2 Analyst" | "L1 Viewer" | "Auditor";
interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  team: string;
  status: "active" | "invited" | "suspended";
  lastActive: string;
  mfa: boolean;
}

const seed: User[] = [
  { id: "u1", name: "Bhavya Chandrashekar", email: "ops.bhavya@bescom.gov.in", role: "Admin",       team: "Grid Ops",   status: "active",    lastActive: "2 min ago",  mfa: true  },
  { id: "u2", name: "Arjun Kumar",          email: "ops.kumar@bescom.gov.in",  role: "L3 Operator", team: "Grid Ops",   status: "active",    lastActive: "14 min ago", mfa: true  },
  { id: "u3", name: "Shreya Iyer",          email: "ops.shreya@bescom.gov.in", role: "L3 Operator", team: "Risk Desk",  status: "active",    lastActive: "1 hr ago",   mfa: true  },
  { id: "u4", name: "Rohan Mehta",          email: "an.rohan@bescom.gov.in",   role: "L2 Analyst",  team: "Forecasting",status: "active",    lastActive: "3 hr ago",   mfa: true  },
  { id: "u5", name: "Divya Rao",            email: "an.divya@bescom.gov.in",   role: "L2 Analyst",  team: "Infra Plan", status: "active",    lastActive: "yesterday",  mfa: false },
  { id: "u6", name: "Karthik Sundar",       email: "view.karthik@bescom.gov.in", role: "L1 Viewer", team: "Field Ops",  status: "active",    lastActive: "2 days ago", mfa: false },
  { id: "u7", name: "KERC Auditor",         email: "auditor@kerc.kar.gov.in",  role: "Auditor",     team: "Regulator",  status: "active",    lastActive: "5 days ago", mfa: true  },
  { id: "u8", name: "Priya Nair",           email: "priya.nair@bescom.gov.in", role: "L2 Analyst",  team: "Forecasting",status: "invited",   lastActive: "—",          mfa: false },
];

const roleTone: Record<Role, string> = {
  "Admin":        "bg-danger/15 text-danger border-danger/30",
  "L3 Operator":  "bg-primary/15 text-primary border-primary/30",
  "L2 Analyst":   "bg-accent/15 text-accent border-accent/30",
  "L1 Viewer":    "bg-muted text-muted-foreground border-border",
  "Auditor":      "bg-warning/15 text-warning border-warning/30",
};

const permissions = [
  { area: "Risk Intelligence",   admin: true,  l3: true,  l2: true,  l1: "view" as const, audit: "view" as const },
  { area: "Approve load-shift",  admin: true,  l3: true,  l2: false, l1: false,           audit: false           },
  { area: "Infrastructure plan", admin: true,  l3: true,  l2: true,  l1: "view" as const, audit: "view" as const },
  { area: "Notify EV Mitra",     admin: true,  l3: true,  l2: false, l1: false,           audit: false           },
  { area: "Generate reports",    admin: true,  l3: true,  l2: true,  l1: false,           audit: true            },
  { area: "Modify users / RBAC", admin: true,  l3: false, l2: false, l1: false,           audit: false           },
  { area: "Read audit log",      admin: true,  l3: true,  l2: true,  l1: false,           audit: true            },
];

const Cell = ({ v }: { v: boolean | "view" }) =>
  v === true ? <CheckCircle2 className="w-4 h-4 text-success mx-auto" /> :
  v === "view" ? <span className="text-[10px] font-mono text-warning">view</span> :
  <span className="text-muted-foreground/40">—</span>;

export default function Users() {
  const [users, setUsers] = useState<User[]>(seed);
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>("L2 Analyst");

  const filtered = users.filter((u) =>
    [u.name, u.email, u.role, u.team].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  const invite = () => {
    if (!inviteEmail.includes("@")) { toast.error("Enter a valid email"); return; }
    const newUser: User = {
      id: `u${Date.now()}`,
      name: inviteEmail.split("@")[0].replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: inviteEmail, role: inviteRole, team: "Pending",
      status: "invited", lastActive: "—", mfa: false,
    };
    setUsers((u) => [newUser, ...u]);
    setInviteEmail(""); setShowInvite(false);
    toast.success("Invitation sent", { description: `${inviteEmail} · ${inviteRole}` });
  };

  const remove = (id: string) => {
    setUsers((u) => u.filter((x) => x.id !== id));
    toast("User removed");
  };

  const resetMfa = (u: User) => toast.success(`MFA reset link sent to ${u.email}`);
  const sendPwReset = (u: User) => toast.success(`Password reset link sent to ${u.email}`);

  return (
    <>
      <PageHeader
        eyebrow="System"
        title="Users & Roles"
        description="Manage operator accounts, role-based access control, and clearance levels for BESCOM personnel."
        actions={
          <Button onClick={() => setShowInvite(true)} className="bg-gradient-primary text-primary-foreground">
            <UserPlus className="w-4 h-4 mr-2" /> Invite User
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { l: "Total users", v: String(users.length), i: UsersIcon },
          { l: "Active sessions", v: "9", i: CheckCircle2 },
          { l: "MFA coverage", v: `${Math.round(users.filter(u=>u.mfa).length/users.length*100)}%`, i: Shield },
          { l: "Role classes", v: "5", i: KeyRound },
        ].map((k) => (
          <div key={k.l} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{k.l}</p>
              <k.i className="w-3.5 h-3.5 text-primary" />
            </div>
            <p className="font-display text-2xl mt-1">{k.v}</p>
          </div>
        ))}
      </div>

      {/* User table */}
      <div className="glass rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <h3 className="font-display font-semibold">Personnel Directory</h3>
          <div className="flex items-center gap-2 glass rounded-md px-2.5 py-1.5 w-72 max-w-full">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, email, role…"
              className="bg-transparent outline-none text-xs flex-1 placeholder:text-muted-foreground" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 font-medium">User</th>
                <th className="text-left py-2.5 font-medium">Role</th>
                <th className="text-left py-2.5 font-medium">Team</th>
                <th className="text-left py-2.5 font-medium">Status</th>
                <th className="text-left py-2.5 font-medium">MFA</th>
                <th className="text-left py-2.5 font-medium">Last active</th>
                <th className="text-right py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr key={u.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/40 hover:bg-muted/20"
                >
                  <td className="py-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-[10px] font-semibold text-primary-foreground">
                        {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{u.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded border", roleTone[u.role])}>{u.role}</span>
                  </td>
                  <td className="py-2.5 text-xs text-muted-foreground">{u.team}</td>
                  <td className="py-2.5">
                    <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border",
                      u.status === "active" ? "bg-success/15 text-success border-success/30"
                      : u.status === "invited" ? "bg-warning/15 text-warning border-warning/30"
                      : "bg-muted text-muted-foreground border-border")}>{u.status}</span>
                  </td>
                  <td className="py-2.5">
                    <Switch checked={u.mfa} onCheckedChange={(v) => {
                      setUsers((all) => all.map((x) => x.id === u.id ? { ...x, mfa: v } : x));
                      toast(v ? `MFA enforced for ${u.name}` : `MFA disabled for ${u.name}`);
                    }} />
                  </td>
                  <td className="py-2.5 text-xs font-mono text-muted-foreground">{u.lastActive}</td>
                  <td className="py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => sendPwReset(u)} title="Send password reset"
                        className="w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <KeyRound className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => resetMfa(u)} title="Reset MFA"
                        className="w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground">
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => remove(u.id)} title="Remove"
                        className="w-7 h-7 rounded hover:bg-danger/10 flex items-center justify-center text-muted-foreground hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-6 text-center text-xs text-muted-foreground">No matching users</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RBAC matrix */}
      <div className="glass rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold">Role Permission Matrix</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="text-left py-2.5 font-medium">Capability</th>
                <th className="py-2.5 font-medium">Admin</th>
                <th className="py-2.5 font-medium">L3 Operator</th>
                <th className="py-2.5 font-medium">L2 Analyst</th>
                <th className="py-2.5 font-medium">L1 Viewer</th>
                <th className="py-2.5 font-medium">Auditor</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map((p) => (
                <tr key={p.area} className="border-b border-border/40">
                  <td className="py-2.5 text-xs">{p.area}</td>
                  <td className="py-2.5 text-center"><Cell v={p.admin} /></td>
                  <td className="py-2.5 text-center"><Cell v={p.l3} /></td>
                  <td className="py-2.5 text-center"><Cell v={p.l2} /></td>
                  <td className="py-2.5 text-center"><Cell v={p.l1} /></td>
                  <td className="py-2.5 text-center"><Cell v={p.audit} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setShowInvite(false)}
          >
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-[460px] max-w-[calc(100vw-2rem)] border border-primary/20"
              style={{ boxShadow: "0 0 60px hsl(187 92% 48% / 0.15)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                    <Mail className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <h3 className="font-display font-semibold">Invite User</h3>
                </div>
                <button onClick={() => setShowInvite(false)} className="w-7 h-7 rounded hover:bg-muted/50 flex items-center justify-center">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Email</label>
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@bescom.gov.in" className="mt-1 mb-3" />
              <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Role</label>
              <div className="grid grid-cols-2 gap-2 mt-1 mb-4">
                {(["Admin", "L3 Operator", "L2 Analyst", "L1 Viewer", "Auditor"] as Role[]).map((r) => (
                  <button key={r} onClick={() => setInviteRole(r)}
                    className={cn("text-xs px-2.5 py-1.5 rounded-md border transition",
                      inviteRole === r ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >{r}</button>
                ))}
              </div>
              <Button onClick={invite} className="w-full bg-gradient-primary text-primary-foreground">
                <Mail className="w-4 h-4 mr-2" /> Send Invitation
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
