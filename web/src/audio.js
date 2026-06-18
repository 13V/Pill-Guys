// AUDIO — synthesized sound effects via WebAudio. Owned by the AUDIO agent.
//
// export function createAudio(events) -> { resume(), dispose() }
//   Subscribe to gameplay events and play short, pleasant synthesized SFX (no asset
//   files): 'jump' (rising blip), 'coin' (bright two-note ping), 'spring' (boing),
//   'death' (descending buzz/thud), 'finish' (little victory arpeggio).
//   Lazily create one AudioContext; browsers block audio until a user gesture, so
//   resume() the context on the first keydown/pointerdown (add a one-shot listener).
//   Use oscillators + gain envelopes (and noise for death). Keep master volume modest
//   (~0.2). Guard if WebAudio is unavailable (no throw in headless).
export function createAudio(events) {
  return { resume() {}, dispose() {} };
}
