// INPUT — keyboard (+ optional touch). Owned by the INPUT agent.
//
// export function createInput() -> {
//   axisX(): number   // -1..1  (A/Left = -1, D/Right = +1)
//   axisZ(): number   // -1..1  (W/Up = -1 i.e. "forward", S/Down = +1)
//   jumpHeld(): boolean
//   consumeJump(): boolean   // true exactly once per keypress (edge-triggered), then clears
//   restartPressed(): boolean // edge-triggered (R / Enter)
//   dispose()
// }
//
// Implementation notes for the agent: track held keys in a Set on keydown/keyup;
// latch a "jumpQueued" flag on jump keydown that consumeJump() clears so presses
// between frames aren't missed. Support WASD + arrow keys; jump = Space/W/Up.
export function createInput() {
  return {
    axisX: () => 0,
    axisZ: () => 0,
    jumpHeld: () => false,
    consumeJump: () => false,
    restartPressed: () => false,
    dispose() {},
  };
}
