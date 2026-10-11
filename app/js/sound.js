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
  function tone(freq, dur, { type = 'triangle', gain = 0.16, delay = 0 } = {}) {
    const c = ac(); if (!c) return; const t = c.currentTime + delay;
    const o = c.createOscillator(); const g = c.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(gain * volume, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  let lastScratch = 0;
  const cues = {
    open: () => noise(0.42, { from: 1800, to: 600, gain: 0.22, attack: 0.04 }),
    turn: () => noise(0.32, { from: 3200, to: 1200, gain: 0.18, attack: 0.02 }),
    flip: () => { noise(0.55, { from: 4200, to: 900, gain: 0.2, attack: 0.03 }); setTimeout(() => noise(0.12, { from: 900, to: 300, gain: 0.16 }), 430); },
    file: () => { noise(0.5, { from: 2200, to: 500, gain: 0.2, attack: 0.05 }); setTimeout(tap, 420); },
    tick: () => tap(),
    pop: () => tone(880, 0.09, { type: 'sine', gain: 0.12 }),
    peel: () => noise(0.22, { from: 1200, to: 5200, gain: 0.14, attack: 0.08 }),
    stick: () => { tap(); tone(520, 0.12, { type: 'sine', gain: 0.08 }); },
    stamp: () => { noise(0.08, { from: 600, to: 200, gain: 0.3 }); tap(); },
    scratch: () => { const n = Date.now(); if (n - lastScratch < 140) return; lastScratch = n; noise(0.06, { from: 5200, to: 3600, q: 2, gain: 0.05 }); },
    lights: () => { tone(2600, 0.02, { type: 'square', gain: 0.05 }); tap(); [261.63, 329.63, 392, 523.25].forEach((f, i) => tone(f, 2.2, { type: 'sine', gain: 0.06, delay: 0.3 + i * 0.12 })); },
    chime: () => { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, 0.7, { gain: 0.12, delay: i * 0.09 })); },
  };
  root.StudioSound = {
    set(enabled, vol) { on = !!enabled; if (vol != null) volume = vol; if (on) ac(); },
    play(name) { if (!on) return; try { cues[name] && cues[name](); } catch (e) { /* silent */ } },
    test() { const was = on; on = true; try { cues.file(); } catch (e) { /* silent */ } on = was; },
  };
})(window);
