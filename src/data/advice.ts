/** Preliminary fixture choices, separate from numeric illuminance targets. */
export function fixtureAdvice(room: string, outdoor: boolean): string {
  if (room === "Facade")
    return "Use shielded facade lights or wall washers. Aim and output need a vertical photometric study.";
  if (room === "Pathway")
    return "Use shielded outdoor bollards or step lights for continuous guidance without dazzling pedestrians.";
  if (outdoor)
    return "Combine outdoor-rated wall lights or bollards with restrained landscape accents; shield sources and use timers.";
  if (room === "Kitchen" || room === "Pantry")
    return "Pair broad downlights with linear LED profiles under cabinets to illuminate worktops and shelving.";
  if (room === "Bathroom")
    return "Pair suitably protected downlights with diffuse wall-mounted lights at both sides of the mirror. Verify bathroom electrical zones.";
  if (room === "Bedroom")
    return "Use soft ceiling or cove lighting, dimmable bedside table lamps and focused reading lights.";
  if (room === "Dining room")
    return "Center a dimmable pendant or chandelier over the table; use wall lights for a gentle surrounding layer.";
  if (["Home office", "Commercial office", "Meeting room"].includes(room))
    return "Use diffuse linear or low-glare ceiling luminaires, with desk task lights and separate presentation controls.";
  if (["Retail area", "Showroom"].includes(room))
    return "Use downlights for ambient light and adjustable track spotlights or wall washers to model merchandise.";
  if (room === "Staircase" || room === "Corridor")
    return "Use evenly spaced wall or ceiling lights; add shielded step lights to reveal changes of level.";
  if (room === "Garage" || room === "Laundry room" || room === "Home Gym room")
    return "Use diffuse linear ceiling lights for even coverage. Add task lighting where work requires finer detail.";
  return "Combine wide-beam downlights, focused floor or table lamps and soft wall lights for balanced ambient, task and accent layers.";
}
