// Centralized mock data for GridBrain AI

export type RiskLevel = "low" | "medium" | "high";

export interface Zone {
  id: string;
  name: string;
  x: number; // 0-100 grid coords (legacy stylized map)
  y: number;
  lat: number; // real Bengaluru coordinates
  lng: number;
  load: number; // MW
  capacity: number; // MW
  riskScore: number; // 0-100
  peakTime: string;
  chargers: number;
  growth: number; // %
  substation: string;
}

export const zones: Zone[] = [
  { id: "z1",  name: "Whitefield",      x: 78, y: 38, lat: 12.9698, lng: 77.7500, load: 18.4, capacity: 22, riskScore: 92, peakTime: "19:30", chargers: 42, growth: 38, substation: "WHF-220kV" },
  { id: "z2",  name: "Koramangala",     x: 52, y: 58, lat: 12.9352, lng: 77.6245, load: 14.1, capacity: 20, riskScore: 74, peakTime: "20:00", chargers: 36, growth: 24, substation: "KOR-110kV" },
  { id: "z3",  name: "Indiranagar",     x: 60, y: 44, lat: 12.9784, lng: 77.6408, load: 11.6, capacity: 18, riskScore: 61, peakTime: "19:00", chargers: 28, growth: 18, substation: "IND-66kV"  },
  { id: "z4",  name: "Electronic City", x: 56, y: 82, lat: 12.8452, lng: 77.6602, load: 16.8, capacity: 21, riskScore: 81, peakTime: "21:00", chargers: 31, growth: 33, substation: "ECY-220kV" },
  { id: "z5",  name: "Hebbal",          x: 46, y: 18, lat: 13.0358, lng: 77.5970, load: 7.4,  capacity: 16, riskScore: 38, peakTime: "18:30", chargers: 19, growth: 12, substation: "HBL-110kV" },
  { id: "z6",  name: "Jayanagar",       x: 40, y: 66, lat: 12.9250, lng: 77.5938, load: 9.2,  capacity: 17, riskScore: 46, peakTime: "19:30", chargers: 22, growth: 14, substation: "JAY-66kV"  },
  { id: "z7",  name: "MG Road",         x: 50, y: 48, lat: 12.9756, lng: 77.6050, load: 12.9, capacity: 19, riskScore: 68, peakTime: "20:30", chargers: 25, growth: 21, substation: "MGR-110kV" },
  { id: "z8",  name: "Yeshwanthpur",    x: 30, y: 30, lat: 13.0287, lng: 77.5540, load: 5.1,  capacity: 14, riskScore: 24, peakTime: "18:00", chargers: 14, growth: 9,  substation: "YPR-66kV"  },
  { id: "z9",  name: "Marathahalli",    x: 72, y: 50, lat: 12.9569, lng: 77.7011, load: 13.2, capacity: 18, riskScore: 70, peakTime: "20:00", chargers: 27, growth: 26, substation: "MTH-110kV" },
  { id: "z10", name: "Banashankari",    x: 32, y: 76, lat: 12.9250, lng: 77.5667, load: 8.0,  capacity: 16, riskScore: 41, peakTime: "19:00", chargers: 20, growth: 11, substation: "BSK-66kV"  },
  { id: "z11", name: "Sarjapur",        x: 80, y: 68, lat: 12.9010, lng: 77.6874, load: 15.4, capacity: 19, riskScore: 84, peakTime: "21:00", chargers: 24, growth: 41, substation: "SRJ-110kV" },
  { id: "z12", name: "Hosur Road",      x: 48, y: 90, lat: 12.8800, lng: 77.6400, load: 10.7, capacity: 18, riskScore: 55, peakTime: "20:30", chargers: 21, growth: 19, substation: "HSR-110kV" },
];

export const riskColor = (score: number): RiskLevel =>
  score >= 70 ? "high" : score >= 45 ? "medium" : "low";

export const riskHsl = (level: RiskLevel) =>
  level === "high" ? "var(--danger)" : level === "medium" ? "var(--warning)" : "var(--success)";

// 24h load curve (MW)
export const loadCurve = Array.from({ length: 24 }, (_, h) => {
  const base = 60 + 30 * Math.sin(((h - 6) / 24) * Math.PI * 2);
  const evening = 40 * Math.exp(-Math.pow((h - 20) / 2.5, 2));
  const morning = 18 * Math.exp(-Math.pow((h - 9) / 2, 2));
  const actual = Math.max(20, base + evening + morning);
  const predicted = actual + (Math.random() - 0.5) * 8;
  return {
    time: `${String(h).padStart(2, "0")}:00`,
    actual: Math.round(actual * 10) / 10,
    predicted: Math.round(predicted * 10) / 10,
  };
});

export const forecast24 = Array.from({ length: 24 }, (_, h) => {
  const base = 70 + 35 * Math.sin(((h - 6) / 24) * Math.PI * 2);
  const evening = 45 * Math.exp(-Math.pow((h - 20) / 2.8, 2));
  return {
    time: `${String(h).padStart(2, "0")}:00`,
    forecast: Math.round((base + evening) * 10) / 10,
    confidence: Math.round((base + evening + 12) * 10) / 10,
    lower: Math.round((base + evening - 12) * 10) / 10,
  };
});

export const aiInsights = [
  { id: 1, severity: "high",   title: "High overload risk in Whitefield", body: "Predicted 118% transformer load between 19:00–22:00 today. Consider load shifting." },
  { id: 2, severity: "medium", title: "Shift 20% load to off-peak",       body: "Incentivize Koramangala users to charge between 02:00–05:00 to reduce peak by ~14%." },
  { id: 3, severity: "low",    title: "Install chargers in Hebbal",       body: "Underserved area with 12% YoY EV growth. Recommended: 4 new fast chargers." },
  { id: 4, severity: "medium", title: "Sarjapur trending hot",            body: "41% EV growth detected. Reinforce transformer T-117 within 60 days." },
];

// ── Synchronization Risk Data ──────────────────────────────────────────
export interface SyncRiskStation {
  id: string;
  stationName: string;
  zoneId: string;
  zoneName: string;
  expectedConcurrentUsers: number;
  maxCapacity: number;
  congestionProbability: number; // 0-100
  severity: RiskLevel;
  peakWindow: string;
  altTimeSlots: string[];
  avgWaitTime: number; // minutes
  lat: number;
  lng: number;
}

export const syncRiskStations: SyncRiskStation[] = [
  { id: "s1", stationName: "Whitefield Charging Hub",        zoneId: "z1",  zoneName: "Whitefield",      expectedConcurrentUsers: 34, maxCapacity: 12, congestionProbability: 94, severity: "high",   peakWindow: "19:00–20:30", altTimeSlots: ["14:00–16:00", "23:00–02:00", "06:00–08:00"], avgWaitTime: 42, lat: 12.9698, lng: 77.7500 },
  { id: "s2", stationName: "Sarjapur FastCharge Station",    zoneId: "z11", zoneName: "Sarjapur",        expectedConcurrentUsers: 28, maxCapacity: 10, congestionProbability: 88, severity: "high",   peakWindow: "20:00–21:30", altTimeSlots: ["15:00–17:00", "01:00–04:00"],               avgWaitTime: 38, lat: 12.9010, lng: 77.6874 },
  { id: "s3", stationName: "EC Phase-1 DC Station",          zoneId: "z4",  zoneName: "Electronic City", expectedConcurrentUsers: 22, maxCapacity: 8,  congestionProbability: 82, severity: "high",   peakWindow: "20:30–22:00", altTimeSlots: ["13:00–15:00", "00:00–03:00"],               avgWaitTime: 35, lat: 12.8452, lng: 77.6602 },
  { id: "s4", stationName: "Koramangala SuperCharger",       zoneId: "z2",  zoneName: "Koramangala",     expectedConcurrentUsers: 18, maxCapacity: 10, congestionProbability: 65, severity: "medium", peakWindow: "19:30–21:00", altTimeSlots: ["16:00–18:00", "02:00–05:00"],               avgWaitTime: 22, lat: 12.9352, lng: 77.6245 },
  { id: "s5", stationName: "Marathahalli EV Point",          zoneId: "z9",  zoneName: "Marathahalli",    expectedConcurrentUsers: 16, maxCapacity: 8,  congestionProbability: 62, severity: "medium", peakWindow: "19:00–20:00", altTimeSlots: ["14:00–16:00", "23:00–01:00"],               avgWaitTime: 18, lat: 12.9569, lng: 77.7011 },
  { id: "s6", stationName: "Indiranagar FastCharge Hub",     zoneId: "z3",  zoneName: "Indiranagar",     expectedConcurrentUsers: 12, maxCapacity: 8,  congestionProbability: 48, severity: "medium", peakWindow: "18:30–19:30", altTimeSlots: ["15:00–17:00", "22:00–00:00"],               avgWaitTime: 12, lat: 12.9784, lng: 77.6408 },
  { id: "s7", stationName: "MG Road ChargePoint",            zoneId: "z7",  zoneName: "MG Road",         expectedConcurrentUsers: 10, maxCapacity: 8,  congestionProbability: 38, severity: "low",    peakWindow: "20:00–21:00", altTimeSlots: ["16:00–18:00"],                             avgWaitTime: 8,  lat: 12.9756, lng: 77.6050 },
  { id: "s8", stationName: "Hebbal Green Station",           zoneId: "z5",  zoneName: "Hebbal",          expectedConcurrentUsers: 6,  maxCapacity: 6,  congestionProbability: 22, severity: "low",    peakWindow: "18:00–19:00", altTimeSlots: ["14:00–16:00"],                             avgWaitTime: 4,  lat: 13.0358, lng: 77.5970 },
];

// ── EV Mitra Notification Data ─────────────────────────────────────────
export interface EvMitraNotification {
  zoneId: string;
  zoneName: string;
  usersNotified: number;
  congestionReduction: number; // %
  reducedWaitTime: number; // minutes
  alternateStations: { name: string; distance: string; waitTime: string }[];
  message: string;
}

export const evMitraNotifications: Record<string, EvMitraNotification> = {
  z1: {
    zoneId: "z1", zoneName: "Whitefield",
    usersNotified: 847, congestionReduction: 34, reducedWaitTime: 28,
    alternateStations: [
      { name: "Indiranagar FastCharge Hub", distance: "8 mins", waitTime: "~5 min" },
      { name: "MG Road ChargePoint", distance: "12 mins", waitTime: "~3 min" },
      { name: "Marathahalli EV Point", distance: "6 mins", waitTime: "~8 min" },
    ],
    message: "⚡ High congestion detected at Whitefield Charging Hub. Suggested alternate stations: Indiranagar FastCharge Hub (8 mins away) and MG Road ChargePoint (12 mins away).",
  },
  z2: {
    zoneId: "z2", zoneName: "Koramangala",
    usersNotified: 612, congestionReduction: 28, reducedWaitTime: 15,
    alternateStations: [
      { name: "Jayanagar EV Station", distance: "7 mins", waitTime: "~4 min" },
      { name: "MG Road ChargePoint", distance: "10 mins", waitTime: "~3 min" },
    ],
    message: "⚡ Moderate congestion at Koramangala SuperCharger. Try Jayanagar EV Station (7 mins away) for faster charging.",
  },
  z4: {
    zoneId: "z4", zoneName: "Electronic City",
    usersNotified: 923, congestionReduction: 31, reducedWaitTime: 24,
    alternateStations: [
      { name: "Hosur Road ChargeHub", distance: "9 mins", waitTime: "~6 min" },
      { name: "Banashankari EV Point", distance: "15 mins", waitTime: "~2 min" },
    ],
    message: "⚡ High congestion at EC Phase-1 DC Station. Recommended: Hosur Road ChargeHub (9 mins away).",
  },
  z9: {
    zoneId: "z9", zoneName: "Marathahalli",
    usersNotified: 534, congestionReduction: 22, reducedWaitTime: 12,
    alternateStations: [
      { name: "Whitefield Charging Hub", distance: "11 mins", waitTime: "~10 min" },
      { name: "Indiranagar FastCharge Hub", distance: "9 mins", waitTime: "~5 min" },
    ],
    message: "⚡ Congestion building at Marathahalli EV Point. Try Indiranagar FastCharge Hub (9 mins).",
  },
  z11: {
    zoneId: "z11", zoneName: "Sarjapur",
    usersNotified: 756, congestionReduction: 36, reducedWaitTime: 26,
    alternateStations: [
      { name: "Koramangala SuperCharger", distance: "12 mins", waitTime: "~7 min" },
      { name: "Hosur Road ChargeHub", distance: "14 mins", waitTime: "~4 min" },
    ],
    message: "⚡ High congestion at Sarjapur FastCharge Station. Koramangala SuperCharger is 12 mins away with low wait.",
  },
};

// ── Government Dashboard Data ──────────────────────────────────────────
export interface GovernmentPolicy {
  id: string;
  name: string;
  ministry: string;
  status: "Active" | "Upcoming" | "Under Review" | "Approved";
  budget: string;
  evTarget: string;
  progress: number; // 0-100
  lastUpdated: string;
}

export const governmentPolicies: GovernmentPolicy[] = [
  { id: "gp1", name: "PM E-DRIVE Scheme",                  ministry: "MoHI&PE",  status: "Active",       budget: "₹10,900 Cr", evTarget: "25L vehicles by 2027", progress: 42, lastUpdated: "02 May 2026" },
  { id: "gp2", name: "FAME-III (Proposed)",                ministry: "MoHI&PE",  status: "Under Review", budget: "₹12,500 Cr", evTarget: "40L vehicles by 2030", progress: 18, lastUpdated: "28 Apr 2026" },
  { id: "gp3", name: "Karnataka State EV Policy 2023-28",  ministry: "GoK",      status: "Active",       budget: "₹2,100 Cr",  evTarget: "1M EVs in KA",        progress: 35, lastUpdated: "15 Apr 2026" },
  { id: "gp4", name: "National Smart Grid Mission",        ministry: "MoP",      status: "Active",       budget: "₹980 Cr",   evTarget: "100% smart meters",    progress: 61, lastUpdated: "01 May 2026" },
  { id: "gp5", name: "Green Hydrogen + EV Corridor",       ministry: "MNRE",     status: "Upcoming",     budget: "₹4,200 Cr", evTarget: "6 EV corridors",       progress: 8,  lastUpdated: "20 Apr 2026" },
  { id: "gp6", name: "BESCOM EV Tariff Reform",            ministry: "KERC",     status: "Approved",     budget: "₹45 Cr",    evTarget: "ToU rollout citywide",  progress: 78, lastUpdated: "05 May 2026" },
];

export interface SmartCityMetric {
  label: string;
  value: string;
  subtext: string;
  trend: "up" | "down" | "neutral";
}

export const smartCityMetrics: SmartCityMetric[] = [
  { label: "EV Penetration Rate", value: "8.4%",     subtext: "▲ 2.1% vs last quarter",   trend: "up" },
  { label: "Active Policies",     value: "6",        subtext: "3 Central + 3 State",       trend: "neutral" },
  { label: "Total Budget Deployed", value: "₹1,240 Cr", subtext: "FY 2025-26",             trend: "up" },
  { label: "Smart City Score",    value: "82/100",   subtext: "NIUA benchmark",             trend: "up" },
];

export const gridReadiness = [
  { metric: "Transformer Headroom",   value: "68%", status: "ok" },
  { metric: "SCADA Coverage",         value: "94%", status: "ok" },
  { metric: "Smart Meter Rollout",    value: "72%", status: "warn" },
  { metric: "DT Monitoring (IoT)",    value: "81%", status: "ok" },
  { metric: "EV Load Visibility",     value: "89%", status: "ok" },
  { metric: "Cyber Security Posture", value: "96%", status: "ok" },
];

// ── Infrastructure Planning Data ───────────────────────────────────────
export interface ChargingStation {
  id: string;
  name: string;
  zoneId: string;
  lat: number;
  lng: number;
  type: "existing" | "suggested";
  chargerType: "DC Fast" | "AC Slow" | "Ultra-Fast";
  ports: number;
  utilization: number; // %
  dailyUsers: number;
  status: "online" | "offline" | "maintenance";
}

export const chargingStations: ChargingStation[] = [
  // Existing stations
  { id: "cs1",  name: "Whitefield Charging Hub",      zoneId: "z1",  lat: 12.9710, lng: 77.7520, type: "existing",  chargerType: "DC Fast",   ports: 12, utilization: 92, dailyUsers: 186, status: "online" },
  { id: "cs2",  name: "ITPL DC Fast Charger",         zoneId: "z1",  lat: 12.9750, lng: 77.7420, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 88, dailyUsers: 142, status: "online" },
  { id: "cs3",  name: "Koramangala SuperCharger",      zoneId: "z2",  lat: 12.9340, lng: 77.6260, type: "existing",  chargerType: "Ultra-Fast", ports: 10, utilization: 78, dailyUsers: 128, status: "online" },
  { id: "cs4",  name: "Indiranagar FastCharge Hub",    zoneId: "z3",  lat: 12.9790, lng: 77.6400, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 64, dailyUsers: 94,  status: "online" },
  { id: "cs5",  name: "EC Phase-1 DC Station",         zoneId: "z4",  lat: 12.8460, lng: 77.6610, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 86, dailyUsers: 156, status: "online" },
  { id: "cs6",  name: "EC Phase-2 AC Station",         zoneId: "z4",  lat: 12.8500, lng: 77.6550, type: "existing",  chargerType: "AC Slow",   ports: 16, utilization: 71, dailyUsers: 88,  status: "online" },
  { id: "cs7",  name: "Hebbal Green Station",          zoneId: "z5",  lat: 13.0360, lng: 77.5980, type: "existing",  chargerType: "AC Slow",   ports: 6,  utilization: 42, dailyUsers: 34,  status: "online" },
  { id: "cs8",  name: "Jayanagar EV Station",          zoneId: "z6",  lat: 12.9260, lng: 77.5940, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 52, dailyUsers: 68,  status: "online" },
  { id: "cs9",  name: "MG Road ChargePoint",           zoneId: "z7",  lat: 12.9760, lng: 77.6060, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 58, dailyUsers: 82,  status: "online" },
  { id: "cs10", name: "Marathahalli EV Point",         zoneId: "z9",  lat: 12.9580, lng: 77.7020, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 74, dailyUsers: 112, status: "online" },
  { id: "cs11", name: "Sarjapur FastCharge Station",    zoneId: "z11", lat: 12.9020, lng: 77.6880, type: "existing",  chargerType: "DC Fast",   ports: 10, utilization: 91, dailyUsers: 168, status: "online" },
  { id: "cs12", name: "Hosur Road ChargeHub",           zoneId: "z12", lat: 12.8810, lng: 77.6410, type: "existing",  chargerType: "DC Fast",   ports: 8,  utilization: 62, dailyUsers: 76,  status: "online" },
  // AI-Suggested stations
  { id: "cs13", name: "Whitefield South (Proposed)",    zoneId: "z1",  lat: 12.9620, lng: 77.7460, type: "suggested", chargerType: "Ultra-Fast", ports: 16, utilization: 0,  dailyUsers: 0,   status: "offline" },
  { id: "cs14", name: "Sarjapur Ring Road (Proposed)",  zoneId: "z11", lat: 12.9080, lng: 77.6820, type: "suggested", chargerType: "DC Fast",   ports: 12, utilization: 0,  dailyUsers: 0,   status: "offline" },
  { id: "cs15", name: "Hebbal Flyover Hub (Proposed)",  zoneId: "z5",  lat: 13.0400, lng: 77.5920, type: "suggested", chargerType: "DC Fast",   ports: 10, utilization: 0,  dailyUsers: 0,   status: "offline" },
  { id: "cs16", name: "Banashankari Metro (Proposed)",  zoneId: "z10", lat: 12.9220, lng: 77.5700, type: "suggested", chargerType: "DC Fast",   ports: 8,  utilization: 0,  dailyUsers: 0,   status: "offline" },
  { id: "cs17", name: "Yeshwanthpur Junction (Proposed)", zoneId: "z8", lat: 13.0300, lng: 77.5560, type: "suggested", chargerType: "DC Fast",   ports: 8,  utilization: 0,  dailyUsers: 0,   status: "offline" },
];

// ── AI Agent Mock Responses ────────────────────────────────────────────
export const agentResponses: Record<string, string> = {
  "Where should BESCOM deploy the next charging station?":
    "Based on current demand analysis, **Sarjapur Ring Road** is the highest priority location. This zone has 41% YoY EV growth with only 24 chargers serving 15.4 MW load. I recommend deploying 12 DC Fast chargers here, which would reduce average wait times by ~38% and improve grid utilization by 14%.\n\nSecond priority: **Hebbal Flyover Hub** — underserved area with growing demand from northern Bengaluru commuters.",

  "Which zones are at highest overload risk?":
    "Currently, **3 zones** are at critical risk (score ≥ 70):\n\n1. 🔴 **Whitefield** — Risk: 92/100 · 118% transformer load predicted 19:00–22:00\n2. 🔴 **Sarjapur** — Risk: 84/100 · 41% growth outpacing infrastructure\n3. 🔴 **Electronic City** — Risk: 81/100 · Evening peak exceeding capacity\n\nImmediate recommendation: Activate ToU pricing in Whitefield and dispatch mobile reserve from Yeshwanthpur substation.",

  "Suggest off-peak charging strategy":
    "Here's an optimized off-peak charging strategy:\n\n**Time-of-Use (ToU) Pricing:**\n• ₹4.5/kWh during 02:00–06:00 (vs ₹12/kWh peak)\n• Estimated 35% load shift from evening peak\n\n**Workplace Charging Program:**\n• Partner with ITPL, Manyata, and Bagmane tech parks\n• Install 200 AC chargers at subsidized rates\n• Expected to shift 22% of evening home-charging demand\n\n**Smart Scheduling via EV Mitra App:**\n• AI-optimized charging slots pushed to users\n• Predicted congestion reduction: 28%",

  "Explain why Zone A risk score is high":
    "The risk score is computed from multiple factors:\n\n**Primary Drivers (SHAP Analysis):**\n1. Evening peak demand (+22%) — Residential charging surge 19:00–22:00\n2. Transformer utilization (+18%) — WHF-220kV at 92% capacity\n3. Low charger-to-EV ratio (+14%) — 42 chargers for growing fleet\n\n**Mitigating Factors:**\n• ToU tariff adoption (-6%) — Some users already shifting\n• Solar feed-in (-4%) — Rooftop solar reducing grid dependency\n\nThe model is 89.4% confident. If ToU adoption increases by 20%, risk drops from 92 to ~74.",

  "Predict future stress zones":
    "Based on EV registration trends and infrastructure data, here are the **predicted stress zones for Q3 2026:**\n\n1. **Sarjapur** — 41% growth, will exceed capacity by August 2026\n2. **Whitefield** — Already critical, needs immediate intervention\n3. **Marathahalli** — 26% growth, approaching threshold by October\n4. **Electronic City** — Phase-2 expansion bringing 5,000 new EVs\n\n**Recommendation:** Fast-track charger deployment in Sarjapur and Marathahalli. Begin transformer upgrade planning for ECY-220kV substation.",

  default:
    "I'm GridBrain Agent, your AI-powered grid intelligence assistant. I can help you with:\n\n• **Demand analysis** — Understanding charging patterns and peak loads\n• **Risk assessment** — Identifying and mitigating grid overload risks\n• **Infrastructure planning** — Optimal charger placement recommendations\n• **Policy insights** — Government scheme impacts on EV adoption\n• **Operational decisions** — Real-time load balancing strategies\n\nFeel free to ask me anything about the Bengaluru EV grid!",
};
