// Level 2 HAZARDS + springs — "Coolant Causeway".
// - Two spike gauntlets sit on the wide strips (B and E) with solid deck on both
//   sides to land on; each spike run is <=4u long.
// - The lethal sawblade is OFF the center lane (cz +1.5) on the 6-wide saw hub C,
//   so the center/left is a guaranteed safe lane. Cones warn the player.
// - One spring on pad F launches up to the finish tower (top 10).
export const hazards = [
  { kind: 'spikes', cx: 11, cz: 0, size: 4 },               // gauntlet #1 on strip B (x 9..13; land x6..9 & 13..16)
  { kind: 'sawblade', cx: 19, cz: 1.5, lethal: true },      // lethal saw off-lane on hub C; safe lane cz<=0
  { kind: 'sawblade', cx: 19, cz: -1.8 },                   // decorative twin (menace only) on the safe side
  { kind: 'spikes', cx: 34, cz: 0, size: 4 },               // gauntlet #2 on strip E (x 32..36; land x29..32 & 36..39)
  { kind: 'cone', cx: 17.4, cz: 1.5 },                      // warn: lethal saw lane ahead
  { kind: 'cone', cx: 20.6, cz: 1.5 },
  { kind: 'cone', cx: 31, cz: 1.4 },                        // flank gauntlet #2
  { kind: 'cone', cx: 37, cz: 1.4 },
];
export const springs = [{ cx: 41, cz: 0 }];                 // pad F -> finish tower
