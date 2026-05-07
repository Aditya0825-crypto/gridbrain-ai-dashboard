import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip as LTooltip, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { zones as defaultZones, riskColor, type Zone } from "@/data/mock";
import { cn } from "@/lib/utils";

interface Props {
  zones?: Zone[];
  height?: string;
  onSelect?: (z: Zone) => void;
  selectedId?: string;
  tileTheme?: "dark" | "light";
}

const colorFor = (score: number) => {
  const lvl = riskColor(score);
  if (lvl === "high") return "hsl(0 84% 60%)";
  if (lvl === "medium") return "hsl(38 92% 55%)";
  return "hsl(150 65% 50%)";
};

// Force map to invalidate size on mount (fixes grey tiles in flex containers)
function ResizeFix() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export function BengaluruMap({
  zones = defaultZones,
  height = "h-[420px]",
  onSelect,
  selectedId,
  tileTheme = "dark",
}: Props) {
  const tileUrl =
    tileTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

  return (
    <div className={cn("relative w-full overflow-hidden rounded-2xl glass", height)}>
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
          url={tileUrl}
          subdomains={["a", "b", "c", "d"]}
          maxZoom={19}
        />
        {zones.map((z) => {
          const color = colorFor(z.riskScore);
          const radius = 5 + (z.load / 22) * 4;
          const isSelected = selectedId === z.id;
          const lvl = riskColor(z.riskScore);
          const util = Math.round((z.load / z.capacity) * 100);
          return (
            <CircleMarker
              key={z.id}
              center={[z.lat, z.lng]}
              radius={radius}
              pathOptions={{
                color: "#ffffff",
                fillColor: color,
                fillOpacity: 0.95,
                weight: isSelected ? 2.5 : 1.5,
                opacity: 1,
              }}
              eventHandlers={{ click: () => onSelect?.(z) }}
            >
              <LTooltip direction="top" offset={[0, -4]} opacity={1} className="!bg-transparent !border-0 !shadow-none !p-0">
                <div className="glass-strong rounded-md px-2 py-1 text-[10px] font-mono">
                  <span className="font-semibold" style={{ color }}>{z.name}</span>
                  <span className="text-muted-foreground"> · {util}%</span>
                </div>
              </LTooltip>
              <Popup className="gridbrain-popup" closeButton={false}>
                <div className="font-sans min-w-[180px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-display font-semibold text-sm text-foreground">{z.name}</span>
                    <span
                      className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded"
                      style={{ background: color + "25", color }}
                    >
                      {lvl}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] font-mono">
                    <span className="text-muted-foreground">Load</span>
                    <span className="text-right text-foreground">{z.load} MW</span>
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-right text-foreground">{z.capacity} MW</span>
                    <span className="text-muted-foreground">Utilization</span>
                    <span className="text-right text-foreground">{util}%</span>
                    <span className="text-muted-foreground">Risk</span>
                    <span className="text-right text-foreground">{z.riskScore}/100</span>
                    <span className="text-muted-foreground">Peak</span>
                    <span className="text-right text-foreground">{z.peakTime}</span>
                    <span className="text-muted-foreground">Chargers</span>
                    <span className="text-right text-foreground">{z.chargers}</span>
                    <span className="text-muted-foreground">Substation</span>
                    <span className="text-right text-foreground">{z.substation}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
        
      </MapContainer>

      {/* legend overlay */}
      <div className="absolute bottom-3 left-3 z-[400] glass-strong rounded-lg px-3 py-2 flex items-center gap-3 text-[11px]">
        <span className="text-muted-foreground uppercase tracking-wider mr-1">Grid Risk</span>
        {[
          { l: "low", c: "hsl(150 65% 50%)" },
          { l: "medium", c: "hsl(38 92% 55%)" },
          { l: "high", c: "hsl(0 84% 60%)" },
        ].map((x) => (
          <span key={x.l} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: x.c, boxShadow: `0 0 8px ${x.c}` }} />
            <span className="capitalize text-foreground">{x.l}</span>
          </span>
        ))}
      </div>

      {/* corner badge */}
      <div className="absolute top-3 right-3 z-[400] glass-strong rounded-lg px-2.5 py-1 text-[10px] font-mono text-muted-foreground">
        BENGALURU · BESCOM GRID
      </div>
    </div>
  );
}
