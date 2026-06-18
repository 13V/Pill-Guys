// Level 4 HAZARDS + springs — "Fracture Foundry" (multi-route, 2nd hardest).
//
// Per-lane risk (see ../../../MULTI_ROUTE_DESIGN.md). Real, ON-THE-LINE hazards
// live on the RISKY (near, z=+3) lanes; the SAFE (far, z=-3) lanes are clear. The
// only lethal pieces on the shared spine are CENTER spikeblocks that block z≈0
// (z -0.6..+0.6) on the rejoin hubs — both side lanes (z=±3) clear them by >2u, so
// you can't bowl down the middle and must commit to a side (the L3 pattern).
//
// DIFFICULTY (audit fix — L4 > L3): L3's risky lanes each carry ONE on-line threat;
// L4's carry TWO apiece, over WIDER gaps:
// - BRANCH 1 RISKY (z+3): a size-4 SPIKE GAUNTLET (cx29; spike box x27..31, land on
//   the w2 strips at x23..27 and x31..34), IMMEDIATELY followed by a 4u jump-gap
//   (x34..38) off the w2 mid-landing onto the bridge end (x38..40). Two back-to-back
//   leaps off narrow w2 decks — strictly harder than L3-B1's single gauntlet.
// - BRANCH 2 RISKY (z+3): a 4.5u belt-assisted JUMP-GAP (x63.5..68) with a LETHAL
//   sawblade IN the pit (cx65.75) — the same leap that clears the gap clears the saw
//   (the L3-B2 pit-saw model). This REPLACES the old off-line cz+4.6 flank saw that
//   the audit flagged as never threatening the walked line. The gap is 4.5u vs L3's
//   4u, and lands directly on the rejoin hub.
// SAFE lanes (z-3) are clear, continuous w2 walks the whole way.
export const hazards = [
  // Branch 1 RISKY (near) lane — size-4 spike gauntlet, then (via path.js) a 4u gap.
  { kind: 'spikes', cx: 29, cz: 3, size: 4 },            // gauntlet (box x27..31; land x23..27 & x31..34)

  // D saw hub / rejoin 1 — decorative saw (NO lethal flag => no death sensor) for the
  // signature "saw hub" look, plus a lethal CENTER spikeblock so you must hold a lane.
  { kind: 'sawblade', cx: 43, cz: 1.5 },                 // signature saw-hub menace; never blocks a lane
  { kind: 'spikeblock', cx: 43, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Branch 2 RISKY (near) lane — LETHAL sawblade DOWN IN the 4.5u pit (top:3, ~2u
  // below the deck), on the walked z=3 line. A clean leap arcs clear over it; a
  // BLOWN jump drops onto the saw (death box y2.4..4.4) — the gap is the on-line
  // risk, the saw is the in-pit consequence (the audit's prescribed conversion of
  // the old off-line cz+4.6 flank). Mirrors L3-B2's pit-saw idea.
  { kind: 'sawblade', cx: 65.75, cz: 3, top: 3, lethal: true }, // in-pit saw (box x64.2..67.4, y2.4..4.4; clean jump clears it, a fall hits it)

  // G rejoin hub 2 — lethal CENTER spikeblock so you must hold a lane (springs at cx72).
  { kind: 'spikeblock', cx: 70, cz: 0 },                 // center block (z -0.6..+0.6; side lanes clear by >2u)

  // Warning cones (decorative): flag each risky lane's hazards.
  { kind: 'cone', cx: 26.4, cz: 3 },                     // B1 risky gauntlet entry
  { kind: 'cone', cx: 34.6, cz: 3 },                     // B1 risky gap edge (after gauntlet)
  { kind: 'cone', cx: 62.8, cz: 3 },                     // B2 risky pit edge (run-up end)
  { kind: 'cone', cx: 68.5, cz: 3 },                     // B2 risky pit landing edge (on hub G)
];

// One spring PER LANE on rejoin hub G (cz -3/0/+3), lifting whichever side you
// committed to up the finish tower (top 5 -> top 10; ~3u forward arc onto the d6 tower).
export const springs = [
  { cx: 72, cz: -3 },                                    // SAFE-lane spring
  { cx: 72, cz: 0 },                                     // center spring
  { cx: 72, cz: 3 },                                     // RISKY-lane spring
];
