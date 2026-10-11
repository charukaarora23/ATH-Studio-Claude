// Serialize each rendered .frame into a flat list of drawing ops for the Figma runtime.
const { chromium } = require(process.env.NP + '/playwright');
const fs = require('fs');

(async () => {
  const [,, file, outFile, grainB64, fibreB64] = process.argv;
  const keys = { grain: fs.readFileSync(grainB64, 'utf8').slice(0, 120), fibre: fs.readFileSync(fibreB64, 'utf8').slice(0, 120) };
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1000 } });
  await p.goto('file://' + file); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const out = await p.evaluate((keys) => {
    const R = (n) => Math.round(n * 100) / 100;
    const parseColor = (s) => {
      const m = s && s.match(/rgba?\(([^)]+)\)/); if (!m) return null;
      const v = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      const R4 = (n) => Math.round(n * 10000) / 10000; return { r: R4(v[0] / 255), g: R4(v[1] / 255), b: R4(v[2] / 255), a: v.length > 3 ? v[3] : 1 };
    };
    const splitTop = (s) => { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; };
    const angleOf = (el) => { // cumulative rotation in degrees (clockwise)
      let a = 0; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { const t = getComputedStyle(n).transform; if (t && t !== 'none') { const m = t.match(/matrix\(([^)]+)\)/); if (m) { const v = m[1].split(',').map(Number); a += Math.atan2(v[1], v[0]) * 180 / Math.PI; } } }
      return R(a);
    };
    const geom = (el, frameRect) => {
      const r = el.getBoundingClientRect();
      const a = angleOf(el);
      const w = a ? el.offsetWidth : r.width, h = a ? el.offsetHeight : r.height;
      return { cx: R(r.left + r.width / 2 - frameRect.left), cy: R(r.top + r.height / 2 - frameRect.top), w: R(w), h: R(h), a };
    };
    const shadows = (s) => {
      if (!s || s === 'none') return [];
      return splitTop(s).map((x) => {
        const inset = /inset/.test(x); const col = parseColor(x); const nums = x.replace(/rgba?\([^)]+\)/, '').replace('inset', '').trim().split(/\s+/).map(parseFloat);
        return { inset, c: col, x: nums[0] || 0, y: nums[1] || 0, blur: nums[2] || 0, spread: nums[3] || 0 };
      });
    };
    const gradient = (s) => {
      const m = s.match(/linear-gradient\((.*)\)$/); if (!m) return null;
      const parts = splitTop(m[1]); let angle = 180; if (/deg/.test(parts[0])) angle = parseFloat(parts.shift());
      const stops = parts.map((t, i) => { const c = parseColor(t); const pm = t.replace(/rgba?\([^)]+\)/, '').match(/([\d.]+)%/); return { c, pos: pm ? parseFloat(pm[1]) / 100 : null }; });
      stops.forEach((st, i) => { if (st.pos == null) st.pos = stops.length === 1 ? 0 : i / (stops.length - 1); });
      return { angle, stops };
    };
    const visual = (el, cs) => {
      const v = {};
      const bg = parseColor(cs.backgroundColor); if (bg && bg.a > 0) v.bg = bg;
      const bi = cs.backgroundImage;
      if (bi && bi !== 'none') {
        v.images = []; for (const part of splitTop(bi)) {
          if (part.startsWith('url(')) { const d = part.slice(5 + 22, 5 + 22 + 120); v.images.push(d === keys.grain.slice(0, d.length) ? 'grain' : d === keys.fibre.slice(0, d.length) ? 'fibre' : 'unknown'); }
          else if (part.startsWith('linear-gradient')) v.grad = gradient(part);
        }
      }
      const rad = ['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map((k) => cs['border' + k + 'Radius']);
      if (rad.some((x) => x.includes('%') && parseFloat(x) >= 50)) v.ellipse = true;
      else { const rr = rad.map((x) => Math.min(parseFloat(x) || 0, 9999)); if (rr.some(Boolean)) v.radius = rr; }
      const sh = shadows(cs.boxShadow); if (sh.length) v.shadows = sh;
      if (parseFloat(cs.opacity) < 1) v.opacity = parseFloat(cs.opacity);
      if (cs.mixBlendMode && cs.mixBlendMode !== 'normal') v.blend = cs.mixBlendMode;
      return v;
    };
    const hasVisual = (v) => v.bg || v.images || v.grad || v.shadows;
    const fontOf = (cs) => {
      const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
      return { fam, w: parseInt(cs.fontWeight, 10), it: cs.fontStyle === 'italic', size: parseFloat(cs.fontSize), lh: cs.lineHeight === 'normal' ? null : parseFloat(cs.lineHeight), ls: cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing), c: parseColor(cs.color), u: cs.textDecorationLine.includes('underline'), up: cs.textTransform === 'uppercase' };
    };
    const isFlex = (cs) => /flex|grid/.test(cs.display);
    const directText = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.data.trim());

    const all = [];
    for (const frame of document.querySelectorAll('section.frame')) {
      const fr = frame.getBoundingClientRect();
      const ops = []; let gid = 0;
      const pushRect = (el, cs, parent, name) => { const v = visual(el, cs); if (hasVisual(v)) ops.push({ t: 'rect', p: parent, n: name, g: geom(el, fr), v }); return v; };
      const borders = (el, cs, parent) => {
        const r = el.getBoundingClientRect();
        for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
          const w = parseFloat(cs['border' + side + 'Width']); const st = cs['border' + side + 'Style'];
          if (!w || st === 'none') continue; const c = parseColor(cs['border' + side + 'Color']); if (!c || c.a === 0) continue;
          const x = r.left - fr.left, y = r.top - fr.top;
          const seg = { Top: [x, y + w / 2, x + r.width, y + w / 2], Bottom: [x, y + r.height - w / 2, x + r.width, y + r.height - w / 2], Left: [x + w / 2, y, x + w / 2, y + r.height], Right: [x + r.width - w / 2, y, x + r.width - w / 2, y + r.height] }[side];
          ops.push({ t: 'line', p: parent, pts: seg.map(R), w, c, dash: st === 'dotted' ? [w, w * 2] : st === 'dashed' ? [w * 3, w * 2] : null });
        }
      };
      const textRuns = (el) => {
        const runs = [];
        const walk = (n) => {
          for (const c of n.childNodes) {
            if (c.nodeType === 3) { let s = c.data.replace(/\s+/g, ' '); const f = fontOf(getComputedStyle(c.parentElement)); if (f.up) s = s.toUpperCase(); runs.push({ s, f }); }
            else if (c.nodeType === 1) { if (c.tagName === 'BR') runs.push({ s: '\n', f: fontOf(getComputedStyle(n)) }); else if (getComputedStyle(c).display !== 'inline-block') walk(c); }
          }
        };
        walk(el);
        // trim + collapse
        let text = ''; const out = [];
        for (const r of runs) { let s = r.s; if (text.endsWith(' ') || text.endsWith('\n') || text === '') s = s.replace(/^ /, ''); if (r.s === '\n') text = text.replace(/ $/, ''); if (!s) continue; out.push({ start: text.length, s, f: r.f }); text += s; }
        while (text.endsWith(' ')) { text = text.slice(0, -1); const last = out[out.length - 1]; last.s = last.s.replace(/ $/, ''); }
        return { text, runs: out.filter((r) => r.s.length) };
      };
      const lineCount = (el) => { const rg = document.createRange(); rg.selectNodeContents(el); const tops = new Set([...rg.getClientRects()].filter((q) => q.width > 0.5).map((q) => Math.round(q.top))); return tops.size; };
      const visit = (el, parent) => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        if (el.tagName.toLowerCase() === 'svg') {
          const r = el.getBoundingClientRect();
          const clone = el.cloneNode(true); clone.removeAttribute('style');
          ops.push({ t: 'svg', p: parent, x: R(r.left - fr.left), y: R(r.top - fr.top), svg: clone.outerHTML.replace(/\s+/g, ' ') });
          return;
        }
        if (el.dataset.grainPrev) { ops.push({ t: 'grainPrev', o: parseFloat(el.dataset.grainPrev) }); return; }
        let me = parent;
        if (el.dataset.group) {
          const key = 'g' + (gid++); const v = visual(el, cs);
          ops.push({ t: 'group', k: key, p: parent, n: el.dataset.group, g: geom(el, fr), v });
          me = key;
        } else if (el !== frame) pushRect(el, cs, parent);
        borders(el, cs, me);
        if (directText(el) && !isFlex(cs)) {
          // highlight backgrounds of inline spans first
          for (const s of el.querySelectorAll('span')) { const scs = getComputedStyle(s); const c = parseColor(scs.backgroundColor); if (c && c.a > 0 && scs.display === 'inline') for (const q of s.getClientRects()) ops.push({ t: 'rect', p: me, g: { cx: R(q.left + q.width / 2 - fr.left), cy: R(q.top + q.height / 2 - fr.top), w: R(q.width + 4), h: R(q.height + 2), a: 0 }, v: { bg: c } }); }
          const { text, runs } = textRuns(el);
          const r = el.getBoundingClientRect(); const a = angleOf(el);
          const pl = parseFloat(cs.paddingLeft) + parseFloat(cs.borderLeftWidth), pr = parseFloat(cs.paddingRight) + parseFloat(cs.borderRightWidth), pt = parseFloat(cs.paddingTop) + parseFloat(cs.borderTopWidth), pb = parseFloat(cs.paddingBottom) + parseFloat(cs.borderBottomWidth);
          const g = geom(el, fr);
          const lines = lineCount(el);
          ops.push({ t: 'text', p: me, g: { ...g, w: R(g.w - pl - pr), h: R(g.h - pt - pb), cx: R(g.cx + (pl - pr) / 2), cy: R(g.cy + (pt - pb) / 2) }, text, runs, align: cs.textAlign, single: lines <= 1 && !text.includes('\n'), f: fontOf(cs) });
          for (const c of el.querySelectorAll('*')) { if (getComputedStyle(c).display === 'inline-block') visit(c, me); }
          return;
        }
        for (const c of el.childNodes) {
          if (c.nodeType === 3 && c.data.trim()) {
            const rg = document.createRange(); rg.selectNodeContents(c); const q = rg.getBoundingClientRect(); const f = fontOf(cs);
            let s = c.data.replace(/\s+/g, ' ').trim(); if (f.up) s = s.toUpperCase();
            ops.push({ t: 'text', p: me, g: { cx: R(q.left + q.width / 2 - fr.left), cy: R(q.top + q.height / 2 - fr.top), w: R(q.width), h: R(q.height), a: 0 }, text: s, runs: [{ start: 0, s, f }], align: 'left', single: true, f });
          } else if (c.nodeType === 1) visit(c, me);
        }
      };
      const fcs = getComputedStyle(frame);
      const fv = visual(frame, fcs);
      for (const c of frame.children) visit(c, null);
      all.push({ name: frame.dataset.name, w: frame.offsetWidth, h: frame.offsetHeight, v: fv, ops });
    }
    return all;
  }, keys);
  fs.writeFileSync(outFile, JSON.stringify(out));
  for (const f of out) console.log(f.name, f.ops.length, 'ops', JSON.stringify(f).length, 'bytes');
  await b.close();
})();
