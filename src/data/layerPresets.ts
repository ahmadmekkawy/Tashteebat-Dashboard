import type { ExtraLayer, LayerRole } from "../engine";
export const layerDescriptions: Record<LayerRole, string> = {
  Ambient: "Additional general lighting from an older saved plan.",
  Secondary:
    "A second lighting system alongside the primary fixtures, such as magnetic track or linear profiles.",
  Decorative:
    "Cove, wall or feature lighting for atmosphere and visual character.",
  Task: "Focused lighting for reading, worktops or other specific activities.",
  Accent:
    "Directional lighting that brings artwork, materials or features into focus.",
};
export function createLayer(
  role: LayerRole,
  outdoor: boolean,
  id: string,
): ExtraLayer {
  const secondary = role === "Secondary",
    decorative = role === "Decorative";
  return {
    id,
    role,
    type: secondary
      ? outdoor
        ? "Wall-mounted lights"
        : "Magnetic track lighting"
      : decorative
        ? outdoor
          ? "Wall-mounted lights"
          : "Cove lighting"
        : role === "Accent"
          ? outdoor
            ? "Landscape lights"
            : "Adjustable spotlights"
          : "Table lamps",
    quantity: secondary ? (outdoor ? 1 : 4) : 2,
    lumens: secondary ? (outdoor ? 400 : 800) : decorative ? 1200 : 500,
    watts: secondary ? (outdoor ? 5 : 9) : decorative ? 12 : 6,
    uf: secondary ? (outdoor ? 0.4 : 0.6) : decorative ? 0.25 : 0.4,
    mf: 0.8,
    contributes: secondary,
  };
}
