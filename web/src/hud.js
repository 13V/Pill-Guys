// HUD — DOM overlay. Owned by the INTERACTIONS+HUD agent (this agent owns hud.js AND interactions.js).
//
// export function createHUD(totalCoins) -> {
//   addCoin(),                 // increment collected count
//   setCoins(n, total),
//   flashDeath(),              // brief red vignette / "Ouch!" on death+respawn
//   win(),                     // show a celebratory "Finish!" banner with a Restart button
//   reset(),                   // back to playing state, zero coins
//   onRestart(cb),             // register restart-button / R-key callback
//   get coins(),
// }
// Build fixed-position DOM elements (pointer-events:none except the restart button). Style it to match the
// bright toy aesthetic (rounded, soft shadow, the blue/yellow palette). Keep it lightweight.
export function createHUD(totalCoins = 0) {
  let coins = 0;
  return {
    addCoin() { coins++; },
    setCoins() {},
    flashDeath() {},
    win() {},
    reset() { coins = 0; },
    onRestart() {},
    get coins() { return coins; },
  };
}
