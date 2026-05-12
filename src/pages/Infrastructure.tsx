import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LTooltip, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { PageHeader } from "@/components/PageHeader";
import { zones, chargingStations, riskColor, type Zone, type ChargingStation } from "@/data/mock";
import { Plug, Sparkles, TrendingUp, MapPin, Zap, ChevronRight, X, Battery, Users, Clock, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function Infrastructure() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);

  const existingStations = chargingStations.filter((s) => s.type === "existing");
  const suggestedStations = chargingStations.filter((s) => s.type === "suggested");
  const totalChargers = zones.reduce((s, z) => s + z.chargers, 0);
  const underserved = [...zones].sort((a, b) => a.chargers / a.load - b.chargers / b.load).slice(0, 3);
  const highGrowth = [...zones].sort((a, b) => b.growth - a.growth).slice(0, 3);

  const handleZoneClick = (z: Zone) => {
    setSelectedZone(z);
    setSelectedStation(null);
  };

  const handleStationClick = (s: ChargingStation) => {
    setSelectedStation(s);
    setSelectedZone(zones.find((z) => z.id === s.zoneId) || null);
  };

  const zoneStations = selectedZone
    ? chargingStations.filter((s) => s.zoneId === selectedZone.id)
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Infrastructure Planning"
        title="Smart Charger Network Planner"
        description="Interactive planning platform for BESCOM. Visualize coverage, identify gaps, and plan strategic EV charger deployments across Bengaluru."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-primary/15 text-primary border border-primary/30">
              {existingStations.length} ACTIVE
            </span>
            <span className="text-[10px] font-mono px-2 py-1 rounded bg-accent/15 text-accent border border-accent/30">
              {suggestedStations.length} PROPOSED
            </span>
          </div>
        }
      />

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Plug, label: "Total Chargers", value: String(totalChargers), sub: "across 12 zones", accent: "text-primary" },
          { icon: MapPin, label: "Coverage", value: "72%", sub: "of Bengaluru grid", accent: "text-warning" },
          { icon: Battery, label: "Underserved Zones", value: String(underserved.length), sub: "need deployment", accent: "text-danger" },
          { icon: TrendingUp, label: "Planned Deployments", value: String(suggestedStations.length), sub: "AI-recommended", accent: "text-accent" },
        ].map((k, i) => (
          <motion.div
            key={k.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 group hover:border-primary/40 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{k.label}</p>
              <k.icon className={cn("w-4 h-4", k.accent)} />
            </div>
            <p className="font-display text-2xl text-gradient">{k.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{k.sub}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
        {/* Main interactive map */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={cn("glass rounded-2xl p-5", selectedZone ? "xl:col-span-2" : "xl:col-span-3")}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-semibold">Network Coverage Map</h3>
              <p className="text-xs text-muted-foreground">Click a zone or station for details</p>
            </div>
            <div className="flex gap-3 text-[11px] font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />Existing
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent ring-2 ring-accent/40 animate-glow-pulse" />Proposed
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-warning" />Underserved
              </span>
            </div>
          </div>

          <div className="relative w-full overflow-hidden rounded-2xl h-[520px]">
            <MapContainer
              center={[12.9716, 77.5946]}
              zoom={11}
              scrollWheelZoom={true}
              zoomControl={true}
              attributionControl={false}
              style={{ height: "100%", width: "100%", background: "hsl(var(--background))" }}
            >
              <ResizeFix />
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                subdomains={["a", "b", "c", "d"]}
                maxZoom={19}
              />

              {/* Zone circles */}
              {zones.map((z) => {
                const lvl = riskColor(z.riskScore);
                const color = lvl === "high" ? "hsl(0 84% 60%)" : lvl === "medium" ? "hsl(38 92% 55%)" : "hsl(150 65% 50%)";
                const isUnderserved = underserved.some((u) => u.id === z.id);
                return (
                  <CircleMarker
                    key={z.id}
                    center={[z.lat, z.lng]}
                    radius={isUnderserved ? 22 : 16}
                    pathOptions={{
                      color: isUnderserved ? "hsl(38 92% 55%)" : color,
                      fillColor: color,
                      fillOpacity: 0.12,
                      weight: isUnderserved ? 2 : 1,
                      dashArray: isUnderserved ? "6 4" : undefined,
                    }}
                    eventHandlers={{ click: () => handleZoneClick(z) }}
                  >
                    <LTooltip direction="top" offset={[0, -8]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
                      <div className="glass-strong rounded-md px-2 py-1 text-[10px] font-mono">
                        <span className="font-semibold text-foreground">{z.name}</span>
                        <span className="text-muted-foreground"> · {z.chargers} chargers</span>
                      </div>
                    </LTooltip>
                  </CircleMarker>
                );
              })}

              {/* Existing station markers */}
              {existingStations.map((s) => (
                <CircleMarker
                  key={s.id}
                  center={[s.lat, s.lng]}
                  radius={5}
                  pathOptions={{
                    color: "#ffffff",
                    fillColor: "hsl(187 92% 48%)",
                    fillOpacity: 0.95,
                    weight: 1.5,
                  }}
                  eventHandlers={{ click: () => handleStationClick(s) }}
                >
                  <LTooltip direction="top" offset={[0, -4]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
                    <div className="glass-strong rounded-md px-2 py-1 text-[10px] font-mono">
                      <span className="font-semibold text-primary">{s.name}</span>
                      <span className="text-muted-foreground"> · {s.utilization}%</span>
                    </div>
                  </LTooltip>
                </CircleMarker>
              ))}

              {/* Suggested station markers with pulse */}
              {suggestedStations.map((s) => (
                <CircleMarker
                  key={s.id}
                  center={[s.lat, s.lng]}
                  radius={7}
                  pathOptions={{
                    color: "hsl(264 80% 66%)",
                    fillColor: "hsl(264 80% 66%)",
                    fillOpacity: 0.7,
                    weight: 2,
                  }}
                  eventHandlers={{ click: () => handleStationClick(s) }}
                >
                  <LTooltip direction="top" offset={[0, -4]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
                    <div className="glass-strong rounded-md px-2 py-1 text-[10px] font-mono">
                      <span className="font-semibold text-accent">{s.name}</span>
                      <span className="text-muted-foreground"> · AI Proposed</span>
                    </div>
                  </LTooltip>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Map overlays */}
            <div className="absolute bottom-3 left-3 z-[400] glass-strong rounded-lg px-3 py-2 text-[10px] font-mono text-muted-foreground">
              BENGALURU · BESCOM INFRASTRUCTURE PLANNER
            </div>
          </div>
        </motion.div>

        {/* Detail panel - only shows when zone selected */}
        <AnimatePresence>
          {selectedZone && (
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              className="space-y-4"
            >
              {/* Zone details */}
              <div className="glass rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 bg-aurora opacity-30 pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <h3 className="font-display font-semibold text-sm">{selectedZone.name}</h3>
                    </div>
                    <button onClick={() => { setSelectedZone(null); setSelectedStation(null); }} className="w-6 h-6 rounded flex items-center justify-center hover:bg-muted/50 transition-colors">
                      <X className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {[
                      { icon: Zap, label: "EV Demand", value: `${selectedZone.load} MW`, tone: "text-primary" },
                      { icon: Gauge, label: "Capacity", value: `${selectedZone.capacity} MW`, tone: "text-foreground" },
                      { icon: Battery, label: "Risk Score", value: `${selectedZone.riskScore}/100`, tone: selectedZone.riskScore >= 70 ? "text-danger" : selectedZone.riskScore >= 45 ? "text-warning" : "text-success" },
                      { icon: TrendingUp, label: "YoY Growth", value: `+${selectedZone.growth}%`, tone: "text-success" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-muted/20 rounded-lg p-2.5 border border-border/40">
                        <div className="flex items-center gap-1.5 mb-1">
                          <stat.icon className="w-3 h-3 text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">{stat.label}</span>
                        </div>
                        <p className={cn("font-display text-lg", stat.tone)}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Utilization bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Grid Utilization</span>
                      <span className="font-mono text-primary">{Math.round((selectedZone.load / selectedZone.capacity) * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                        style={{ width: `${(selectedZone.load / selectedZone.capacity) * 100}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-muted-foreground">
                    Substation: {selectedZone.substation} · Peak: {selectedZone.peakTime} IST
                  </p>
                </div>
              </div>

              {/* Zone stations */}
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Plug className="w-4 h-4 text-primary" />
                  <h3 className="font-display font-semibold text-sm">Stations in {selectedZone.name}</h3>
                </div>
                <div className="space-y-2">
                  {zoneStations.length > 0 ? zoneStations.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStation(s)}
                      className={cn(
                        "w-full text-left rounded-xl p-3 border transition-all",
                        selectedStation?.id === s.id
                          ? "border-primary/50 bg-primary/5"
                          : "border-border/40 hover:border-primary/30 bg-muted/10"
                      )}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium truncate">{s.name}</span>
                        <span className={cn(
                          "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border",
                          s.type === "suggested"
                            ? "bg-accent/15 text-accent border-accent/30"
                            : "bg-success/15 text-success border-success/30"
                        )}>
                          {s.type === "suggested" ? "proposed" : s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
                        <span>{s.chargerType}</span>
                        <span>{s.ports} ports</span>
                        {s.type === "existing" && <span>{s.utilization}% util</span>}
                      </div>
                    </button>
                  )) : (
                    <p className="text-xs text-muted-foreground text-center py-4">No stations in this zone yet</p>
                  )}
                </div>
              </div>

              {/* AI recommendation */}
              {underserved.some((u) => u.id === selectedZone.id) && (
                <div className="glass rounded-2xl p-5 border-primary/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-aurora opacity-40 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <h3 className="font-display font-semibold text-sm">AI Recommendation</h3>
                    </div>
                    <p className="text-sm leading-relaxed">
                      Deploy <span className="text-primary font-semibold">{Math.ceil(selectedZone.load / 4)}</span> additional DC Fast chargers in {selectedZone.name}. Estimated wait time reduction: <span className="text-success font-semibold">~38%</span>.
                    </p>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <Button
                        className="bg-gradient-primary text-primary-foreground hover:opacity-90"
                        onClick={() => {
                          const n = Math.ceil(selectedZone.load / 4);
                          toast.success(`Deployment approved`, {
                            description: `${n} DC Fast chargers queued for ${selectedZone.name}. Work order #WO-${Math.floor(Math.random() * 9000 + 1000)} dispatched to BESCOM field ops.`,
                          });
                        }}
                      >
                        Approve Deployment
                      </Button>
                      <Button
                        variant="outline"
                        className="glass border-border"
                        onClick={() => {
                          toast.info("Added to plan", {
                            description: `${selectedZone.name} added to Q3 capex review. Estimated cost: ₹${(Math.ceil(selectedZone.load / 4) * 8.5).toFixed(1)}L.`,
                          });
                        }}
                      >
                        Add to Plan
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom cards - underserved + high growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <Plug className="w-4 h-4 text-warning" />
            <h3 className="font-display font-semibold text-sm">Underserved Zones</h3>
          </div>
          <div className="space-y-2.5">
            {underserved.map((z, i) => (
              <motion.button
                key={z.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.04 }}
                onClick={() => handleZoneClick(z)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-warning/30 bg-muted/10 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-medium">{z.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {z.chargers} chargers · {z.load} MW load · ratio: {(z.chargers / z.load).toFixed(1)}/MW
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-success" />
            <h3 className="font-display font-semibold text-sm">High Growth Zones</h3>
          </div>
          <div className="space-y-2.5">
            {highGrowth.map((z, i) => (
              <motion.button
                key={z.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.04 }}
                onClick={() => handleZoneClick(z)}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-success/30 bg-muted/10 transition-all text-left"
              >
                <div>
                  <p className="text-sm font-medium">{z.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                    {z.chargers} chargers · {z.substation}
                  </p>
                </div>
                <span className="font-mono text-sm text-success">+{z.growth}%</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
