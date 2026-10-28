/* Calculator logic: pure functions shared by the app and the tests.
   Labels, validation, the calculator expression, the artwork preview geometry and the receipt rows.
   Pricing itself is NOT here: it lives behind ATHPricing.estimate() in pricing.js. */
(function (root) {
  'use strict';

  const MISS = '–'; // shown on the display while a value is missing

  const LABELS = {
    mode: { standard: 'Standard', size: 'Size-Based', time: 'Time-Based' },
    experience: { hobby: 'Hobby Artist (0-2 years)', amateur: 'Amateur Artist (2-5 years)', emerging: 'New Emerging Artist (5-10 years)' },
    unit: { in: 'Inches', cm: 'Centimeters' },
    medium: { painting: 'Painting', photography: 'Photography', drawing: 'Drawing' },
    gallery: { no: 'No' }, online: { low: 'Low' }, reputation: { emerging: 'Emerging' }, demand: { low: 'Low' },
  };
  const EXP_ORDER = ['hobby', 'amateur', 'emerging'];
  const FIELD_NAMES = { length: 'Length', width: 'Width', height: 'Height', medium: 'Medium', experience: 'Experience', materials: 'Cost of Materials', rate: 'Price per Hour', hours: 'Hours Spent' };
  const MODE_NOTES = {
    standard: 'Size, medium and where you stand as an artist.',
    size: 'Size, your experience and what your materials cost.',
    time: 'Your hourly rate, the hours you spent and your materials.',
  };

  function defaults(unit, mode) {
    return { mode: mode || 'standard', experience: '', unit: unit || 'in', length: '', width: '', height: '', medium: '', gallery: 'no', online: 'low', reputation: 'emerging', demand: 'low', materials: '', rate: '', hours: '' };
  }

  function num(s) {
    const t = String(s == null ? '' : s).trim().replace(',', '.');
    if (!t) return null;
    const n = Number(t);
    return isFinite(n) ? n : NaN;
  }
  const fmtN = (n) => String(Math.round(n * 100) / 100);
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const cash = (n) => '$' + fmtN(n);
  const dateLabel = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const expShort = (v) => { const s = LABELS.experience[v]; return s ? s.replace(/ \(.*\)/, '') : ''; };
  const expYears = (v) => (LABELS.experience[v].match(/\((.*)\)/) || ['', ''])[1];

  // The keypad's target fields, in order, for a screen and mode.
  function kpFields(screen, mode) {
    if (screen === 'workspace') return ['length', 'width'];
    if (mode === 'time') return ['rate', 'hours', 'materials'];
    if (mode === 'size') return ['length', 'width', 'height', 'materials'];
    return ['length', 'width', 'height'];
  }

  // One keypad press applied to a field's text. Returns null when the press changes nothing allowed.
  function kpApply(cur, ch) {
    cur = String(cur == null ? '' : cur);
    let next = cur;
    if (ch === 'del') next = cur.slice(0, -1);
    else if (ch === 'clr') next = '';
    else if (ch === '.') { if (cur.indexOf('.') < 0) next = (cur || '0') + '.'; }
    else next = (cur === '0' ? '' : cur) + ch;
    return next.length > 8 ? null : next;
  }

  function errs(f) {
    const out = {};
    const need = (k, label, allowZero) => {
      const v = num(f[k]);
      if (v === null) out[k] = 'Enter the ' + label + '.';
      else if (!(allowZero ? v >= 0 : v > 0)) out[k] = allowZero ? 'Use a number of 0 or more.' : 'Use a number above 0, like 12 or 12.5.';
    };
    if (f.mode === 'time') {
      need('rate', 'price per hour'); need('hours', 'hours spent'); need('materials', 'cost of materials', true);
      return out;
    }
    need('length', 'length'); need('width', 'width');
    const Hv = num(f.height);
    if (Hv !== null && !(Hv > 0)) out.height = 'Use a number above 0, or leave it empty.';
    if (f.mode === 'standard' && !f.medium) out.medium = 'Pick the artwork medium.';
    if (!f.experience) out.experience = 'Choose your experience level.';
    if (f.mode === 'size') need('materials', 'cost of materials', true);
    return out;
  }

  // The three progress punches under the form.
  function punches(f) {
    const e = errs(f);
    const ok = (k) => !e[k] && num(f[k]) !== null;
    if (f.mode === 'time') return [{ label: 'Rate', on: ok('rate') }, { label: 'Hours', on: ok('hours') }, { label: 'Materials', on: ok('materials') }];
    if (f.mode === 'size') return [{ label: 'Size', on: ok('length') && ok('width') }, { label: 'Experience', on: !!f.experience }, { label: 'Materials', on: ok('materials') }];
    return [{ label: 'Size', on: ok('length') && ok('width') }, { label: 'Medium', on: !!f.medium }, { label: 'Experience', on: !!f.experience }];
  }

  function dims(f) {
    if (f.mode === 'time') return '';
    const Lv = num(f.length), Wv = num(f.width), Hv = num(f.height);
    if (!(Lv > 0) || !(Wv > 0)) return '';
    return fmtN(Lv) + ' × ' + fmtN(Wv) + (Hv > 0 ? ' × ' + fmtN(Hv) : '') + ' ' + f.unit;
  }

  function what(f) {
    if (f.mode === 'time') return fmtN(num(f.hours)) + ' hours at ' + cash(num(f.rate)) + '/hour';
    if (f.mode === 'size') return dims(f);
    return LABELS.medium[f.medium] + ', ' + dims(f);
  }

  function lines(f) {
    if (f.mode === 'time') return { l1: what(f), l2: 'Materials ' + cash(num(f.materials)) };
    if (f.mode === 'size') return { l1: dims(f), l2: LABELS.experience[f.experience] + ' · Materials ' + cash(num(f.materials)) };
    return { l1: what(f), l2: LABELS.experience[f.experience] };
  }

  // The inputs written as an expression on the calculator display.
  function tokens(f) {
    const out = [];
    const add = (v, cls) => out.push({ v: v, cls: cls || '' });
    const val = (k, fmt) => { const n = num(f[k]); return n !== null && n >= 0 && isFinite(n) ? fmt(n) : null; };
    const put = (v, miss) => (v === null ? add(miss, 'miss') : add(v));
    const sep = () => add(' · ', 'op');
    if (f.mode === 'time') {
      put(val('rate', cash), '$' + MISS); add('/hr'); sep();
      put(val('hours', fmtN), MISS); add(' hrs'); sep();
      add('materials '); put(val('materials', cash), '$' + MISS);
      return out;
    }
    put(val('length', fmtN), 'L'); add(' × ', 'op'); put(val('width', fmtN), 'W');
    const H = val('height', fmtN);
    if (H !== null && num(f.height) > 0) { add(' × ', 'op'); add(H); }
    add(' ' + f.unit);
    if (f.mode === 'standard') { sep(); put(f.medium ? LABELS.medium[f.medium] : null, 'medium'); }
    sep(); put(f.experience ? expShort(f.experience) : null, 'experience');
    if (f.mode === 'size') { sep(); add('materials '); put(val('materials', cash), '$' + MISS); }
    return out;
  }

  function timeVals(f) {
    const v = (k, fmt, miss) => { const n = num(f[k]); return n !== null && isFinite(n) && n >= 0 ? fmt(n) : miss; };
    return { rate: v('rate', cash, '$' + MISS), hours: v('hours', fmtN, MISS), mat: v('materials', cash, '$' + MISS) };
  }

  // Live preview on the paper slip, as percentages of the preview box.
  function geo(f) {
    const Lv = num(f.length), Wv = num(f.width), Hv = num(f.height);
    const okW = Wv > 0, okL = Lv > 0;
    const boxW = 125, boxH = 100, maxW = boxW * 0.56, maxH = boxH * 0.58;
    const r = (okW ? Wv : 4) / (okL ? Lv : 5);
    let w = maxW, h = w / r;
    if (h > maxH) { h = maxH; w = h * r; }
    w = Math.max(8, w); h = Math.max(8, h);
    return {
      w: +(w / boxW * 100).toFixed(2), l: +(h / boxH * 100).toFixed(2),
      hasD: Hv > 0, ghost: !(okW && okL), hl: Hv > 0 ? fmtN(Hv) + ' ' + f.unit : '',
      wl: okW ? fmtN(Wv) + ' ' + f.unit : 'W', ll: okL ? fmtN(Lv) + ' ' + f.unit : 'L',
    };
  }

  // Which drawing stands in for the artwork: paint, photo, draw, blank or ghost.
  function artKind(f, ghost) {
    if (ghost) return 'ghost';
    const m = f.mode === 'standard' ? f.medium : '';
    return m === 'painting' ? 'paint' : m === 'photography' ? 'photo' : m === 'drawing' ? 'draw' : 'blank';
  }

  // The framed artwork on the result and saved slips, in pixels.
  function framePx(f, mw, mh) {
    if (f.mode === 'time') return { w: Math.round(mh * 0.8), h: mh, wl: '', ll: '' };
    const Lv = num(f.length), Wv = num(f.width);
    const ratio = Wv / Lv;
    let w = mw, h = w / ratio;
    if (h > mh) { h = mh; w = h * ratio; }
    return { w: Math.max(36, Math.round(w)), h: Math.max(36, Math.round(h)), wl: fmtN(Wv) + ' ' + f.unit, ll: fmtN(Lv) + ' ' + f.unit };
  }

  function rows(f) {
    const Hv = num(f.height);
    const mode = { k: 'Calculation mode', v: LABELS.mode[f.mode] };
    if (f.mode === 'time') return [mode, { k: 'Price per hour', v: cash(num(f.rate)) }, { k: 'Hours spent', v: fmtN(num(f.hours)) }, { k: 'Cost of materials', v: cash(num(f.materials)) }];
    const dimRow = { k: 'Dimensions (L × W' + (Hv > 0 ? ' × H)' : ')'), v: dims(f) };
    if (f.mode === 'size') return [mode, dimRow, { k: 'Measurement unit', v: LABELS.unit[f.unit] }, { k: 'Artist experience', v: LABELS.experience[f.experience] }, { k: 'Cost of materials', v: cash(num(f.materials)) }];
    return [
      mode, dimRow,
      { k: 'Measurement unit', v: LABELS.unit[f.unit] },
      { k: 'Artwork medium', v: LABELS.medium[f.medium] },
      { k: 'Artist experience', v: LABELS.experience[f.experience] },
      { k: 'Artist reputation', v: LABELS.reputation[f.reputation] },
      { k: 'Gallery representation', v: LABELS.gallery[f.gallery] },
      { k: 'Online presence', v: LABELS.online[f.online] },
      { k: 'Market demand', v: LABELS.demand[f.demand] },
    ];
  }

  // Wall view: frames to relative scale, in inches.
  const toIn = (form, k) => (num(form[k]) || 1) * (form.unit === 'cm' ? 1 / 2.54 : 1);
  function maxIn(list) {
    const d = list.filter((x) => x.inputs.mode !== 'time');
    return d.length ? Math.max.apply(null, d.map((x) => Math.max(toIn(x.inputs, 'width'), toIn(x.inputs, 'length')))) : 1;
  }
  function wallSize(form, mx) {
    const isTime = form.mode === 'time';
    const wi = isTime ? 4 : toIn(form, 'width'), li = isTime ? 5 : toIn(form, 'length');
    const m = isTime ? 5 : (mx || Math.max(wi, li));
    const big = Math.max(wi, li);
    const sz = (v, px, lo) => (isTime ? Math.round(v / 5 * px * 0.8) : Math.max(lo, Math.round(v / m * px)));
    return { pw: sz(wi, 200, 44), ph: sz(li, 200, 44), tw: Math.max(12, Math.round(wi / big * 40)), th: Math.max(12, Math.round(li / big * 40)) };
  }

  const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s).trim());

  // Only the inputs that belong to the chosen mode, so saved records stay clean.
  function inputsFor(f) {
    const keep = { standard: ['unit', 'length', 'width', 'height', 'medium', 'experience', 'gallery', 'online', 'reputation', 'demand'], size: ['unit', 'length', 'width', 'height', 'experience', 'materials'], time: ['rate', 'hours', 'materials'] }[f.mode];
    const out = { mode: f.mode };
    keep.forEach((k) => { out[k] = f[k]; });
    return out;
  }

  root.PriceLogic = { MISS, LABELS, EXP_ORDER, FIELD_NAMES, MODE_NOTES, defaults, num, fmtN, money, cash, dateLabel, expShort, expYears, kpFields, kpApply, errs, punches, dims, what, lines, tokens, timeVals, geo, artKind, framePx, rows, maxIn, wallSize, validEmail, inputsFor };
})(typeof window !== 'undefined' ? window : globalThis);
