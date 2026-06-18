// Level 5 hazards: two conveyor-fed spike gauntlets, a lethal saw off-lane, a
// center-thread between two spikeblocks, a spring to the finish.
export const hazards = [
  { kind: 'spikes', cx: 19, cz: 0, size: 4 },                       // M1 conveyor-fed gauntlet
  { kind: 'sawblade', cx: 47, cz: 1.5, lethal: true },              // M2 saw hub (center/left safe)
  { kind: 'spikeblock', cx: 64, cz: 1.8, dir: 'up', color: 'red' }, // M3 thread the center
  { kind: 'spikeblock', cx: 64, cz: -1.8, dir: 'up', color: 'red' },
  { kind: 'spikes', cx: 74, cz: 0, size: 4 },                       // M4 gauntlet
  { kind: 'cone', cx: 17, cz: 1.6 }, { kind: 'cone', cx: 72, cz: 1.6 },
];
export const springs = [{ cx: 83, cz: 0 }];
