// Level 4 hazards: a jump-over spike gauntlet, a lethal saw off the center lane
// (safe to pass at z=0), warning cones. Spring lifts to the finish.
export const hazards = [
  { kind: 'spikes', cx: 12, cz: 0, size: 4 },           // jump-over (takeoff x6..10, land x14..18)
  { kind: 'sawblade', cx: 41, cz: 1.5, lethal: true },  // saw hub: lethal in +Z lane, center/left safe
  { kind: 'cone', cx: 38.5, cz: 0 }, { kind: 'cone', cx: 14, cz: 1.6 },
];
export const springs = [{ cx: 63, cz: 0 }];
