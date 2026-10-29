export const rooms = [
  [
    "Living room",
    200,
    "Relaxed ambient light, with brighter reading areas.",
    2700,
  ],
  [
    "Bedroom",
    100,
    "Soft ambient lighting with separate bedside task light.",
    2700,
  ],
  [
    "Dining room",
    150,
    "A focused pendant over the table and soft surrounding light.",
    2700,
  ],
  [
    "Kitchen",
    300,
    "General lighting; provide about 500 lux at preparation surfaces.",
    3500,
  ],
  [
    "Bathroom",
    200,
    "Even ambient light with dedicated vertical mirror lighting.",
    3500,
  ],
  [
    "Reception",
    300,
    "Welcoming general light with clear reception task lighting.",
    3000,
  ],
  ["Corridor", 100, "Continuous, comfortable orientation lighting.", 3000],
  [
    "Staircase",
    100,
    "Make every tread and landing legible; manage glare.",
    3000,
  ],
  [
    "Home office",
    500,
    "Task-plane lighting for reading, writing and screen work.",
    4000,
  ],
  [
    "Commercial office",
    500,
    "Reading, writing and data processing task areas.",
    4000,
  ],
  [
    "Meeting room",
    500,
    "Support reading, meetings and dimmable presentation scenes.",
    3500,
  ],
  [
    "Retail area",
    300,
    "General sales-area light; add product accent lighting.",
    3500,
  ],
  [
    "Showroom",
    300,
    "Ambient lighting supplemented by product-specific accents.",
    3500,
  ],
  [
    "Garage",
    150,
    "General parking light; add task lights at work benches.",
    4000,
  ],
  ["Garden", 20, "Low-level, shielded light only where needed.", 2700],
  ["Terrace", 50, "Gentle outdoor ambient light with shielded sources.", 2700],
  ["Pathway", 10, "Low-level wayfinding; verify uniformity separately.", 2700],
  [
    "Facade",
    50,
    "Illustrative accent target; facade design needs vertical photometry.",
    2700,
  ],
  [
    "Outdoor seating",
    50,
    "Warm, low-glare light at seating and circulation areas.",
    2700,
  ],
  ["Entrance", 100, "Make thresholds and faces clearly visible.", 3000],
  [
    "Laundry room",
    300,
    "Useful general lighting with brighter inspection areas.",
    4000,
  ],
  ["Pantry", 200, "Illuminate shelves without casting shadows.", 3000],
  [
    "Home Gym room",
    300,
    "Even light for movement, avoiding glare in mirrors.",
    4000,
  ],
] as const;
export const fixtureTypes = [
  "Recessed spotlights",
  "Surface-mounted spotlights",
  "Downlights",
  "Adjustable spotlights",
  "Magnetic track lighting",
  "Conventional track lighting",
  "Linear LED profiles",
  "Cove lighting",
  "Chandeliers",
  "Pendant lights",
  "Wall-mounted lights",
  "Wall washers",
  "Floor lights",
  "Step lights",
  "Table lamps",
  "Floor lamps",
  "Outdoor bollards",
  "Landscape lights",
  "Facade lights",
  "Ground-recessed lights",
  "Flood lights",
  "Decorative lighting",
];
export const kelvins = [
  1800, 2200, 2700, 3000, 3500, 4000, 4500, 5000, 6000, 6500,
];
export const tempLabels = [
  "Candle / amber",
  "Very warm",
  "Warm white",
  "Warm white",
  "Neutral warm",
  "Neutral white",
  "Cool neutral",
  "Daylight",
  "Cool daylight",
  "Very cool daylight",
];

export interface RoomGuidance {
  min: number;
  max: number;
  cct: [number, number];
  basis: "workplace task" | "design guidance";
  outdoor: boolean;
}
const ranges: Record<string, [number, number]> = {
  "Living room": [100, 300],
  Bedroom: [100, 200],
  "Dining room": [100, 200],
  Kitchen: [300, 500],
  Bathroom: [200, 300],
  Reception: [300, 500],
  Corridor: [100, 150],
  Staircase: [100, 150],
  "Home office": [300, 500],
  "Commercial office": [500, 750],
  "Meeting room": [500, 750],
  "Retail area": [300, 500],
  Showroom: [300, 500],
  Garage: [100, 200],
  Garden: [5, 30],
  Terrace: [20, 100],
  Pathway: [5, 20],
  Facade: [20, 100],
  "Outdoor seating": [20, 100],
  Entrance: [100, 200],
  "Laundry room": [200, 500],
  Pantry: [100, 300],
  "Home Gym room": [200, 500],
};
export const roomGuidance: Record<string, RoomGuidance> = Object.fromEntries(
  rooms.map((r) => [
    r[0],
    {
      min: ranges[r[0]][0],
      max: ranges[r[0]][1],
      cct: r[3] <= 3000 ? [2700, 3000] : [3500, 4000],
      basis: [
        "Commercial office",
        "Meeting room",
        "Reception",
        "Retail area",
      ].includes(r[0])
        ? "workplace task"
        : "design guidance",
      outdoor: [
        "Garden",
        "Terrace",
        "Pathway",
        "Facade",
        "Outdoor seating",
      ].includes(r[0]),
    },
  ]),
);
export const beamPresets = [
  { name: "Accent", angle: 24, description: "Focused art or feature lighting" },
  { name: "Focused", angle: 36, description: "Controlled pools of light" },
  { name: "General", angle: 60, description: "Broad ambient downlighting" },
  { name: "Wide", angle: 90, description: "Wide general coverage" },
];
export const ipRatings = [
  {
    code: "IP20",
    meaning: "Finger protection; no water protection.",
    use: "Dry indoor spaces only.",
  },
  {
    code: "IP44",
    meaning: "Objects ≥1 mm; splashing water.",
    use: "Sheltered splash exposure, subject to certification.",
  },
  {
    code: "IP54",
    meaning: "Dust protected; splashing water.",
    use: "Sheltered outdoor exposure.",
  },
  {
    code: "IP65",
    meaning: "Dust tight; water jets.",
    use: "Exposed outdoor fixtures, with suitable certification.",
  },
  {
    code: "IP66",
    meaning: "Dust tight; powerful water jets.",
    use: "Heavier jet exposure; check installation conditions.",
  },
  {
    code: "IP67",
    meaning: "Dust tight; temporary immersion under test conditions.",
    use: "Ground-recessed fixtures; drainage still required.",
  },
  {
    code: "IP68",
    meaning: "Dust tight; immersion conditions set by manufacturer.",
    use: "Specialist water applications; verify depth and duration.",
  },
];
export interface FixturePreset {
  lumens: number;
  watts: number;
  beam: number;
  kind: "spot" | "linear" | "pendant" | "wall" | "ground";
  use: string;
  outdoor: boolean;
}
export const fixturePresets: Record<string, FixturePreset> = Object.fromEntries(
  fixtureTypes.map((type) => {
    const linear = /linear|cove|track/i.test(type),
      pendant = /pendant|chandelier|decorative/i.test(type),
      ground = /bollard|ground|landscape|step/i.test(type),
      wall = /wall|facade/i.test(type);
    return [
      type,
      {
        lumens: linear ? 1200 : pendant ? 1200 : ground ? 400 : 800,
        watts: linear ? 12 : pendant ? 15 : ground ? 5 : 9,
        beam: linear ? 90 : pendant ? 120 : ground ? 60 : 60,
        kind: linear
          ? "linear"
          : pendant
            ? "pendant"
            : ground
              ? "ground"
              : wall
                ? "wall"
                : "spot",
        use: linear
          ? "Continuous ambient or task light; track heads can add accents."
          : pendant
            ? "Decorative focal point; check useful task-plane output."
            : ground
              ? "Shielded low-level guidance or landscape accents."
              : wall
                ? "Light vertical surfaces or circulation areas."
                : "Directional ambient or accent light; manage direct glare.",
        outdoor: /outdoor|landscape|facade|ground|flood/i.test(type),
      },
    ];
  }),
);
export const lightingGoals = [
  {
    id: "balanced",
    label: "Balanced",
    description: "Comfortable everyday light, with flexible layers.",
  },
  {
    id: "functional",
    label: "Functional",
    description: "Prioritize clarity on reading and work surfaces.",
  },
  {
    id: "atmospheric",
    label: "Atmospheric",
    description: "Warm layers and low-glare dimming scenes.",
  },
  {
    id: "bright",
    label: "Bright",
    description: "Aim toward the upper room design range.",
  },
] as const;
export const sceneAdvice: Record<string, string> = {
  Daytime:
    "Keep the full electric-light design available. Use daylight sensing or manual dimming near windows rather than subtracting unmeasured daylight.",
  Evening:
    "Use separate ambient and task circuits; warm dimmable light keeps the room comfortable while maintaining task light where needed.",
  "Night / ambience":
    "Dim selected ambient or decorative circuits for atmosphere. Keep stairs, paths and task areas sufficiently lit; this scene does not replace the design illuminance.",
};
export const disclaimer =
  "The calculator provides preliminary design guidance and approximate lighting recommendations. Final lighting design for construction should be verified by a qualified lighting designer, electrical engineer, or architect, especially for commercial, workplace, emergency, or regulated environments.";

export const spacePresets = [
  {
    label: "Cozy living room",
    room: "Living room",
    length: 4,
    width: 3,
    height: 2.8,
  },
  {
    label: "Family living room",
    room: "Living room",
    length: 5,
    width: 4,
    height: 2.8,
  },
  {
    label: "Home workspace",
    room: "Home office",
    length: 3.5,
    width: 3,
    height: 2.8,
  },
  {
    label: "Kitchen & prep",
    room: "Kitchen",
    length: 4,
    width: 3.5,
    height: 2.8,
  },
  { label: "Outdoor terrace", room: "Terrace", length: 5, width: 4, height: 3 },
] as const;
