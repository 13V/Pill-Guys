// AUDIO — synthesized sound effects via WebAudio. Owned by the AUDIO agent.
//
// export function createAudio(events) -> { resume(), dispose() }
//   Subscribe to gameplay events and play short, pleasant synthesized SFX (no asset
//   files): 'jump' (rising blip), 'coin' (bright two-note ping), 'spring' (boing),
//   'death' (descending buzz/thud), 'finish' (little victory arpeggio),
//   'land' (soft low thud/plop, scaled by landing strength).
//   Lazily create one AudioContext; browsers block audio until a user gesture, so
//   resume() the context on the first keydown/pointerdown (add a one-shot listener).
//   Use oscillators + gain envelopes (and noise for death). Keep master volume modest
//   (~0.2). Guard if WebAudio is unavailable (no throw in headless).

const MASTER_GAIN = 0.18;

export function createAudio(events) {
  // Resolve the constructor once. If WebAudio is missing (e.g. headless/SSR),
  // everything below becomes a no-op — we must never throw.
  const AudioCtor =
    typeof window !== 'undefined' &&
    (window.AudioContext || window.webkitAudioContext);

  let ctx = null;        // the single, lazily-created AudioContext
  let master = null;     // master gain node, sits in front of the destination
  let noiseBuffer = null; // shared short white-noise buffer (for the death thump)
  let disposed = false;

  // --- AudioContext lifecycle ------------------------------------------------

  // Create the context on first real use so we don't spin one up in headless
  // environments or before the page is interactive.
  function ensureCtx() {
    if (disposed || !AudioCtor) return null;
    if (ctx) return ctx;
    try {
      ctx = new AudioCtor();
      master = ctx.createGain();
      master.gain.value = MASTER_GAIN;
      master.connect(ctx.destination);
    } catch {
      // Construction can throw in locked-down environments; stay silent.
      ctx = null;
      master = null;
    }
    return ctx;
  }

  // A short mono white-noise buffer, built once and reused for the death thump.
  function getNoiseBuffer() {
    if (!ctx) return null;
    if (noiseBuffer) return noiseBuffer;
    const len = Math.floor(ctx.sampleRate * 0.3); // ~300ms is plenty
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    noiseBuffer = buf;
    return noiseBuffer;
  }

  // --- Small synthesis helpers ----------------------------------------------

  // A single tone with an ADSR-ish gain envelope. Returns nothing; it's
  // fire-and-forget — nodes disconnect themselves on stop.
  //   t0       : start time (ctx.currentTime-relative absolute time)
  //   type     : 'sine' | 'square' | 'triangle' | 'sawtooth'
  //   freq     : starting frequency in Hz
  //   dur      : total note duration in seconds
  //   peak     : envelope peak gain (pre-master)
  //   options  : { glideTo, attack, release, detune, destination }
  function tone(t0, type, freq, dur, peak, options = {}) {
    if (!ctx) return;
    const {
      glideTo = null,     // optional target frequency for a linear pitch sweep
      attack = 0.008,     // seconds to reach peak
      release = null,     // seconds of release tail (defaults to most of dur)
      detune = 0,         // cents
      destination = master,
    } = options;

    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.detune.value = detune;
    osc.frequency.setValueAtTime(Math.max(1, freq), t0);
    if (glideTo != null) {
      // Exponential ramps feel more musical for pitch; guard against <= 0.
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, glideTo), t0 + dur);
    }

    const rel = release == null ? Math.max(0.04, dur * 0.7) : release;
    const susStart = Math.min(t0 + attack, t0 + dur);
    // ADSR-ish: fast attack to peak, then exponential decay to (near) silence.
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), susStart);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + rel);

    osc.connect(g);
    g.connect(destination);
    osc.start(t0);
    osc.stop(t0 + dur + rel + 0.02);
    // Free the graph once the note has fully finished.
    osc.onended = () => {
      try { osc.disconnect(); } catch { /* already gone */ }
      try { g.disconnect(); } catch { /* already gone */ }
    };
  }

  // A short filtered noise burst — the percussive "thump" under the death buzz.
  function noiseBurst(t0, dur, peak, filterFreq) {
    if (!ctx) return;
    const buf = getNoiseBuffer();
    if (!buf) return;
    const src = ctx.createBufferSource();
    src.buffer = buf;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(filterFreq, t0);
    lp.frequency.exponentialRampToValueAtTime(Math.max(80, filterFreq * 0.25), t0 + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t0 + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);

    src.connect(lp);
    lp.connect(g);
    g.connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
    src.onended = () => {
      try { src.disconnect(); } catch { /* already gone */ }
      try { lp.disconnect(); } catch { /* already gone */ }
      try { g.disconnect(); } catch { /* already gone */ }
    };
  }

  // --- The SFX ---------------------------------------------------------------

  // 'jump': a quick rising blip — square body gliding up ~A4->E5 over ~120ms.
  function playJump() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    // Tiny random pitch wobble (~0.96–1.04) so repeated jumps don't sound identical.
    const v = 0.96 + Math.random() * 0.08;
    tone(t, 'square', 440 * v, 0.12, 0.22, { glideTo: 660 * v, attack: 0.005, release: 0.05 });
    // A touch of triangle on top sweetens the edge of the square.
    tone(t, 'triangle', 880 * v, 0.1, 0.06, { glideTo: 1320 * v, attack: 0.005, release: 0.05 });
  }

  // 'coin': a bright two-note ping, E6 -> B6 on sine, with a little high sparkle.
  function playCoin() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    const E6 = 1318.51;
    const B6 = 1975.53;
    tone(t, 'sine', E6, 0.09, 0.18, { attack: 0.004, release: 0.05 });
    tone(t + 0.07, 'sine', B6, 0.12, 0.18, { attack: 0.004, release: 0.07 });
    // Faint, very short sparkle an octave up for a glassy shimmer.
    tone(t + 0.07, 'triangle', B6 * 2, 0.06, 0.04, { attack: 0.003, release: 0.04 });
  }

  // 'spring': a "boing" — fast upward pitch sweep on a sawtooth + triangle blend.
  function playSpring() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    // Big, fast glide upward is the core of the boing.
    tone(t, 'sawtooth', 180, 0.22, 0.16, { glideTo: 900, attack: 0.005, release: 0.08 });
    // A triangle following a slightly higher sweep fills it out and softens the saw.
    tone(t, 'triangle', 240, 0.22, 0.1, { glideTo: 1200, attack: 0.005, release: 0.08 });
  }

  // 'death': a descending buzz/thud — sawtooth sliding down + a low noise thump.
  function playDeath() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    // Buzzy saw dropping from a low-mid pitch down to a growl.
    tone(t, 'sawtooth', 320, 0.35, 0.18, { glideTo: 70, attack: 0.006, release: 0.1 });
    // A square an octave-ish below thickens the buzz.
    tone(t, 'square', 160, 0.3, 0.08, { glideTo: 50, attack: 0.006, release: 0.1 });
    // Percussive low thump on the downbeat.
    noiseBurst(t, 0.22, 0.22, 600);
  }

  // 'finish': a little ascending victory arpeggio (C5 E5 G5 C6).
  function playFinish() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const step = 0.11;
    notes.forEach((f, i) => {
      const last = i === notes.length - 1;
      // Triangle lead with a sine sub for a warm, chiptune-ish fanfare.
      tone(t + i * step, 'triangle', f, last ? 0.28 : 0.13, 0.16, {
        attack: 0.005,
        release: last ? 0.18 : 0.06,
      });
      tone(t + i * step, 'sine', f / 2, last ? 0.28 : 0.13, 0.06, {
        attack: 0.005,
        release: last ? 0.18 : 0.06,
      });
    });
  }

  // 'land': a short, soft, low "thud/plop" when the player touches down. Kept
  // well under the other SFX so frequent landings stay pleasant rather than
  // annoying. Scales with the landing strength via payload.hard / payload.airTime.
  function playLand(payload) {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    const hard = !!(payload && payload.hard);
    const airTime = (payload && typeof payload.airTime === 'number') ? payload.airTime : 0;
    // "Softness" of the touchdown: short hops are very gentle, longer falls firmer.
    const soft = !hard && airTime < 0.18;

    // Low blip that drops slightly in pitch — a triangle "plop". Harder landings
    // sit a little lower and a touch louder; soft ones are quieter and gentler.
    const startF = hard ? 180 : 160;
    const endF = hard ? 105 : 115;
    const blipPeak = soft ? 0.07 : (hard ? 0.13 : 0.1);
    const blipDur = soft ? 0.08 : (hard ? 0.12 : 0.1);
    tone(t, 'triangle', startF, blipDur, blipPeak, {
      glideTo: endF,
      attack: 0.004,
      release: soft ? 0.05 : 0.07,
    });

    // Body of the impact: a very short low-passed noise thump. Skip it entirely
    // on very soft landings so light hops are just the faint blip.
    if (!soft) {
      noiseBurst(t, hard ? 0.1 : 0.07, hard ? 0.1 : 0.06, hard ? 320 : 260);
    }
  }

  // 'beep': the 3-2-1 countdown ticks. Each tick is a clean blip that climbs in
  // pitch with the count index (payload.i = 0,1,2) so 3->2->1 rises toward the GO.
  function playBeep(payload) {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    const i = (payload && typeof payload.i === 'number') ? payload.i : 0;
    const f = 520 * Math.pow(2, i / 3); // ~520 / 655 / 825 Hz — a minor-third climb
    tone(t, 'square', f, 0.14, 0.16, { attack: 0.004, release: 0.09 });
    tone(t, 'sine', f * 2, 0.12, 0.05, { attack: 0.004, release: 0.06 }); // glassy top
  }

  // 'go': the green-light fanfare — a bright rising lead glide over a major triad
  // stab with a sub and a noise transient, louder/longer than a coin ping.
  function playGo() {
    if (!ensureCtx()) return;
    const t = ctx.currentTime;
    tone(t, 'square', 1046.5, 0.3, 0.18, { glideTo: 1318.5, attack: 0.004, release: 0.16 }); // C6 -> E6 snap
    [523.25, 659.25, 783.99].forEach((f) => tone(t, 'triangle', f, 0.32, 0.1, { attack: 0.005, release: 0.18 })); // C5/E5/G5
    tone(t, 'sine', 261.63, 0.32, 0.08, { attack: 0.006, release: 0.18 }); // C4 sub
    noiseBurst(t, 0.12, 0.1, 2400); // bright transient for punch
  }

  // 'whoosh': the screen-wipe swoosh between maps — a band-passed noise sweep
  // climbing in frequency, like air rushing past as the camera leaves the course.
  function playWhoosh() {
    if (!ensureCtx()) return;
    const buf = getNoiseBuffer();
    if (!buf) return;
    const t = ctx.currentTime;
    const dur = 0.5;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true; // the 0.3s noise loops to fill the sweep

    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.Q.value = 0.9;
    bp.frequency.setValueAtTime(300, t);
    bp.frequency.exponentialRampToValueAtTime(4000, t + dur);

    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.16, t + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    src.connect(bp);
    bp.connect(g);
    g.connect(master);
    src.start(t);
    src.stop(t + dur + 0.02);
    src.onended = () => {
      try { src.disconnect(); } catch { /* already gone */ }
      try { bp.disconnect(); } catch { /* already gone */ }
      try { g.disconnect(); } catch { /* already gone */ }
    };
  }

  // --- Resume on user gesture ------------------------------------------------

  // Browsers start the AudioContext 'suspended' and only allow it to run after a
  // user gesture. resume() can be called eagerly (e.g. by the game on boot); it
  // is a no-op until a gesture lands, after which the context unlocks.
  function resume() {
    const c = ensureCtx();
    if (c && typeof c.resume === 'function' && c.state !== 'closed') {
      // resume() returns a promise; swallow rejections (some browsers reject
      // when called without a gesture — the one-shot listener covers that case).
      c.resume().catch(() => {});
    }
  }

  // One-shot gesture listener: the first keydown/pointerdown resumes audio and
  // then removes itself so we never leak handlers.
  let gestureArmed = false;
  function onGesture() {
    removeGestureListeners();
    resume();
  }
  function addGestureListeners() {
    if (gestureArmed || typeof window === 'undefined' || !AudioCtor) return;
    gestureArmed = true;
    window.addEventListener('keydown', onGesture, { once: true });
    window.addEventListener('pointerdown', onGesture, { once: true });
  }
  function removeGestureListeners() {
    if (!gestureArmed || typeof window === 'undefined') return;
    gestureArmed = false;
    window.removeEventListener('keydown', onGesture);
    window.removeEventListener('pointerdown', onGesture);
  }

  // --- Event wiring ----------------------------------------------------------

  const unsubscribers = [];
  if (events && typeof events.on === 'function' && AudioCtor) {
    unsubscribers.push(events.on('jump', playJump));
    unsubscribers.push(events.on('coin', playCoin));
    unsubscribers.push(events.on('spring', playSpring));
    unsubscribers.push(events.on('death', playDeath));
    unsubscribers.push(events.on('finish', playFinish));
    unsubscribers.push(events.on('land', playLand));
    unsubscribers.push(events.on('beep', playBeep));
    unsubscribers.push(events.on('go', playGo));
    unsubscribers.push(events.on('whoosh', playWhoosh));
    addGestureListeners();
  }

  // --- Teardown --------------------------------------------------------------

  function dispose() {
    if (disposed) return;
    disposed = true;
    removeGestureListeners();
    for (const off of unsubscribers) {
      try { if (typeof off === 'function') off(); } catch { /* ignore */ }
    }
    unsubscribers.length = 0;
    if (ctx && ctx.state !== 'closed') {
      // close() returns a promise; we don't await it.
      try { ctx.close().catch(() => {}); } catch { /* ignore */ }
    }
    ctx = null;
    master = null;
    noiseBuffer = null;
  }

  return { resume, dispose };
}
