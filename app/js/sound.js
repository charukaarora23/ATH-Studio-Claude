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
  const cues = {
    open: () => noise(0.42, { from: 1800, to: 600, gain: 0.22, attack: 0.04 }),
    turn: () => noise(0.32, { from: 3200, to: 1200, gain: 0.18, attack: 0.02 }),
    file: () => { noise(0.5, { from: 2200, to: 500, gain: 0.2, attack: 0.05 }); setTimeout(tap, 420); },
    tick: () => tap(),
  };
  root.StudioSound = {
    set(enabled, vol) { on = !!enabled; if (vol != null) volume = vol; if (on) ac(); },
    play(name) { if (!on) return; try { cues[name] && cues[name](); } catch (e) { /* silent */ } },
    test() { const was = on; on = true; try { cues.file(); } catch (e) { /* silent */ } on = was; },
  };
})(window);
