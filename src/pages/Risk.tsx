import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import { BengaluruMap } from "@/components/BengaluruMap";
import { AiInsightsPanel } from "@/components/AiInsightsPanel";
import { riskColor, zones, syncRiskStations, evMitraNotifications, type SyncRiskStation } from "@/data/mock";
import { ArrowUpDown, Filter, Radio, AlertTriangle, Bell, Users, Clock, MapPin, Zap, CheckCircle2, X, ChevronDown, ChevronUp, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Risk() {
  const [filter, setFilter] = useState<"all" | "low" | "medium" | "high">("all");
  const [sortDesc, setSortDesc] = useState(true);
  const [syncExpanded, setSyncExpanded] = useState(true);
  const [evMitraZone, setEvMitraZone] = useState<string | null>(null);
  const [notifSent, setNotifSent] = useState<Record<string, boolean>>({});
  const [notifAnimating, setNotifAnimating] = useState<string | null>(null);

  const rows = useMemo(() => {
    return zones
      .filter((z) => filter === "all" || riskColor(z.riskScore) === filter)
      .sort((a, b) => (sortDesc ? b.riskScore - a.riskScore : a.riskScore - b.riskScore));
  }, [filter, sortDesc]);

  const badgeFor = (lvl: "low" | "medium" | "high") =>
    lvl === "high" ? "bg-danger/15 text-danger border-danger/30"
    : lvl === "medium" ? "bg-warning/15 text-warning border-warning/30"
    : "bg-success/15 text-success border-success/30";

  const handleEvMitra = (zoneId: string) => {
    setEvMitraZone(zoneId);
    setNotifAnimating(zoneId);
    setTimeout(() => {
      setNotifSent((prev) => ({ ...prev, [zoneId]: true }));
      setNotifAnimating(null);
    }, 2000);
  };

  const highSyncStations = syncRiskStations.filter((s) => s.severity === "high");
  const medSyncStations = syncRiskStations.filter((s) => s.severity === "medium");

  return (
    <>
      <PageHeader
        eyebrow="Risk Intelligence"
        title="Risk Heatmap & Zone Status"
        description="Identify overload risks, detect synchronization congestion, and manage EV Mithra notifications across all monitored zones."
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        <div className="xl:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold">Citywide Risk Map</h3>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-danger/10 text-danger border border-danger/30">{zones.filter(z=>z.riskScore>=70).length} HIGH RISK</span>
          </div>
          <BengaluruMap height="h-[480px]" />
        </div>
        <AiInsightsPanel />
      </div>

      {/* ── Synchronization Risk Detection ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5 mb-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-aurora opacity-20 pointer-events-none" />
        <div className="relative">
          <button
            onClick={() => setSyncExpanded(!syncExpanded)}
            className="w-full flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary shrink-0">
                <Radio className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h3 className="font-display font-semibold flex items-center gap-2">
                  Synchronization Risk Detection
                  <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-warning/15 text-warning border border-warning/30">NEW</span>
                </h3>
                <p className="text-xs text-muted-foreground">Detects when AI-optimized schedules create secondary congestion peaks</p>
              </div>
            </div>
            {syncExpanded ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
          </button>

          <AnimatePresence>
            {syncExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {/* Alert banner for critical sync risk */}
                {highSyncStations.length > 0 && (
                  <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 p-3 flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-danger animate-glow-pulse shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-danger">
                        {highSyncStations.length} station{highSyncStations.length > 1 ? "s" : ""} at critical synchronization risk
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        AI-recommended charging windows are creating concurrent arrival spikes. Recommend diversifying time slots.
                      </p>
                    </div>
                  </div>
                )}

                {/* Station cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                  {syncRiskStations.map((station, i) => (
                    <SyncRiskCard key={station.id} station={station} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* ── Zone Risk Table with EV Mithra ──────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-display font-semibold">Zone Risk Table</h3>
            <p className="text-xs text-muted-foreground">{rows.length} zones · sorted by risk</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 glass rounded-lg p-1">
              <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
              {(["all", "low", "medium", "high"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs capitalize transition-colors",
                    filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <button onClick={() => setSortDesc(!sortDesc)} className="glass rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:border-primary/40">
              <ArrowUpDown className="w-3.5 h-3.5" /> {sortDesc ? "High → Low" : "Low → High"}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 px-3 font-medium">Zone</th>
                <th className="py-3 px-3 font-medium">Risk Score</th>
                <th className="py-3 px-3 font-medium">Status</th>
                <th className="py-3 px-3 font-medium">Peak Time</th>
                <th className="py-3 px-3 font-medium">Load / Cap</th>
                <th className="py-3 px-3 font-medium">Action</th>
                <th className="py-3 px-3 font-medium">EV Mithra</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((z, i) => {
                const lvl = riskColor(z.riskScore);
                const action =
                  lvl === "high" ? "Shift load to off-peak · alert ops" :
                  lvl === "medium" ? "Monitor · prepare reserve" : "Healthy · no action";
                const hasNotif = evMitraNotifications[z.id];
                const isSent = notifSent[z.id];
                const isAnimating = notifAnimating === z.id;
                return (
                  <motion.tr
                    key={z.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-3 font-medium">{z.name}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full" style={{
                            width: `${z.riskScore}%`,
                            background: lvl === "high" ? "hsl(var(--danger))" : lvl === "medium" ? "hsl(var(--warning))" : "hsl(var(--success))",
                          }} />
                        </div>
                        <span className="font-mono text-xs">{z.riskScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={cn("text-[10px] font-mono uppercase border rounded px-2 py-0.5", badgeFor(lvl))}>{lvl}</span>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs">{z.peakTime}</td>
                    <td className="py-3 px-3 font-mono text-xs text-muted-foreground">{z.load} / {z.capacity} MW</td>
                    <td className="py-3 px-3 text-xs text-muted-foreground">{action}</td>
                    <td className="py-3 px-3">
                      {hasNotif && lvl !== "low" ? (
                        <button
                          onClick={() => handleEvMitra(z.id)}
                          disabled={isSent || isAnimating}
                          className={cn(
                            "relative text-[10px] font-mono uppercase px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all",
                            isSent
                              ? "bg-success/15 text-success border-success/30"
                              : isAnimating
                              ? "bg-primary/15 text-primary border-primary/30 animate-glow-pulse"
                              : "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 hover:glow-primary cursor-pointer"
                          )}
                        >
                          {isAnimating ? (
                            <>
                              <Send className="w-3 h-3 animate-bounce" /> Sending…
                            </>
                          ) : isSent ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Notified
                            </>
                          ) : (
                          <>
                            <Bell className="w-3 h-3" /> Notify via EV Mithra
                            </>
                          )}
                          {!isSent && !isAnimating && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-primary animate-ping" />
                          )}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ── EV Mithra Notification Modal ────────────────────────────────── */}
      <AnimatePresence>
        {evMitraZone && notifSent[evMitraZone] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm"
            onClick={() => setEvMitraZone(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-[520px] max-w-[calc(100vw-2rem)] relative overflow-hidden border border-primary/20"
              style={{ boxShadow: "0 0 60px hsl(187 92% 48% / 0.15), 0 25px 80px hsl(230 80% 4% / 0.8)" }}
            >
              <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center glow-primary">
                      <Bell className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold">EV Mithra Notification Sent</h3>
                      <p className="text-[10px] font-mono text-success flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" /> DELIVERED
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setEvMitraZone(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-muted/50 transition">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                {(() => {
                  const notif = evMitraNotifications[evMitraZone];
                  if (!notif) return null;
                  return (
                    <>
                      {/* Notification message */}
                      <div className="rounded-xl border border-border/60 bg-muted/20 p-4 mb-4">
                        <p className="text-sm leading-relaxed">{notif.message}</p>
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-muted/20 rounded-xl p-3 border border-border/40">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Users className="w-3 h-3 text-primary" />
                            <span className="text-[10px] uppercase font-mono text-muted-foreground">Users Notified</span>
                          </div>
                          <p className="font-display text-xl text-primary">{notif.usersNotified.toLocaleString()}</p>
                        </div>
                        <div className="bg-muted/20 rounded-xl p-3 border border-border/40">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Zap className="w-3 h-3 text-success" />
                            <span className="text-[10px] uppercase font-mono text-muted-foreground">Congestion Reduction</span>
                          </div>
                          <p className="font-display text-xl text-success">-{notif.congestionReduction}%</p>
                        </div>
                        <div className="bg-muted/20 rounded-xl p-3 border border-border/40">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-accent" />
                            <span className="text-[10px] uppercase font-mono text-muted-foreground">Wait Time Saved</span>
                          </div>
                          <p className="font-display text-xl text-accent">-{notif.reducedWaitTime} min</p>
                        </div>
                        <div className="bg-muted/20 rounded-xl p-3 border border-border/40">
                          <div className="flex items-center gap-1.5 mb-1">
                            <MapPin className="w-3 h-3 text-warning" />
                            <span className="text-[10px] uppercase font-mono text-muted-foreground">Alt Stations</span>
                          </div>
                          <p className="font-display text-xl text-warning">{notif.alternateStations.length}</p>
                        </div>
                      </div>

                      {/* Alternate stations */}
                      <div>
                        <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Recommended Alternate Stations</p>
                        <div className="space-y-2">
                          {notif.alternateStations.map((alt) => (
                            <div key={alt.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border/40 bg-muted/10">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-3 h-3 text-primary" />
                                <span className="text-xs font-medium">{alt.name}</span>
                              </div>
                              <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                                <span>{alt.distance} away</span>
                                <span className="text-success">Wait: {alt.waitTime}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Synchronization Risk Card Component ──────────────────────────────
function SyncRiskCard({ station, index }: { station: SyncRiskStation; index: number }) {
  const sevColor = {
    high: { bg: "bg-danger/10", border: "border-danger/30", text: "text-danger", bar: "bg-danger" },
    medium: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", bar: "bg-warning" },
    low: { bg: "bg-success/10", border: "border-success/30", text: "text-success", bar: "bg-success" },
  };
  const sev = sevColor[station.severity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("rounded-xl border p-4 transition-all hover:border-primary/30", sev.border, sev.bg)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium truncate">{station.stationName}</p>
          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{station.zoneName} · {station.peakWindow}</p>
        </div>
        <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border shrink-0 ml-2", sev.border, sev.text, sev.bg)}>
          {station.severity}
        </span>
      </div>

      {/* Congestion bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1 text-[10px]">
          <span className="text-muted-foreground">Congestion Probability</span>
          <span className={cn("font-mono font-medium", sev.text)}>{station.congestionProbability}%</span>
        </div>
        <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${station.congestionProbability}%` }}
            transition={{ delay: 0.3 + index * 0.05, duration: 0.6 }}
            className={cn("h-full rounded-full", sev.bar)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2 mb-3 text-[10px]">
        <div>
          <span className="text-muted-foreground block">Expected Users</span>
          <span className="font-mono font-medium">{station.expectedConcurrentUsers} / {station.maxCapacity} cap</span>
        </div>
        <div>
          <span className="text-muted-foreground block">Avg Wait</span>
          <span className={cn("font-mono font-medium", sev.text)}>{station.avgWaitTime} min</span>
        </div>
      </div>

      {/* Alt slots */}
      <div>
        <p className="text-[10px] text-muted-foreground mb-1.5">Alternate Time Slots</p>
        <div className="flex flex-wrap gap-1">
          {station.altTimeSlots.map((slot) => (
            <span key={slot} className="text-[9px] font-mono px-2 py-0.5 rounded bg-muted/30 border border-border/40 text-foreground">
              {slot}
            </span>
          ))}
        </div>
      </div>

      {/* Animated risk indicator for high severity */}
      {station.severity === "high" && (
        <div className="mt-3 pt-3 border-t border-border/30 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
          </span>
          <span className="text-[10px] text-danger font-mono uppercase tracking-wider">Active congestion alert</span>
        </div>
      )}
    </motion.div>
  );
}
