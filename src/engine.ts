import { rooms, fixtureTypes, kelvins, roomGuidance } from "./data/catalog";
export { rooms, fixtureTypes, kelvins, tempLabels } from "./data/catalog";
export { fixtureAdvice } from "./data/advice";
export type LayerRole =
  "Ambient" | "Secondary" | "Task" | "Accent" | "Decorative";
export interface ExtraLayer {
  id: string;
  role: LayerRole;
  type: string;
  quantity: number;
  lumens: number;
  watts: number;
  uf: number;
  mf: number;
  contributes: boolean;
}
export interface Inputs {
  name: string;
  room: string;
  outdoor: boolean;
  length: number;
  width: number;
  height: number;
  plane: number;
  wall: number;
  ceiling: number;
  floor: number;
  daylight: string;
  brightness: number;
  lux: number;
  uf: number;
  mf: number;
  type: string;
  lumens: number;
  watts: number;
  beam: number;
  mount: number;
  quantity: number;
  kelvin: number;
  cri: number;
  dimmable: boolean;
  ip: string;
  rating: string;
  dimension: number;
  goal: string;
  scene: string;
  units: "metric" | "imperial";
  mixed: boolean;
  layers: ExtraLayer[];
  sourceOutput: boolean;
  opticalEfficiency: number;
  overlap: number;
  hours: number;
  days: number;
  tariff: number;
  dimming: number;
}
export const defaults: Inputs = {
  name: "Living room",
  room: "Living room",
  outdoor: false,
  length: 5,
  width: 4,
  height: 2.8,
  plane: 0.75,
  wall: 50,
  ceiling: 80,
  floor: 20,
  daylight: "Medium natural light",
  brightness: 1,
  lux: 200,
  uf: 0.6,
  mf: 0.8,
  type: "Recessed spotlights",
  lumens: 800,
  watts: 9,
  beam: 60,
  mount: 2.8,
  quantity: 0,
  kelvin: 2700,
  cri: 90,
  dimmable: true,
  ip: "IP20",
  rating: "Indoor",
  dimension: 90,
  goal: "balanced",
  scene: "Evening",
  units: "metric",
  mixed: false,
  layers: [],
  sourceOutput: false,
  opticalEfficiency: 0.85,
  overlap: 0.2,
  hours: 5,
  days: 365,
  tariff: 0.15,
  dimming: 1,
};
function between(v: number, min: number, max: number, label: string) {
  if (!Number.isFinite(v) || v < min || v > max)
    throw new Error(`${label} must be between ${min} and ${max}.`);
}
export function normalizeInputs(data: Partial<Inputs>): Inputs {
  const daylight =
    (
      {
        Low: "Low natural light",
        Moderate: "Medium natural light",
        Abundant: "High natural light",
      } as Record<string, string>
    )[data.daylight || ""] ||
    data.daylight ||
    defaults.daylight;
  return {
    ...defaults,
    ...data,
    daylight,
    layers: Array.isArray(data.layers)
      ? data.layers.map((l) => ({
          ...l,
          role: l.role === "Ambient" ? "Secondary" : l.role,
        }))
      : [],
  };
}
export function calculate(i: Inputs) {
  if (!i.name.trim()) throw new Error("Enter a room name before calculating.");
  if (!rooms.some((r) => r[0] === i.room))
    throw new Error("Choose a recognized room type.");
  if (roomGuidance[i.room].outdoor && !i.outdoor)
    throw new Error(
      "This room preset is outdoors. Choose Outdoor or select an indoor room type.",
    );
  if (!fixtureTypes.includes(i.type))
    throw new Error("Choose a supported fixture type.");
  if (!kelvins.includes(i.kelvin))
    throw new Error("Choose a listed color temperature.");
  if (
    [
      i.length,
      i.width,
      i.lux,
      i.lumens,
      i.watts,
      i.uf,
      i.mf,
      i.mount - i.plane,
    ].some((v) => !Number.isFinite(v) || v <= 0)
  )
    throw new Error(
      "Enter positive dimensions, output and factors. Mounting height must exceed the working plane.",
    );
  const bounds: [number, number, number, string][] = [
    [i.length, 0.5, 100, "Length"],
    [i.width, 0.5, 100, "Width"],
    [i.height, 1, 20, "Ceiling height"],
    [i.plane, 0, 10, "Working-plane height"],
    [i.mount, 0.1, 20, "Mounting height"],
    [i.lumens, 1, 100000, "Lumens"],
    [i.watts, 0.1, 2000, "Wattage"],
    [i.lux, 1, 3000, "Lux target"],
    [i.uf, 0.1, 1, "Utilization factor"],
    [i.mf, 0.1, 1, "Maintenance factor"],
    [i.beam, 5, 160, "Beam angle"],
    [i.brightness, 0.75, 1.5, "Brightness"],
    [i.quantity, 0, 1000, "Quantity"],
    [i.cri, 0, 100, "CRI"],
    [i.dimension, 1, 5000, "Fixture size"],
    [i.wall, 0, 100, "Wall reflectance"],
    [i.ceiling, 0, 100, "Ceiling reflectance"],
    [i.floor, 0, 100, "Floor reflectance"],
    [i.opticalEfficiency, 0.1, 1, "Optical efficiency"],
    [i.overlap, 0, 0.5, "Beam overlap"],
    [i.hours, 0, 24, "Hours per day"],
    [i.days, 0, 366, "Days per year"],
    [i.tariff, 0, 100, "Electricity tariff"],
    [i.dimming, 0.1, 1, "Average power fraction"],
  ];
  bounds.forEach((b) => between(...b));
  if (i.plane >= i.height)
    throw new Error("Working-plane height must be below the ceiling.");
  if (!i.outdoor && i.mount > i.height)
    throw new Error("Mounting height cannot exceed the indoor ceiling height.");
  if (i.quantity % 1)
    throw new Error("Fixture quantity must be a whole number.");
  if (i.outdoor && i.rating === "Indoor")
    throw new Error(
      "Outdoor spaces need outdoor-rated fixtures. Change fixture suitability.",
    );
  if (i.outdoor && i.ip === "IP20")
    throw new Error(
      "IP20 has no water protection. Choose protection appropriate to outdoor exposure.",
    );
  if (i.mixed && i.layers.length > 12)
    throw new Error("Use at most 12 supplemental lighting groups.");
  const layers = i.mixed ? i.layers : [];
  for (const l of layers) {
    if (!fixtureTypes.includes(l.type))
      throw new Error("Choose a supported layer fixture.");
    between(l.quantity, 0, 1000, `${l.role} quantity`);
    if (l.quantity % 1)
      throw new Error("Layer quantities must be whole numbers.");
    between(l.lumens, 1, 100000, "Layer lumens");
    between(l.watts, 0.1, 2000, "Layer watts");
    between(l.uf, 0.1, 1, "Layer UF");
    between(l.mf, 0.1, 1, "Layer MF");
  }
  const area = i.length * i.width,
    target = i.lux * i.brightness,
    delivered = area * target,
    lumens = delivered / (i.uf * i.mf),
    luminaireLumens = i.lumens * (i.sourceOutput ? i.opticalEfficiency : 1),
    effective = luminaireLumens * i.uf * i.mf,
    layerDelivered = layers.reduce(
      (s, l) => s + (l.contributes ? l.quantity * l.lumens * l.uf * l.mf : 0),
      0,
    ),
    count = Math.max(0, Math.ceil((delivered - layerDelivered) / effective));
  if (count > 10000)
    throw new Error(
      "More than 10,000 primary fixtures would be required. Review output, dimensions and target.",
    );
  const installed = i.quantity > 0 ? i.quantity : count,
    achieved = (installed * effective + layerDelivered) / area,
    mounting = i.mount - i.plane,
    diameter = 2 * mounting * Math.tan((i.beam * Math.PI) / 360),
    spacing = installed ? Math.sqrt(area / installed) : 0;
  let best = { cols: 0, rows: 0, score: Infinity };
  for (let cols = 1; cols <= installed; cols++) {
    const rows = Math.ceil(installed / cols),
      score =
        Math.abs(Math.log(i.length / cols / (i.width / rows))) +
        (cols * rows - installed) / installed;
    if (score < best.score) best = { cols, rows, score };
  }
  const extraPower = layers.reduce((s, l) => s + l.quantity * l.watts, 0),
    power = installed * i.watts + extraPower,
    primaryPower = installed * i.watts,
    totalUnits = installed + layers.reduce((s, l) => s + l.quantity, 0),
    kwh = (power / 1000) * i.hours * i.days * (i.dimmable ? i.dimming : 1),
    layoutSpacing = Math.min(spacing, diameter * (1 - i.overlap)),
    spacingX = best.cols ? i.length / best.cols : 0,
    spacingY = best.rows ? i.width / best.rows : 0;
  return {
    groups: [
      {
        id: "primary",
        role: "Primary",
        type: i.type,
        quantity: installed,
        power: primaryPower,
        maintainedLm: installed * effective,
        contributes: true,
      },
      ...layers.map((l) => ({
        id: l.id,
        role: l.role === "Ambient" ? "Secondary" : l.role,
        type: l.type,
        quantity: l.quantity,
        power: l.quantity * l.watts,
        maintainedLm: l.contributes ? l.quantity * l.lumens * l.uf * l.mf : 0,
        contributes: l.contributes,
      })),
    ],
    area,
    target,
    delivered,
    lumens,
    luminaireLumens,
    effective,
    layerDelivered,
    count,
    installed,
    totalUnits,
    achieved,
    diameter,
    power,
    primaryPower,
    extraPower,
    efficacy: luminaireLumens / i.watts,
    systemEfficacy: power
      ? (installed * luminaireLumens +
          layers.reduce((s, l) => s + l.quantity * l.lumens, 0)) /
        power
      : 0,
    powerDensity: power / area,
    kwh,
    cost: kwh * i.tariff,
    spacing,
    layoutSpacing,
    spacingX,
    spacingY,
    wallX: spacingX / 2,
    wallY: spacingY / 2,
    roomIndex: (i.length * i.width) / (mounting * (i.length + i.width)),
    runLength: Math.min(i.length, i.width) * 2 * 0.8,
    ...best,
  };
}
export type Calculation = ReturnType<typeof calculate>;
