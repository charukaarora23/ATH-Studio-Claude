/* Opt-in paper sounds, synthesised with Web Audio (placeholder until licensed samples are chosen).
   Off by default. Every cue has a visual equivalent. Failures are silent. */
(function (root) {
  'use strict';
  let ctx = null; let on = false; let volume = 0.6;
  function ac() { if (!ctx) { const C = root.AudioContext || root.webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx.state === 'suspended') ctx.resume(); return ctx; }
  function noise(dur, { from = 2400, to = 900, q = 0.8, gain = 0.25, attack = 0.01 } = {}) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 1.5;
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = q;
    f.frequency.setValueAtTime(from, c.currentTime); f.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
    const g = c.createGain(); g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(gain * volume, c.currentTime + attack); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
    src.connect(f).connect(g).connect(c.destination); src.start();
  }
  function tap() {
    const c = ac(); if (!c) return;
    const o = c.createOscillator(); const g = c.createGain(); o.type = 'sine';
    o.frequency.setValueAtTime(180, c.currentTime); o.frequency.exponentialRampToValueAtTime(70, c.currentTime + 0.12);
    g.gain.setValueAtTime(0.35 * volume, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.14);
    o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.15);
  }
  function tone(freq, dur, { type = 'triangle', gain = 0.16, delay = 0, attack = 0.012 } = {}) {
    const c = ac(); if (!c) return; const t = c.currentTime + delay;
    const o = c.createOscillator(); const g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * volume, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  // A kalimba-like pluck: a sine with a quick metallic overtone. Warm, small, hand-made.
  function pluck(freq, delay = 0, gain = 0.14) { tone(freq, 0.9, { type: 'sine', gain, delay, attack: 0.004 }); tone(freq * 4.2, 0.12, { type: 'sine', gain: gain * 0.35, delay, attack: 0.002 }); }
  // Paper: noise with a fluttering envelope, like a sheet moving through air.
  function rustle(dur, { from = 3000, to = 900, gain = 0.2, flutter = 14 } = {}) {
    const c = ac(); if (!c) return;
    const len = Math.floor(c.sampleRate * dur); const buf = c.createBuffer(1, len, c.sampleRate); const d = buf.getChannelData(0);
    let last = 0; for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; last = (last + 0.06 * w) / 1.06; const env = Math.sin(Math.PI * i / len) * (0.65 + 0.35 * Math.sin(i / c.sampleRate * flutter * 6.28)); d[i] = (w * 0.5 + last * 3) * env; }
    const src = c.createBufferSource(); src.buffer = buf; const f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.7;
    f.frequency.setValueAtTime(from, c.currentTime); f.frequency.exponentialRampToValueAtTime(to, c.currentTime + dur);
    const g = c.createGain(); g.gain.value = gain * volume; src.connect(f).connect(g).connect(c.destination); src.start();
  }
  function thump(freq = 120, gain = 0.3) { const c = ac(); if (!c) return; const o = c.createOscillator(); const g = c.createGain(); o.frequency.setValueAtTime(freq, c.currentTime); o.frequency.exponentialRampToValueAtTime(freq * 0.4, c.currentTime + 0.16); g.gain.setValueAtTime(gain * volume, c.currentTime); g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.2); o.connect(g).connect(c.destination); o.start(); o.stop(c.currentTime + 0.22); }
  let lastScratch = 0;
  const cues = {
    open: () => { rustle(0.6, { from: 1600, to: 500, gain: 0.22, flutter: 6 }); setTimeout(() => thump(90, 0.18), 520); },
    turn: () => rustle(0.38, { from: 3600, to: 1400, gain: 0.16, flutter: 18 }),
    flip: () => { rustle(0.62, { from: 4200, to: 900, gain: 0.22, flutter: 22 }); setTimeout(() => thump(140, 0.12), 560); },
    file: () => { rustle(0.7, { from: 2400, to: 400, gain: 0.2, flutter: 5 }); setTimeout(() => thump(70, 0.3), 640); },
    tick: () => tone(1900, 0.03, { type: 'square', gain: 0.025, attack: 0.001 }),
    pop: () => pluck(659.25, 0, 0.11),
    peel: () => { noise(0.28, { from: 900, to: 6400, q: 1.6, gain: 0.12, attack: 0.1 }); setTimeout(() => tone(2400, 0.02, { type: 'square', gain: 0.02 }), 270); },
    stick: () => { thump(220, 0.14); pluck(783.99, 0.04, 0.1); },
    stamp: () => { thump(80, 0.4); noise(0.09, { from: 700, to: 200, gain: 0.25 }); },
    scratch: () => { const n = Date.now(); if (n - lastScratch < 110) return; lastScratch = n; noise(0.05 + Math.random() * 0.04, { from: 6200 + Math.random() * 1500, to: 4200, q: 3, gain: 0.045 }); },
    chime: () => { [523.25, 659.25, 783.99, 987.77, 1046.5].forEach((f, i) => pluck(f, i * 0.11, 0.12)); },
    // the lights coming on: a switch click, then a warm hum swelling under a soft chord
    lights: () => { tone(2600, 0.02, { type: 'square', gain: 0.05, attack: 0.001 }); thump(160, 0.2); [130.81, 196, 261.63, 329.63].forEach((f, i) => tone(f, 2.4, { type: 'sine', gain: 0.05, delay: 0.25 + i * 0.05, attack: 0.9 })); setTimeout(() => cues.chime(), 900); },
  };
  root.StudioSound = {
    set(enabled, vol) { on = !!enabled; if (vol != null) volume = vol; if (on) ac(); },
    play(name) { if (!on) return; try { cues[name] && cues[name](); } catch (e) { /* silent */ } },
    test() { const was = on; on = true; try { cues.file(); } catch (e) { /* silent */ } on = was; },
  };
})(window);
