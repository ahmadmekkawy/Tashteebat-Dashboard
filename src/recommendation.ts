import { Inputs, ExtraLayer, calculate } from "./engine";
import { createLayer } from "./data/layerPresets";
import {
  rooms,
  roomGuidance,
  fixturePresets,
  sceneAdvice,
} from "./data/catalog";
import { fixtureAdvice } from "./data/advice";
export function recommend(i: Inputs): Inputs {
  const room = rooms.find((r) => r[0] === i.room) || rooms[0],
    g = roomGuidance[i.room];
  const lux =
    i.goal === "bright"
      ? g.max
      : i.goal === "functional"
        ? Math.max(room[1], Math.min(g.max, 500))
        : room[1];
  const primary = i.outdoor
    ? i.room === "Facade"
      ? "Facade lights"
      : ["Terrace", "Outdoor seating"].includes(i.room)
        ? "Wall-mounted lights"
        : "Outdoor bollards"
    : /office|meeting|garage|laundry|gym/i.test(i.room)
      ? "Linear LED profiles"
      : "Downlights";
  const preset = fixturePresets[primary];
  const layers: ExtraLayer[] = [
    createLayer("Secondary", i.outdoor, "secondary"),
    {
      id: "task",
      role: "Task",
      type: i.outdoor
        ? "Wall-mounted lights"
        : /kitchen|pantry/i.test(i.room)
          ? "Linear LED profiles"
          : "Table lamps",
      quantity: /kitchen|office|laundry|pantry/i.test(i.room) ? 2 : 0,
      lumens: 500,
      watts: 6,
      uf: 0.6,
      mf: 0.8,
      contributes: false,
    },
    {
      id: "accent",
      role: "Accent",
      type: i.outdoor ? "Landscape lights" : "Adjustable spotlights",
      quantity: /retail|showroom/i.test(i.room) ? 2 : 0,
      lumens: 400,
      watts: 5,
      uf: 0.4,
      mf: 0.8,
      contributes: false,
    },
    {
      id: "decorative",
      role: "Decorative",
      type: i.outdoor ? "Wall-mounted lights" : "Cove lighting",
      quantity: /office|garage|pantry|laundry|pathway|staircase/i.test(i.room)
        ? 0
        : 2,
      lumens: 1200,
      watts: 12,
      uf: 0.25,
      mf: 0.8,
      contributes: false,
    },
  ];
  return {
    ...i,
    lux,
    brightness: 1,
    kelvin: i.goal === "atmospheric" ? g.cct[0] : room[3],
    type: primary,
    lumens: preset.lumens,
    watts: preset.watts,
    beam: 60,
    mount: primary === "Outdoor bollards" ? 0.8 : i.height,
    quantity: 0,
    uf: i.outdoor ? 0.4 : 0.6,
    mf: 0.8,
    plane: i.outdoor ? 0 : Math.min(0.75, i.height - 0.1),
    cri: 90,
    dimmable: true,
    rating: i.outdoor ? "Outdoor" : "Indoor",
    ip: i.outdoor ? "IP65" : "IP20",
    mixed: true,
    layers,
    sourceOutput: false,
    dimension: preset.kind === "linear" ? 1000 : 90,
  };
}
export function guidance(i: Inputs) {
  const g = roomGuidance[i.room],
    r = calculate(i);
  return {
    range: `${g.min}–${g.max}`,
    default: rooms.find((x) => x[0] === i.room)![1],
    cct: `${g.cct[0]}–${g.cct[1]} K`,
    strategy: fixtureAdvice(i.room, i.outdoor),
    scene: sceneAdvice[i.scene] || sceneAdvice.Evening,
    daylight:
      i.daylight === "No natural light"
        ? "Size electric lighting for all occupied tasks."
        : "Daylight can reduce operating energy using sensors or manual dimming. No unmeasured daylight credit has been applied.",
    glare: /office|meeting/i.test(i.room)
      ? "Select low-glare luminaires and verify UGR for the actual layout; UGR is not calculated here. Avoid screen reflections."
      : "Shield direct views of bright sources. Prefer diffuse light near seating and position accents outside normal sight lines.",
    spacing: `A symmetric cone spans ${r.diameter.toFixed(1)} m. With ${Math.round(i.overlap * 100)}% geometric overlap, start at ≤ ${(r.diameter * (1 - i.overlap)).toFixed(1)} m centers; verify photometry.`,
    run: `Concept: two runs of ${(Math.min(i.length, i.width) * 0.8).toFixed(1)} m (≈ ${r.runLength.toFixed(1)} m total), along the shorter room dimension, at about one-third and two-thirds of the longer dimension. Confirm furniture, module outputs and driver capacities.`,
    needsPhotometry:
      /facade|wall|cove|ground|landscape/i.test(i.type) || i.outdoor,
  };
}
