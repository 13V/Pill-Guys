// Level 3 HAZARDS + springs — "Furnace Gaps".
// - Spikeblock LANES: lethal spikeblocks placed OFF the center lane (cz +/-1.8)
//   on the wide hubs D and H, framing a guaranteed-safe center path (each block
//   only occupies ~+/-0.6 in x/z, so cz=0 has >1u of clearance). A slight weave.
// - One decorative (non-lethal) sawblade on hub D for menace; it has no death
//   sensor, so it never blocks the path.
// - Spring #1 (pad G, top 5) lifts up to the raised hub H (top 8).
// - Spring #2 (deck I, top 5) lifts up to the finish tower (top 10).
export const hazards = [
  { kind: 'spikeblock', cx: 21, cz: 1.8 },                  // hub D lane block (right) — safe center
  { kind: 'spikeblock', cx: 23, cz: -1.8 },                 // hub D lane block (left)  — slight weave
  { kind: 'sawblade', cx: 22, cz: 0 },                      // decorative menace on hub D (non-lethal)
  { kind: 'spikeblock', cx: 46, cz: 1.8, top: 8 },          // raised hub H lane block (right)
  { kind: 'spikeblock', cx: 48, cz: -1.8, top: 8 },         // raised hub H lane block (left)
  { kind: 'cone', cx: 35, cz: 1.6 },                        // warn: gap after conveyor
  { kind: 'cone', cx: 35, cz: -1.6 },
];
export const springs = [
  { cx: 43, cz: 0 },                                        // spring #1: pad G -> raised hub H (top 8)
  { cx: 53, cz: 0 },                                        // spring #2: deck I -> finish tower (top 10)
];
