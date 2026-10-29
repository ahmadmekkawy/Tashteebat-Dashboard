import { Inputs, normalizeInputs } from "./engine";
import { rooms, fixtureTypes } from "./data/catalog";
export interface Project {
  id: string;
  date: string;
  inputs: Inputs;
  favorite?: boolean;
}
export const makeId = () =>
  globalThis.crypto?.randomUUID?.() ||
  `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function readProjects(): Project[] {
  try {
    const data: unknown = JSON.parse(
      localStorage.getItem("luma-projects") || "[]",
    );
    if (!Array.isArray(data)) return [];
    return data.flatMap((p) => {
      try {
        if (typeof p?.id !== "string" || typeof p?.date !== "string") return [];
        if (
          !p.inputs ||
          typeof p.inputs.name !== "string" ||
          !rooms.some((r) => r[0] === p.inputs.room) ||
          !fixtureTypes.includes(p.inputs.type)
        )
          return [];
        const inputs = normalizeInputs({
          ...p.inputs,
          name: p.inputs.name.trim() || "Untitled space",
        });
        // Keep editable legacy plans even if stricter new engineering validation rejects them.
        // Their original browser storage remains untouched until an explicit user action.
        return [{ id: p.id, date: p.date, inputs, favorite: !!p.favorite }];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
export function readRecent(): string[] {
  try {
    const data = JSON.parse(localStorage.getItem("luma-recent") || "[]");
    return Array.isArray(data)
      ? data.filter((v) => typeof v === "string").slice(0, 6)
      : [];
  } catch {
    return [];
  }
}
