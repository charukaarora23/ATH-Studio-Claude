/* Views and interactions for the Artwork Price Calculator.
   State lives in one object; render() rebuilds the markup and morph() patches the page so focus,
   caret position and running animations survive each update. */
(function () {
  'use strict';
  const P = window.PriceLogic, Pricing = window.ATHPricing, Store = window.ATHStore, Mail = window.ATHMail;
  const L = P.LABELS;

  // ---------- options from the address bar (QA only) ----------
  const params = new URLSearchParams(location.search);
  window.ATH_SIMULATE = params.get('simulate') || ''; // calc-fail | email-fail

  // ---------- state ----------
  const state = {
    screen: 'tools', form: P.defaults('in', 'standard'), touched: {}, submitted: false, calcStatus: 'idle',
    result: null, records: [], detailId: null, reuseFrom: null, view: 'wall',
    email: { open: false, to: '', status: 'idle', source: null, id: null },
    dialog: null, toast: null, activeField: null,
  };
  const ui = { shown: 0, raf: 0, toastT: 0, opener: null, lastModal: '', lastScreen: '', saving: false };

  function set(patch) { Object.assign(state, typeof patch === 'function' ? patch(state) : patch); render(); }
  const reduceMotion = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
  const formOf = (rec) => Object.assign(P.defaults(rec.inputs.unit || 'in', rec.mode), rec.inputs);
  const announce = (t) => { const el = document.getElementById('announce'); el.textContent = ''; setTimeout(() => { el.textContent = t; }, 30); };

  // ---------- routing ----------
  const ROUTES = { tools: '#/', workspace: '#/calculator', form: '#/calculator/price', result: '#/calculator/result', library: '#/calculator/saved' };
  function hashFor(screen, id) { return screen === 'detail' ? '#/calculator/saved/' + encodeURIComponent(id) : ROUTES[screen]; }
  function go(screen, id) {
    const h = hashFor(screen, id);
    if (location.hash === h) applyRoute(); else location.hash = h;
  }
  function applyRoute() {
    const h = location.hash || '';
    let screen = 'tools', detailId = null;
    const m = h.match(/^#\/calculator\/saved\/(.+)$/);
    if (m) { screen = 'detail'; detailId = decodeURIComponent(m[1]); }
    else Object.keys(ROUTES).forEach((k) => { if (ROUTES[k] === h) screen = k; });
    if (!h && params.get('start') === 'workspace') screen = 'workspace';
    if (screen === 'result' && !state.result) { location.replace(ROUTES.form); return; }
    if (screen === 'detail' && !state.records.some((r) => r.id === detailId)) { location.replace(ROUTES.library); return; }
    set({ screen, detailId, toast: screen === state.screen ? state.toast : state.toast });
  }

  // ---------- small markup helpers ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const on = (b) => (b ? 'on' : '');
  const tf = (b) => (b ? 'true' : 'false');

  const ICON = {
    back: '<svg width="18" height="12" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M23 8H2M8 1 1 8l7 7"></path></svg>',
    left: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M11 18l-6-6 6-6"></path></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    arrowB: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"></path></svg>',
    calc: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2.5" width="14" height="19" rx="2"></rect><rect x="8" y="5.5" width="8" height="4" rx=".5"></rect><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"></path></svg>',
    trash: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"></path></svg>`,
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>',
    check: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="m5 12 5 5 9-10"></path></svg>',
  };

  // The drawing that stands in for the artwork. 'tile' and 'wall' are the lighter versions the prototype uses there.
  function artSvg(kind, variant) {
    const ns = 'class="hills" viewBox="0 0 100 100" preserveAspectRatio="none"';
    if (kind === 'paint') return `<span class="sun"></span><svg ${ns}><polygon points="0,100 0,72 28,46 50,66 72,44 100,70 100,100" fill="#850020"></polygon></svg>`;
    if (kind === 'photo') {
      const back = '<polygon points="0,100 0,70 30,50 52,68 74,48 100,66 100,100" fill="#3B302C"></polygon>';
      return `<svg ${ns}>${back}${variant === 'tile' ? '' : '<polygon points="0,100 0,86 40,74 70,84 100,78 100,100" fill="#6E625C"></polygon>'}</svg>`;
    }
    if (kind === 'draw') {
      const sw = variant === 'tile' ? '1.5' : '1.3';
      const line = `<polyline points="0,72 28,46 50,66 72,44 100,70" fill="none" stroke="#1C1310" stroke-width="${sw}" vector-effect="non-scaling-stroke"></polyline>`;
      const hatch = variant === 'full' ? '<path d="M30,60 L36,54 M40,64 L47,57 M58,60 L64,54 M68,58 L75,51 M80,66 L86,60" stroke="#1C1310" stroke-width="1" vector-effect="non-scaling-stroke"></path>' : '';
      return `<svg ${ns}>${line}${hatch}</svg>`;
    }
    return '';
  }

  const TILE_KINDS = ['paint', 'photo', 'draw', 'photo', 'draw', 'paint', 'paint', 'draw', 'photo', 'draw', 'paint', 'photo', 'photo', 'paint', 'draw', 'paint', 'draw', 'photo', 'paint', 'draw'];
  const TILES = '<div class="tiles" aria-hidden="true">' + TILE_KINDS.map((k, i) => `<span class="tile ${i % 3 === 1 ? 'sq' : ''} surf ${k}">${artSvg(k, 'tile')}</span>`).join('') + '</div><span class="tint" aria-hidden="true"></span><span class="shade" aria-hidden="true"></span>';

  const tokensHtml = (list) => list.map((t) => `<span class="${t.cls}">${esc(t.v)}</span>`).join('');

  // The physical calculator. interactive: keypad types into the active field; otherwise every key is inert.
  function calcHtml(o) {
    const k = (label, kp, cls) => (o.interactive && kp
      ? `<button class="c-k ${cls || ''}" type="button" tabindex="-1" aria-hidden="true" data-kp="${kp}">${label}</button>`
      : `<span class="c-k ${cls || ''} inert" aria-hidden="true">${label}</span>`);
    const deco = (label, cls) => `<span class="c-k ${cls} inert" aria-hidden="true">${label}</span>`;
    const eq = o.interactive ? `<button class="c-k eq" type="button" data-action="kpEq" aria-label="${o.eqLabel}">=</button>` : '<span class="c-k eq inert" aria-hidden="true">=</span>';
    return `<div class="calc" role="group" aria-label="${o.aria}">
<div class="c-top"><span class="c-brand">arts <em>to</em> hearts</span><span class="c-solar" aria-hidden="true"></span></div>
<div class="c-disp">
<div class="c-bar"><span class="c-mode">${esc(o.mode)}</span><span class="c-lbl">${o.label}</span></div>
<p class="c-expr" aria-hidden="true">${tokensHtml(o.tokens)}</p>
<p class="c-res ${o.wait ? 'wait' : ''}" aria-hidden="true"><span class="c-eq">=</span><span ${o.shown ? 'data-shown' : ''}>${esc(o.price)}</span></p>
</div>
<div class="c-keys" ${o.interactive ? '' : 'aria-hidden="true"'}>
${k('C', 'clr', 'fn')}${deco('+/-', 'fn')}${deco('%', 'fn')}${deco('÷', 'op')}
${k('7', '7')}${k('8', '8')}${k('9', '9')}${deco('×', 'op')}
${k('4', '4')}${k('5', '5')}${k('6', '6')}${deco('−', 'op')}
${k('1', '1')}${k('2', '2')}${k('3', '3')}${deco('+', 'op')}
${k('0', '0')}${k('.', '.')}${k('del', 'del', 'sm')}${eq}
</div>
</div>`;
  }

  // Live preview on the paper slip (overview and form).
  function previewHtml(f, hint) {
    const g = P.geo(f), kind = P.artKind(f, g.ghost);
    return `<div class="pprev">
<div class="cv" style="width: ${g.w}%; height: ${g.l}%">
<div class="surf ${kind}">${artSvg(kind, 'full')}${g.ghost ? `<span class="surf-hint">${hint}</span>` : ''}</div>
<div class="dimx" style="top: calc(100% + 12px)"><span class="dl dl-a"></span><span class="dv">${esc(g.wl)}</span><span class="dl dl-b"></span></div>
<div class="dimy" style="left: calc(100% + 12px)"><span class="dl dl-a"></span><span class="dv">${esc(g.ll)}</span><span class="dl dl-b"></span></div>
</div>
${g.hasD ? `<span class="depth-chip">3D · ${esc(g.hl)} high</span>` : ''}
</div>`;
  }

  function timeRows(tv) {
    return `<div class="prow"><span>Price per hour</span><span>${esc(tv.rate)}</span></div><div class="prow"><span>Hours spent</span><span>${esc(tv.hours)}</span></div><div class="prow"><span>Materials</span><span>${esc(tv.mat)}</span></div>`;
  }

  // Framed artwork on the result and saved slips.
  function framedHtml(f) {
    if (f.mode === 'time') return timeRows(P.timeVals(f));
    const rf = P.framePx(f, 150, 150), kind = P.artKind(f);
    return `<div class="pframe-wrap"><div class="pframe">
<div class="pframe-in surf ${kind}" style="width: ${rf.w}px; height: ${rf.h}px">${artSvg(kind, 'full')}</div>
<div class="dimx" style="top: calc(100% + 14px)"><span class="dl dl-a"></span><span class="dv">${esc(rf.wl)}</span><span class="dl dl-b"></span></div>
<div class="dimy" style="left: calc(100% + 14px)"><span class="dl dl-a"></span><span class="dv">${esc(rf.ll)}</span><span class="dl dl-b"></span></div>
</div></div>`;
  }

  const receiptHtml = (rows) => '<dl class="receipt">' + rows.map((r) => `<div class="rc-row"><dt>${esc(r.k)}</dt><span class="lead" aria-hidden="true"></span><dd>${esc(r.v)}</dd></div>`).join('') + '</dl>';

  function recView(rec, mx) {
    const f = formOf(rec), date = P.dateLabel(rec.createdAt), title = rec.title || 'Untitled', price = P.money(rec.price), w = P.what(f);
    return Object.assign({ id: rec.id, f, title, priceLabel: price, what: w, modeLabel: L.mode[rec.mode], date, kind: P.artKind(f), aria: title + ', ' + price + ', ' + w + ', ' + date }, P.lines(f), P.wallSize(f, mx));
  }

  const unsavedSummary = () => (state.result ? P.money(state.result.price) + ' for ' + P.what(state.result.form) : '');
  const recCountLine = () => (state.records.length === 0 ? 'Nothing saved yet' : state.records.length + (state.records.length === 1 ? ' saved piece' : ' saved pieces'));
  const hasUnsaved = () => !!(state.result && !state.result.savedId);

  // Keypad target: the last-focused numeric field on this screen, or the first one.
  function kpTarget() {
    const list = P.kpFields(state.screen, state.form.mode);
    return list.indexOf(state.activeField) >= 0 ? state.activeField : list[0];
  }

  // ---------- screens ----------
  function toolsScreen() {
    return `<main class="wrap screen" id="main" tabindex="-1" data-key="tools">
<nav class="crumbs" aria-label="Breadcrumb"><span>Home</span><span aria-hidden="true">/</span><span class="crumb-cur" aria-current="page">Artist Tools</span></nav>
<h1 class="at-title">Artist Tools</h1>
<p class="at-sub">Practical, free tools for working artists: the words, the paperwork and the presentation behind every application.</p>
<section class="at-box" aria-labelledby="at-all">
<div class="at-head">
<div style="display:flex;gap:16px;align-items:center">
<span class="at-ico" aria-hidden="true"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a4 4 0 0 0 5.2 5.2L13 18.4a2.1 2.1 0 1 1-3-3l6.9-6.9a4 4 0 0 0-5.2-5.2l2.6 2.6-.6 2.4-2.4.6z"></path><path d="M10 15 4 21"></path></svg></span>
<div><p class="at-mono" style="color:#850020">Explore</p><h2 class="at-h2" id="at-all">All tools</h2></div>
</div>
<p class="at-mono at-count"><span class="at-dot" aria-hidden="true"></span>2 tools in your tool kit</p>
</div>
<div class="at-grid">
<article class="at-card at-pink">
<div class="at-ct">
<span class="at-circle" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9l-4-4L4 16z"></path><path d="m13.5 6.5 4 4"></path></svg></span>
<div style="flex:1;min-width:0"><p class="at-mono">Tool 01</p><h3 class="at-h3">Artist Studio</h3></div>
<span class="at-perk">Artist perk</span>
</div>
<p class="at-desc">Write your artist bio and statement once, then tailor them to any gallery, grant, open call or website in seconds.</p>
<div class="at-demo" aria-hidden="true">
<div class="at-notes"><p class="at-mono">Your notes</p><p class="at-mono at-k">Medium</p><p class="at-it">Acrylics on canvas</p><p class="at-mono at-k">Based in</p><p class="at-it">Mumbai</p></div>
<svg class="at-arrow" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#850020" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"></path></svg>
<div class="at-out"><div class="at-tabs"><span class="on">Bio</span><span>Statement</span></div><p><b>Maya Rao</b> is a Mumbai-based painter working with acrylic medi....</p></div>
</div>
<button class="btn btn-p at-btn" type="button" data-action="openStudio">Open the studio ${ICON.arrow}</button>
</article>
<article class="at-card at-peach">
<div class="at-ct">
<span class="at-circle" aria-hidden="true"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"></path><circle cx="7.5" cy="7.5" r="1.3"></circle></svg></span>
<div style="flex:1;min-width:0"><p class="at-mono">Tool 02</p><h3 class="at-h3">Artwork Price Calculator</h3></div>
<span class="at-perk">Artist perk</span>
</div>
<p class="at-desc">Get a structured starting price for your artwork from its size, medium and where you are as an artist.</p>
<div class="at-demo" aria-hidden="true">
<div class="at-fw">
<div class="at-frame"><div class="at-pic"><span class="at-sun"></span><svg class="hills" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="0,100 0,78 22,52 44,74 64,50 100,86 100,100" fill="#7A1A35"></polygon><polygon points="0,100 6,86 18,92 26,100" fill="#E89AB5"></polygon></svg></div></div>
<div class="at-dv"></div><span class="at-dl" style="right:-2px;top:44px">H</span>
<div class="at-dh"></div><span class="at-dl" style="left:62px;bottom:-4px">W</span>
</div>
<svg class="at-arrow" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#850020" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16M14 6l6 6-6 6"></path></svg>
<div class="at-calc">
<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap"><span class="at-chip">W</span><span class="at-op">×</span><span class="at-chip">H</span><span class="at-op">=</span><span class="at-chip">Rate</span></div>
<div class="at-rule"></div><p class="at-mono" style="font-size:10px">Price</p>
<div class="at-cur"><span class="at-tagdot"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"></path></svg></span>₹ / $</div>
</div>
</div>
<button class="btn btn-s at-btn" type="button" data-action="go" data-arg="workspace">Open the calculator ${ICON.arrow}</button>
</article>
</div>
</section>
</main>`;
  }

  function toolNav() {
    const s = state.screen;
    const tab = (onNow, target, n, label, extra) => `<button class="tab ${on(onNow)}" type="button" role="tab" aria-selected="${tf(onNow)}" data-action="go" data-arg="${target}"><span class="tab-n" aria-hidden="true">${n}</span>${label}${extra || ''}</button>`;
    return `<div class="wrap" data-key="toolnav">
<nav class="crumbs" aria-label="Breadcrumb"><span>Home</span><span aria-hidden="true">/</span><button class="crumb-btn" type="button" data-action="go" data-arg="tools">Artist Tools</button><span aria-hidden="true">/</span><span class="crumb-cur" aria-current="page">Artwork Price Calculator</span></nav>
<div class="tabs-wrap">
<div class="tabs" role="tablist" aria-label="Calculator sections">
${tab(s === 'workspace', 'workspace', '01', 'Overview')}${tab(s === 'form' || s === 'result', 'form', '02', 'Calculate a Price')}${tab(s === 'library' || s === 'detail', 'library', '03', 'My Calculations', ` <span class="count">${state.records.length}</span>`)}
</div>
</div>
</div>`;
  }

  function resumeHtml(prefix, style) {
    if (!hasUnsaved()) return '';
    return `<div class="resume" ${style || ''}><span class="small"><b>${prefix}</b> ${esc(unsavedSummary())}</span><button class="btn btn-s" type="button" data-action="go" data-arg="result" style="min-height:40px">Back to result</button></div>`;
  }

  function slipHtml(it, withDate) {
    return `<button class="slip" type="button" data-action="openDetail" data-arg="${esc(it.id)}" aria-label="Open calculation: ${esc(it.aria)}">
<span class="slip-thumb" aria-hidden="true"><span class="surf ${it.kind}" style="position:relative;display:block;border:2px solid #1C1310;width: ${it.tw}px; height: ${it.th}px"></span></span>
<span style="min-width:0"><span class="slip-t">${esc(it.title)}</span><span class="slip-expr" style="display:block">${esc(it.what)}${withDate ? ' · ' + esc(it.modeLabel) : ''}</span></span>
${withDate ? `<span class="ldate">${esc(it.date)}</span>` : ''}
<span class="slip-v"><i>=</i>${esc(it.priceLabel)}</span>
</button>`;
  }

  function workspaceScreen() {
    const f = state.form;
    const mini = state.records.slice(0, 4), mx = P.maxIn(mini);
    const box = (id, k) => `<div class="box"><input id="${id}" class="box-in" data-field="${k}" type="text" inputmode="decimal" autocomplete="off" placeholder="0" value="${esc(f[k])}"><span class="box-u">${f.unit}</span></div>`;
    return `<main class="screen" id="main" tabindex="-1" data-key="workspace">
<div class="wrap">
<div class="ov-head">
<div><p class="eyebrow">Artwork Price Calculator</p><h1 class="poster">Price your <em>artwork.</em></h1></div>
<p class="ws-line">Size it, pick the medium, tell us where you are. Get a starting price.</p>
</div>
</div>
<div class="band">
<div class="wrap">
${resumeHtml('Unsaved result:')}
<div class="ov">
<div class="device">
<section class="stage" aria-label="Calculator">
${TILES}
<div class="stage-top"><button class="back-l" type="button" data-action="go" data-arg="tools">${ICON.back}Artist Tools</button><span class="st-chip">${L.mode[f.mode]}</span></div>
<div class="stage-in">
<div class="paper" aria-hidden="true"><p class="p-mono">Your artwork</p>${previewHtml(f, 'Your artwork')}</div>
${calcHtml({ interactive: true, aria: 'Calculator', mode: L.mode[f.mode], label: 'Estimated price', tokens: P.tokens(f), price: '$ ' + P.MISS, wait: true, eqLabel: 'Continue to the calculator' })}
</div>
<p class="stage-cap"><span>Keypad types into <b>${P.FIELD_NAMES[kpTarget()]}</b></span><span>= opens the calculator</span></p>
</section>
<section class="keys" aria-labelledby="ov-calc-h">
<div class="kp-title">
<span class="kp-ico" aria-hidden="true">${ICON.calc}</span>
<div><h2 class="kp-h" id="ov-calc-h">Calculate a price</h2><p class="kp-sub">Start with the size. You'll pick the rest on the next screen.</p></div>
</div>
<div class="krow"><span class="klabel" id="ov-unit">Unit</span><div class="kctl"><div class="tray" role="radiogroup" aria-labelledby="ov-unit">${radio('unit', 'in', 'Inches')}${radio('unit', 'cm', 'Centimeters')}</div></div></div>
<div class="krow"><label class="klabel" for="q-len">Length</label><div class="kctl">${box('q-len', 'length')}</div></div>
<div class="krow"><label class="klabel" for="q-wid">Width</label><div class="kctl">${box('q-wid', 'width')}</div></div>
<div class="keys-foot" style="position:static;margin:0;box-shadow:none;padding-top:22px">
<button class="cta-bar" type="button" data-action="go" data-arg="form">Next: price details ${ICON.arrowB}</button>
</div>
</section>
</div>
<aside class="tape ov-tape" aria-labelledby="ov-lib-h">
<div class="tape-head">
<div><p class="eyebrow">Your wall</p><h2 class="h3" id="ov-lib-h" style="margin-top:6px">My Calculations</h2></div>
<span class="mono muted" style="padding-top:2px">${recCountLine()}</span>
</div>
${mini.length ? '<div class="slips">' + mini.map((r) => slipHtml(recView(r, mx))).join('') + '</div>' : `<div class="tape-empty">
<p class="tape-empty-t">Your wall is empty for now.</p>
<p class="small muted" style="margin:6px 0 0">Calculate and save an artwork price, and it will appear here.</p>
</div>
<p class="small muted" style="margin:0">Every price you save hangs here, drawn to its real proportions.</p>`}
<button class="btn btn-s" type="button" data-action="go" data-arg="library">Open My Calculations</button>
</aside>
</div>
</div>
</div>
<div class="wrap">
<div class="ws-foot">
<div><span class="mono" style="color:#850020">01</span><h3>Find a starting point</h3><p>Get a realistic price based on factors that actually influence value.</p></div>
<div><span class="mono" style="color:#850020">02</span><h3>Stay consistent across your work</h3><p>Apply a clearer structure so your pricing doesn't feel scattered.</p></div>
<div><span class="mono" style="color:#850020">03</span><h3>Make more confident decisions</h3><p>Understand where your work stands before listing or selling.</p></div>
<div><span class="mono" style="color:#850020">04</span><h3>Adjust as your practice grows</h3><p>Evolve your pricing as your experience and visibility increase.</p></div>
<div><span class="mono" style="color:#850020">05</span><h3>Avoid common pricing mistakes</h3><p>Reduce the risk of pricing too low or unrealistically high.</p></div>
</div>
</div>
</main>`;
  }

  // A radio-style key in a tray. Arrow keys move between options (see onKeydown).
  function radio(field, value, label, extra) {
    const sel = state.form[field] === value;
    return `<button ${extra && extra.id ? `id="${extra.id}"` : ''} class="key ${extra && extra.tall ? 'tall' : ''} ${on(sel)}" type="button" role="radio" aria-checked="${tf(sel)}" tabindex="${sel || (!state.form[field] && extra && extra.first) ? '0' : '-1'}" data-action="pick" data-field="${field}" data-arg="${value}">${label}${extra && extra.sub ? `<span class="key-sub">${extra.sub}</span>` : ''}</button>`;
  }

  function formScreen() {
    const s = state, f = s.form, e = P.errs(f);
    const showE = (k) => !!e[k] && (s.submitted || !!s.touched[k]);
    const isTime = f.mode === 'time', isStd = f.mode === 'standard', isDim = !isTime;
    const pun = P.punches(f), done = pun.filter((p) => p.on).length;
    const errKeys = Object.keys(e);
    const ids = { length: 'f-len', width: 'f-wid', height: 'f-hei', medium: 'md-painting', experience: 'exp-hobby', materials: 'f-mat', rate: 'f-rate', hours: 'f-hrs' };
    const stepper = (k, id, opt) => {
      const bad = showE(k);
      const errId = id + '-err';
      const input = `<input id="${id}" class="box-in" data-field="${k}" data-touch="${k}" type="text" inputmode="decimal" autocomplete="off" placeholder="${opt.ph}" value="${esc(f[k])}" ${opt.aria ? `aria-label="${opt.aria}"` : ''} aria-invalid="${tf(bad)}" ${opt.req ? 'aria-required="true"' : ''} ${bad ? `aria-describedby="${errId}"` : ''}>`;
      return `<div class="box ${bad ? 'bad' : ''}"><button class="bstp" type="button" data-action="bump" data-field="${k}" data-arg="-1" aria-label="Decrease ${opt.name}">−</button>${opt.pre ? `<span class="box-u">${opt.pre}</span>` : ''}${input}${opt.post ? `<span class="box-u">${opt.post}</span>` : ''}<button class="bstp" type="button" data-action="bump" data-field="${k}" data-arg="1" aria-label="Increase ${opt.name}">+</button></div>`;
    };
    const errLine = (k, prefix) => (showE(k) ? `<span class="kerr" id="${ids[k]}-err">${prefix || ''}${esc(e[k])}</span>` : '');
    const tv = P.timeVals(f);
    const progText = done === 3 ? 'Ready to price' : done + ' of 3 ready';
    const loading = s.calcStatus === 'loading';
    const staticRow = (label, v) => `<div class="krow"><span class="klabel">${label}</span><div class="kctl"><div class="tray"><span class="key static">${v}</span><span class="key ghost">More in live tool</span></div></div></div>`;

    return `<main class="screen" id="main" tabindex="-1" data-key="form">
<div class="band" style="padding-bottom:80px">
<div class="wrap">
${s.reuseFrom ? `<div class="banner banner-info" role="status">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;margin-top:1px"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"></path><path d="M3 3v5h5"></path></svg>
<div class="small"><b>Starting from a saved calculation (${esc(s.reuseFrom)})</b>This is a new calculation. The saved one stays exactly as it was.</div>
</div>` : ''}
${s.submitted && errKeys.length ? `<div class="banner banner-err" role="alert">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AA0003" stroke-width="2" stroke-linecap="round" aria-hidden="true" style="flex:none;margin-top:1px"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v5M12 16.5v.01"></path></svg>
<div class="small"><b>${errKeys.length === 1 ? 'One thing left before we can price this' : errKeys.length + ' things left before we can price this'}</b><div class="linklist">${errKeys.map((k) => `<button class="crumb-btn" type="button" data-action="focusField" data-arg="${ids[k]}">${P.FIELD_NAMES[k]}</button>`).join('')}</div></div>
</div>` : ''}
${s.calcStatus === 'error' ? `<div class="banner banner-err" role="alert">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#AA0003" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none;margin-top:1px"><path d="M12 3 2 20h20z"></path><path d="M12 10v4M12 17v.01"></path></svg>
<div class="small" style="flex:1"><b>We couldn't calculate this price</b>Your inputs are still here. Please try again in a moment.</div>
<button class="btn btn-s" type="button" data-action="calculate" style="min-height:40px">Try again</button>
</div>` : ''}
<div class="device">
<section class="stage ${loading ? 'loading' : ''}" aria-label="Calculator">
${TILES}
<div class="stage-top"><button class="back-l" type="button" data-action="go" data-arg="workspace">${ICON.back}Overview</button><span class="st-chip">${progText}</span></div>
<div class="stage-in">
<div class="paper" aria-hidden="true"><p class="p-mono">${isTime ? 'Your time and materials' : 'Your artwork'}</p>${isDim ? previewHtml(f, 'Add a size') : timeRows(tv)}</div>
${calcHtml({ interactive: true, aria: 'Calculator', mode: L.mode[f.mode], label: 'Estimated price', tokens: P.tokens(f), price: loading ? '…' : '$ ' + P.MISS, wait: true, eqLabel: 'Calculate price' })}
</div>
<p class="stage-cap"><span>Keypad types into <b>${P.FIELD_NAMES[kpTarget()]}</b></span><span>= calculates</span></p>
<div class="stage-foot"><div><span class="sf-v">${L.mode[f.mode]}</span><span class="sf-k">Mode</span></div><div><span class="sf-v">${f.unit}</span><span class="sf-k">Unit</span></div><div><span class="sf-v">${done}/3</span><span class="sf-k">Ready</span></div></div>
</section>

<section class="keys" aria-label="Calculator inputs">
<div class="kp-title">
<span class="kp-ico" aria-hidden="true">${ICON.calc}</span>
<div><h1 class="kp-h">Artwork Price Calculator</h1><p class="kp-sub">${P.MODE_NOTES[f.mode]}</p></div>
</div>
<div class="krow"><span class="klabel" id="k-mode">Calculation mode <span class="qdot" title="${P.MODE_NOTES[f.mode]}" aria-hidden="true">?</span></span>
<div class="kctl"><div class="tray" role="radiogroup" aria-labelledby="k-mode">${radio('mode', 'standard', 'Standard')}${radio('mode', 'size', 'Size-Based')}${radio('mode', 'time', 'Time-Based')}</div></div>
</div>
${isDim ? `<div class="krow"><span class="klabel" id="k-unit">Unit <i class="req" aria-hidden="true">*</i></span>
<div class="kctl"><div class="tray" role="radiogroup" aria-labelledby="k-unit" aria-required="true">${radio('unit', 'in', 'Inches')}${radio('unit', 'cm', 'Centimeters')}</div></div>
</div>
<div class="krow"><span class="klabel" id="k-size">Size <i class="req" aria-hidden="true">*</i><span class="opt">Length and width</span></span>
<div class="kctl" role="group" aria-labelledby="k-size">
<div class="boxes">
<div>${stepper('length', 'f-len', { ph: 'L', aria: 'Length', name: 'length', req: true, post: f.unit })}</div>
<div>${stepper('width', 'f-wid', { ph: 'W', aria: 'Width', name: 'width', req: true, post: f.unit })}</div>
</div>
${errLine('length', 'Length: ')}${errLine('width', 'Width: ')}
</div>
</div>
<div class="krow"><label class="klabel" for="f-hei">Height <span class="qdot" title="Optional, for 3D work" aria-hidden="true">?</span><span class="opt">Optional, for 3D</span></label>
<div class="kctl">${stepper('height', 'f-hei', { ph: '–', name: 'height', post: f.unit })}${errLine('height')}</div>
</div>` : ''}
${isStd ? `<div class="krow"><span class="klabel" id="k-med">Artwork Medium <i class="req" aria-hidden="true">*</i></span>
<div class="kctl">
<div class="tray" role="radiogroup" aria-labelledby="k-med" aria-required="true" ${showE('medium') ? 'aria-invalid="true" aria-describedby="md-painting-err"' : ''}>${radio('medium', 'painting', 'Painting', { id: 'md-painting', first: true })}${radio('medium', 'photography', 'Photography', { id: 'md-photography' })}${radio('medium', 'drawing', 'Drawing', { id: 'md-drawing' })}</div>
<p class="knote">More mediums load from the live tool.</p>
${errLine('medium')}
</div>
</div>` : ''}
${isDim ? `<div class="krow"><span class="klabel" id="k-exp">Artist Experience <i class="req" aria-hidden="true">*</i> <span class="qdot" title="How long you've been making work" aria-hidden="true">?</span></span>
<div class="kctl">
<div class="tray" role="radiogroup" aria-labelledby="k-exp" aria-required="true" ${showE('experience') ? 'aria-invalid="true" aria-describedby="exp-hobby-err"' : ''}>${P.EXP_ORDER.map((v, i) => radio('experience', v, P.expShort(v), { id: 'exp-' + v, tall: true, sub: P.expYears(v), first: i === 0 })).join('')}</div>
<p class="knote">More levels load from the live tool.</p>
${errLine('experience')}
</div>
</div>` : ''}
${isStd ? staticRow('Gallery Representation', 'No') + staticRow('Online Presence', 'Low') + staticRow('Artist Reputation', 'Emerging') + staticRow('Market Demand', 'Low') : ''}
${isTime ? `<div class="krow"><label class="klabel" for="f-rate">Price per Hour ($) <i class="req" aria-hidden="true">*</i></label>
<div class="kctl">${stepper('rate', 'f-rate', { ph: '0', name: 'price per hour', req: true, pre: '$' })}${errLine('rate')}</div>
</div>
<div class="krow"><label class="klabel" for="f-hrs">Hours Spent <i class="req" aria-hidden="true">*</i></label>
<div class="kctl">${stepper('hours', 'f-hrs', { ph: '0', name: 'hours spent', req: true, post: 'hrs' })}${errLine('hours')}</div>
</div>` : ''}
${!isStd ? `<div class="krow"><label class="klabel" for="f-mat">Cost of Materials ($) <i class="req" aria-hidden="true">*</i></label>
<div class="kctl">${stepper('materials', 'f-mat', { ph: '0', name: 'cost of materials', req: true, pre: '$' })}${errLine('materials')}</div>
</div>` : ''}
<div class="keys-foot">
<div class="foot-row">
<div class="punches" role="group" aria-label="Progress">${pun.map((p) => `<span class="punch ${on(p.on)}"><i aria-hidden="true">✓</i>${p.label}<span class="sr-only">${p.on ? ', done' : ', not done'}</span></span>`).join('')}</div>
<button class="btn btn-g" type="button" data-action="clearForm" style="min-height:36px">Clear all</button>
</div>
<button class="cta-bar" type="button" data-action="calculate" ${loading ? 'disabled aria-busy="true"' : ''}>${loading ? '<span class="spin" aria-hidden="true"></span>' : ''}${loading ? 'Calculating…' : 'Calculate Price'}</button>
</div>
</section>
</div>
</div>
</div>
</main>`;
  }

  function sourceCap(source) {
    return source === 'prototype'
      ? '<p class="stage-cap"><span>Prototype figure</span><span>Live price comes from ATH\'s pricing engine</span></p>'
      : '<p class="stage-cap"><span>From ATH\'s pricing engine</span></p>';
  }

  function resultScreen() {
    const r = state.result, f = r.form, date = P.dateLabel(r.createdAt), ln = P.lines(f), saved = !!r.savedId;
    return `<main class="screen" id="main" tabindex="-1" data-key="result">
<div class="band" style="padding-bottom:80px">
<div class="wrap">
<div class="res-top">
<button class="btn btn-g" type="button" data-action="go" data-arg="form" style="padding-left:0">${ICON.left}Back to the calculator</button>
<span class="mono">Priced ${date}</span>
</div>
<div class="device">
<section class="stage" aria-label="Suggested price">
${TILES}
<div class="stage-top"><span class="st-chip">Suggested price</span><span class="st-chip">${L.mode[f.mode]}</span></div>
<div class="stage-in">
<div class="paper" aria-hidden="true"><span class="p-dot"></span><p class="p-mono">Priced · ${date}</p>${framedHtml(f)}</div>
${calcHtml({ interactive: false, aria: 'Calculator showing the suggested price', mode: L.mode[f.mode], label: 'Estimated price', tokens: P.tokens(f), price: P.money(ui.shown), shown: true })}
</div>
<p class="sr-only">Suggested price ${P.money(r.price)}</p>
${sourceCap(r.source)}
</section>
<section class="keys" aria-label="Result details">
${saved ? `<p class="title-st">${esc(r.title || 'Untitled')}</p>` : `<label class="klabel" for="r-title" style="display:block;padding:0 0 6px">Title of work, optional</label>
<input id="r-title" class="title-in" type="text" placeholder="Untitled" maxlength="120" autocomplete="off" value="${esc(r.title)}" data-title>`}
<div class="lab-lines"><span class="lab-b">${esc(ln.l1)}</span><span class="muted">${esc(ln.l2)}</span></div>
${receiptHtml(P.rows(f))}
<p class="res-note">A starting point, not a fixed number. Refine it for your audience, market and goals.</p>
<div class="akeys">
${saved ? '<button class="akey done" type="button" disabled>✓ Saved</button>' : '<button class="akey pri" type="button" data-action="save">Save Calculation</button>'}
<button class="akey" type="button" data-action="openEmail" data-arg="result">Email Result</button>
<button class="akey" type="button" data-action="newCalc">Calculate Again</button>
<button class="akey" type="button" data-action="go" data-arg="form">Edit Inputs</button>
</div>
${saved ? `<p class="saved-line">Hung on your wall. <button class="crumb-btn" type="button" data-action="openDetail" data-arg="${esc(r.savedId)}">View it</button></p>` : ''}
</section>
</div>
</div>
</div>
</main>`;
  }

  function libraryScreen() {
    const recs = state.records, mx = P.maxIn(recs), views = recs.map((r) => recView(r, mx));
    const v = state.view;
    const viewKey = (val, label) => `<button class="key ${on(v === val)}" type="button" role="radio" aria-checked="${tf(v === val)}" tabindex="${v === val ? '0' : '-1'}" data-action="setView" data-arg="${val}">${label}</button>`;
    let body;
    if (!recs.length) {
      body = `<div class="emptypanel">
<p class="eyebrow">Nothing here yet</p>
<h2 class="h2" style="font-size:clamp(28px,3.4vw,40px)">Your wall is empty <span class="serif-i">for now.</span></h2>
<p class="empty-lead">Calculate and save an artwork price, and it will appear here.</p>
<p class="small muted" style="margin:0">Every price you save hangs here, drawn to its real proportions.</p>
<button class="cta-bar" type="button" data-action="newCalc" style="max-width:360px;margin-top:14px">Calculate your first price</button>
</div>`;
    } else if (v === 'wall') {
      body = `<ul class="wallpanel" role="list" style="list-style:none;margin:0" data-key="wall">${views.map((it) => `<li class="piece" data-key="${esc(it.id)}">
<button class="piece-btn" type="button" data-action="openDetail" data-arg="${esc(it.id)}" aria-label="Open calculation: ${esc(it.aria)}">
<span class="piece-fr"><span class="surf ${it.kind}" style="display:block;position:relative;width: ${it.pw}px; height: ${it.ph}px">${artSvg(it.kind, 'wall')}</span></span>
</button>
<div class="plabel">
<div class="plabel-in">
<p class="pl-title">${esc(it.title)}</p>
<p class="pl-what">${esc(it.what)} · ${esc(it.modeLabel)}</p>
<p class="pl-price"><i>=</i>${esc(it.priceLabel)}<span class="pl-date">${esc(it.date)}</span></p>
</div>
<button class="icon-btn" type="button" data-action="askDelete" data-arg="${esc(it.id)}" aria-label="Delete calculation: ${esc(it.aria)}">${ICON.trash(17)}</button>
</div>
</li>`).join('')}</ul>
<p class="scale-note">Frames shown to relative scale · newest first</p>`;
    } else {
      body = `<ul class="ltape" role="list" style="list-style:none;margin:0 0 96px" data-key="index">${views.map((it) => `<li class="lslip" data-key="${esc(it.id)}">${slipHtml(it, true)}<button class="icon-btn" type="button" data-action="askDelete" data-arg="${esc(it.id)}" aria-label="Delete calculation: ${esc(it.aria)}">${ICON.trash(18)}</button></li>`).join('')}</ul>`;
    }
    return `<main class="wrap screen" id="main" tabindex="-1" data-key="library">
<div class="lib-head">
<div>
<p class="eyebrow">Your wall</p>
<h1 class="poster">My <em>Calculations</em></h1>
<p class="small muted" style="margin:12px 0 0">${recCountLine()}. Saved on this device for now; the live tool keeps them in your ATH account.</p>
</div>
<div class="lib-tools">
${recs.length ? `<div class="tray" role="radiogroup" aria-label="View">${viewKey('wall', 'Wall')}${viewKey('index', 'Index')}</div>` : ''}
<button class="btn btn-p" type="button" data-action="newCalc">New calculation</button>
</div>
</div>
${resumeHtml('Not saved yet:', 'style="margin:0 0 20px"')}
${body}
</main>`;
  }

  function detailScreen() {
    const rec = state.records.find((x) => x.id === state.detailId);
    if (!rec) return '<main class="wrap screen" id="main" tabindex="-1" data-key="detail-missing"></main>';
    const d = recView(rec), f = d.f;
    return `<main class="screen" id="main" tabindex="-1" data-key="detail-${esc(rec.id)}">
<div class="band" style="padding-bottom:80px">
<div class="wrap">
<div class="res-top"><button class="btn btn-g" type="button" data-action="go" data-arg="library" style="padding-left:0">${ICON.left}My Calculations</button></div>
<div class="device">
<section class="stage" aria-label="Saved price">
${TILES}
<div class="stage-top"><span class="st-chip">Saved price</span><span class="st-chip">${d.modeLabel}</span></div>
<div class="stage-in">
<div class="paper" aria-hidden="true"><span class="p-dot" style="animation-delay:.2s"></span><p class="p-mono">Saved · ${d.date}</p>${framedHtml(f)}</div>
${calcHtml({ interactive: false, aria: 'Calculator showing the saved price', mode: d.modeLabel, label: 'Saved price', tokens: P.tokens(f), price: d.priceLabel })}
</div>
<p class="sr-only">Saved price ${d.priceLabel}</p>
${sourceCap(rec.priceSource)}
</section>
<section class="keys" aria-label="Saved calculation details">
<div class="rec-strip"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V7a4 4 0 0 1 8 0v4"></path></svg><span>Saved calculation</span><span style="opacity:.5" aria-hidden="true">·</span><span>${d.date}</span><span style="opacity:.5" aria-hidden="true">·</span><span>Read-only</span></div>
<h1 class="title-st">${esc(d.title)}</h1>
<div class="lab-lines"><span class="lab-b">${esc(d.l1)}</span><span class="muted">${esc(d.l2)}</span></div>
${receiptHtml(P.rows(f))}
<div class="akeys">
<button class="akey pri" type="button" data-action="reuse" data-arg="${esc(rec.id)}">Use as Starting Point</button>
<button class="akey" type="button" data-action="openEmail" data-arg="detail">Email Result</button>
<button class="akey danger" type="button" data-action="askDelete" data-arg="${esc(rec.id)}" style="grid-column:1/-1">Delete</button>
</div>
<p class="small muted" style="margin:12px 0 0">Starting from it opens a new calculation. This record won't change.</p>
</section>
</div>
</div>
</div>
</main>`;
  }

  // ---------- overlays ----------
  function emailSource() {
    const em = state.email;
    if (em.source === 'result' && state.result) return { title: state.result.title, price: state.result.price, form: state.result.form };
    const rec = em.source === 'detail' && state.records.find((x) => x.id === em.id);
    return rec ? { title: rec.title, price: rec.price, form: formOf(rec) } : null;
  }
  function emailMessage(src) {
    return {
      subject: (src.title ? src.title.trim() + ': ' : '') + 'your artwork price estimate is ' + P.money(src.price),
      rows: [{ k: 'Suggested price', v: P.money(src.price) }].concat(P.rows(src.form)),
    };
  }

  function emailModal() {
    const em = state.email, src = emailSource();
    if (!em.open || !src) return '';
    const msg = emailMessage(src);
    const invalid = em.status === 'invalid', sending = em.status === 'sending';
    const done = em.status === 'prepared' || em.status === 'sent';
    return `<div class="scrim" data-scrim="email" data-key="m-email">
<div class="modal" role="dialog" aria-modal="true" aria-labelledby="em-h">
<div class="modal-head">
<div><p class="eyebrow">Email Result</p><h2 class="h3" id="em-h" style="margin-top:8px">Send this estimate by email</h2></div>
<button class="icon-btn" type="button" data-action="closeEmail" aria-label="Close">${ICON.close}</button>
</div>
${done ? `<div class="status status-ok" role="status">
<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex:none"><path d="m5 12 5 5 9-10"></path></svg>
${em.status === 'sent'
    ? `<div class="small"><b style="display:block">Sent to ${esc(em.to)}</b>The estimate is on its way.</div>`
    : `<div class="small"><b style="display:block">Email ready for ${esc(em.to)}</b>This prototype isn't connected to an email service, so nothing was delivered. In the live tool, this step sends the estimate and confirms it here.</div>`}
</div>
<div class="modal-actions"><button class="btn btn-p" type="button" data-action="closeEmail" data-autofocus>Done</button></div>` : `<form data-form="email" novalidate>
<label class="lbl" for="em-to"><span>Send to <span class="req" aria-hidden="true">*</span></span></label>
<input id="em-to" class="input ${invalid ? 'bad' : ''}" type="email" autocomplete="email" placeholder="name@example.com" value="${esc(em.to)}" data-email data-autofocus aria-required="true" aria-invalid="${tf(invalid)}" ${invalid ? 'aria-describedby="em-err"' : ''}>
${invalid ? '<span class="err" id="em-err">Enter a valid email address, like name@example.com.</span>' : ''}
<div class="preview">
<p class="mono muted" style="margin-bottom:10px">What they'll receive</p>
<p class="pv-sub">${esc(msg.subject)}</p>
${msg.rows.map((row) => `<div class="pv-row"><span>${esc(row.k)}</span><span>${esc(row.v)}</span></div>`).join('')}
<p class="small muted" style="margin:12px 0 0">Calculated with the ATH Artwork Price Calculator. A starting point, not a fixed number.</p>
</div>
${em.status === 'error' ? '<div class="status status-err" role="alert"><div class="small"><b style="display:block">Couldn\'t send the email</b>Nothing was sent. Check the address and try again.</div></div>' : ''}
<div class="modal-actions">
<button class="btn btn-g" type="button" data-action="closeEmail">Cancel</button>
<button class="btn btn-p" type="submit" ${sending ? 'disabled aria-busy="true"' : ''}>${sending ? '<span class="spin" aria-hidden="true"></span>' : ''}${sending ? 'Sending…' : (em.status === 'error' ? 'Try again' : 'Send')}</button>
</div>
</form>`}
</div>
</div>`;
  }

  function dialogModal() {
    const d = state.dialog;
    if (!d) return '';
    if (d.kind === 'unsaved') {
      return `<div class="scrim" data-key="m-unsaved"><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="us-h" aria-describedby="us-d">
<h2 class="h3" id="us-h">This price isn't saved yet</h2>
<p class="small muted" style="margin:10px 0 0" id="us-d">${esc(unsavedSummary())}. Save it to hang it on your wall, or discard it and continue.</p>
<div class="modal-actions">
<button class="btn btn-g" type="button" data-action="dlgCancel">Cancel</button>
<button class="btn btn-s" type="button" data-action="dlgDiscard">Discard</button>
<button class="btn btn-p" type="button" data-action="dlgSave" data-autofocus>Save and continue</button>
</div>
</div></div>`;
    }
    const rec = state.records.find((x) => x.id === d.id);
    const v = rec ? recView(rec) : null;
    return `<div class="scrim" data-key="m-delete"><div class="modal" role="alertdialog" aria-modal="true" aria-labelledby="del-h" aria-describedby="del-d">
<h2 class="h3" id="del-h">Take this off your wall?</h2>
<p class="small" style="margin:10px 0 0"><b>${v ? esc(v.title + ' · ' + v.priceLabel + ' · ' + v.what) : ''}</b></p>
<p class="small muted" style="margin:6px 0 0" id="del-d">The calculation will be deleted. This can't be undone.</p>
<div class="modal-actions">
<button class="btn btn-s" type="button" data-action="dlgCancel" data-autofocus>Keep it</button>
<button class="btn btn-dp" type="button" data-action="dlgDelete">Delete</button>
</div>
</div></div>`;
  }

  function toastHtml() {
    const t = state.toast;
    if (!t) return '';
    return `<div class="toast" role="status" data-key="toast-${t.n}">${ICON.check}<span>${esc(t.text)}</span>${t.act ? `<button class="toast-btn" type="button" data-action="toastAct">${esc(t.actionLabel)}</button>` : ''}</div>`;
  }

  // ---------- render ----------
  const SCREENS = { tools: toolsScreen, workspace: workspaceScreen, form: formScreen, result: resultScreen, library: libraryScreen, detail: detailScreen };
  // Replacing a focused node fires blur handlers mid-patch; those updates wait until this pass ends.
  let rendering = false, pending = false;
  function render() {
    if (rendering) { pending = true; return; }
    rendering = true;
    try { paint(); } finally { rendering = false; }
    if (pending) { pending = false; render(); }
  }
  function paint() {
    const s = state.screen;
    const html = (s === 'tools' ? '' : toolNav()) + SCREENS[s]() + emailModal() + dialogModal() + toastHtml();
    const view = document.getElementById('view');
    const next = document.createElement('div');
    next.innerHTML = html;
    morphChildren(view, next);
    afterRender();
  }

  function afterRender() {
    // Screen change: move focus to the new screen so screen readers and keyboards start there.
    if (ui.lastScreen !== state.screen + state.detailId) {
      const first = !ui.lastScreen;
      ui.lastScreen = state.screen + state.detailId;
      if (!first) {
        try { window.scrollTo({ top: 0, behavior: reduceMotion() ? 'auto' : 'smooth' }); } catch (e) { window.scrollTo(0, 0); }
        const main = document.getElementById('main');
        if (main && !document.querySelector('.scrim')) main.focus({ preventScroll: true });
      }
    }
    // Dialogs: focus the first action on open, give focus back on close.
    const scrim = document.querySelector('.scrim');
    const key = scrim ? scrim.getAttribute('data-key') : '';
    if (key !== ui.lastModal) {
      if (key && !ui.lastModal) ui.opener = document.activeElement;
      ui.lastModal = key;
      if (key) {
        const t = scrim.querySelector('[data-autofocus]') || scrim.querySelector('button, input');
        if (t) t.focus();
      } else if (ui.opener && document.contains(ui.opener)) {
        ui.opener.focus();
        ui.opener = null;
      }
    }
    // Background content is inert while a dialog is open.
    document.querySelectorAll('.site-wrap, #main, [data-key="toolnav"]').forEach((el) => { if (key) el.setAttribute('inert', ''); else el.removeAttribute('inert'); });
    document.body.style.overflow = key ? 'hidden' : '';
  }

  // Minimal DOM morph: keeps existing nodes (and so focus and caret) where the markup matches.
  function morphChildren(from, to) {
    const a = Array.from(from.childNodes), b = Array.from(to.childNodes);
    for (let i = 0; i < b.length; i++) {
      const f = a[i], t = b[i];
      if (!f) { from.appendChild(t); continue; }
      if (f.nodeType !== t.nodeType || f.nodeName !== t.nodeName || (f.nodeType === 1 && f.getAttribute('data-key') !== t.getAttribute('data-key'))) { from.replaceChild(t, f); continue; }
      if (f.nodeType === 3 || f.nodeType === 8) { if (f.data !== t.data) f.data = t.data; continue; }
      morphEl(f, t);
    }
    for (let i = a.length - 1; i >= b.length; i--) if (a[i].parentNode === from) from.removeChild(a[i]);
  }
  function morphEl(f, t) {
    for (const at of Array.from(f.attributes)) if (!t.hasAttribute(at.name)) f.removeAttribute(at.name);
    for (const at of Array.from(t.attributes)) if (f.getAttribute(at.name) !== at.value) f.setAttribute(at.name, at.value);
    if (f.nodeName === 'INPUT') {
      const v = t.getAttribute('value') || '';
      if (f.value !== v) f.value = v;
      return;
    }
    if (f.nodeName === 'BUTTON') f.disabled = t.hasAttribute('disabled');
    morphChildren(f, t);
  }

  // ---------- actions ----------
  function showToast(text, actionLabel, act) {
    clearTimeout(ui.toastT);
    set({ toast: { text, actionLabel: actionLabel || '', act: act || null, n: Date.now() } });
    ui.toastT = setTimeout(() => set({ toast: null }), act ? 6000 : 4200);
  }

  function setField(k, v) {
    const form = Object.assign({}, state.form); form[k] = v;
    const patch = { form };
    if (state.calcStatus === 'error') patch.calcStatus = 'idle';
    if (k === 'mode') patch.submitted = false;
    set(patch);
  }

  function bump(k, dir) {
    const min = k === 'materials' ? 0 : 1;
    const cur = P.num(state.form[k]);
    const v = Math.round(((cur >= 0 ? cur : 0) + dir) * 100) / 100;
    if (k === 'height' && v <= 0) { setField('height', ''); return; }
    setField(k, String(Math.max(min, v)));
  }

  function kpPress(ch) {
    if (state.screen !== 'form' && state.screen !== 'workspace') return;
    const k = kpTarget();
    const next = P.kpApply(state.form[k], ch);
    if (next === null) return;
    const form = Object.assign({}, state.form); form[k] = next;
    set({ form, activeField: k, calcStatus: state.calcStatus === 'error' ? 'idle' : state.calcStatus });
  }

  function focusId(id) { setTimeout(() => { const el = document.getElementById(id); if (el) { el.focus(); el.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' }); } }, 30); }

  async function calculate() {
    if (state.calcStatus === 'loading') return;
    const f = state.form;
    const keys = Object.keys(P.errs(f));
    const ids = { length: 'f-len', width: 'f-wid', height: 'f-hei', medium: 'md-painting', experience: 'exp-hobby', materials: 'f-mat', rate: 'f-rate', hours: 'f-hrs' };
    if (keys.length) { set({ submitted: true }); focusId(ids[keys[0]]); return; }
    set({ submitted: true, calcStatus: 'loading' });
    announce('Calculating');
    const snapshot = Object.assign({}, f);
    let out;
    try { out = await Pricing.estimate(P.inputsFor(snapshot)); } catch (e) { set({ calcStatus: 'error' }); return; }
    state.result = { form: snapshot, price: out.price, source: out.source || 'prototype', createdAt: new Date().toISOString(), savedId: null, title: '' };
    ui.shown = reduceMotion() ? out.price : 0;
    set({ calcStatus: 'idle', reuseFrom: null });
    go('result');
    animate(out.price);
    announce('Suggested price ' + P.money(out.price));
  }

  function animate(target) {
    cancelAnimationFrame(ui.raf);
    if (reduceMotion()) { ui.shown = target; paintShown(); return; }
    const start = performance.now() + 350, dur = 800;
    const step = (t) => {
      const p = Math.max(0, Math.min(1, (t - start) / dur));
      ui.shown = target * (1 - Math.pow(1 - p, 3));
      paintShown();
      if (p < 1) ui.raf = requestAnimationFrame(step);
    };
    ui.raf = requestAnimationFrame(step);
  }
  function paintShown() { document.querySelectorAll('[data-shown]').forEach((el) => { el.textContent = P.money(ui.shown); }); }

  async function save(after) {
    const r = state.result;
    if (!r || r.savedId || ui.saving) return;
    ui.saving = true;
    try {
      const rec = await Store.save({ mode: r.form.mode, inputs: P.inputsFor(r.form), price: r.price, priceSource: r.source, title: r.title, createdAt: r.createdAt });
      state.records = await Store.list();
      state.result = Object.assign({}, r, { savedId: rec.id, title: rec.title });
      if (after) after(); else render();
      showToast('Hung on your wall', 'View', () => go('detail', rec.id));
    } finally { ui.saving = false; }
  }

  function guard(kind, payload) {
    if (hasUnsaved()) set({ dialog: { kind: 'unsaved', next: kind, payload } });
    else run(kind, payload);
  }
  function run(kind, payload) { if (kind === 'new') doNew(); if (kind === 'reuse') doReuse(payload); }
  function doNew() {
    const f = state.form;
    Object.assign(state, { form: P.defaults(f.unit, f.mode), touched: {}, submitted: false, calcStatus: 'idle', result: null, reuseFrom: null, dialog: null });
    go('form');
  }
  function doReuse(id) {
    const rec = state.records.find((x) => x.id === id);
    if (!rec) return;
    Object.assign(state, { form: formOf(rec), touched: {}, submitted: false, calcStatus: 'idle', result: null, reuseFrom: (rec.title || 'Untitled') + ', ' + P.dateLabel(rec.createdAt), dialog: null });
    go('form');
  }

  async function confirmDelete() {
    const id = state.dialog && state.dialog.id;
    await Store.remove(id);
    state.records = await Store.list();
    if (state.result && state.result.savedId === id) state.result = Object.assign({}, state.result, { savedId: null });
    ui.opener = null;
    state.dialog = null;
    if (state.screen === 'detail') go('library'); else render();
    showToast('Calculation deleted');
  }

  function openEmail(source) {
    set({ email: { open: true, to: state.email.to || '', status: 'idle', source, id: source === 'detail' ? state.detailId : null } });
  }
  async function sendEmail() {
    const em = state.email;
    if (em.status === 'sending') return;
    if (!P.validEmail(em.to)) { set({ email: Object.assign({}, em, { status: 'invalid' }) }); const i = document.getElementById('em-to'); if (i) i.focus(); return; }
    const src = emailSource();
    set({ email: Object.assign({}, em, { status: 'sending' }) });
    try {
      const res = await Mail.sendEstimate(Object.assign({ to: em.to.trim() }, emailMessage(src)));
      if (!state.email.open) return;
      set({ email: Object.assign({}, state.email, { status: res && res.delivered ? 'sent' : 'prepared' }) });
    } catch (e) {
      if (state.email.open) set({ email: Object.assign({}, state.email, { status: 'error' }) });
    }
    const done = document.querySelector('.scrim [data-autofocus]');
    if (done) done.focus();
  }
  function closeEmail() { set({ email: Object.assign({}, state.email, { open: false, status: 'idle' }) }); }

  const ACTIONS = {
    go: (arg) => go(arg),
    skip: (arg, el, ev) => { ev.preventDefault(); const m = document.getElementById('main'); if (m) m.focus(); },
    navNote: () => showToast('Site navigation isn’t part of this prototype'),
    openStudio: () => showToast('Artist Studio isn’t part of this prototype'),
    pick: (arg, el) => setField(el.getAttribute('data-field'), arg),
    bump: (arg, el) => bump(el.getAttribute('data-field'), Number(arg)),
    kpEq: () => { if (state.screen === 'workspace') go('form'); else if (state.screen === 'form') calculate(); },
    calculate: () => calculate(),
    clearForm: () => set({ form: P.defaults(state.form.unit, state.form.mode), touched: {}, submitted: false, calcStatus: 'idle', reuseFrom: null }),
    focusField: (arg) => focusId(arg),
    save: () => save(),
    newCalc: () => guard('new'),
    reuse: (arg) => guard('reuse', arg),
    openDetail: (arg) => { set({ toast: null }); go('detail', arg); },
    setView: (arg) => set({ view: arg }),
    askDelete: (arg) => set({ dialog: { kind: 'delete', id: arg } }),
    openEmail: (arg) => openEmail(arg),
    closeEmail: () => closeEmail(),
    dlgCancel: () => set({ dialog: null }),
    dlgDiscard: () => { const d = state.dialog; state.result = null; state.dialog = null; ui.opener = null; run(d.next, d.payload); },
    dlgSave: () => { const d = state.dialog; ui.opener = null; save(() => run(d.next, d.payload)); },
    dlgDelete: () => confirmDelete(),
    toastAct: () => { const t = state.toast; clearTimeout(ui.toastT); set({ toast: null }); if (t && t.act) t.act(); },
  };

  // ---------- events ----------
  document.addEventListener('click', (ev) => {
    const kp = ev.target.closest('[data-kp]');
    if (kp) { kpPress(kp.getAttribute('data-kp')); return; }
    const el = ev.target.closest('[data-action]');
    if (el && !el.disabled) { ACTIONS[el.getAttribute('data-action')](el.getAttribute('data-arg'), el, ev); return; }
    const scrim = ev.target.closest('[data-scrim]');
    if (scrim && ev.target === scrim) closeEmail();
  });
  // Keep focus in the field while pressing the keypad, so typing continues where it was.
  document.addEventListener('mousedown', (ev) => { if (ev.target.closest('[data-kp], .c-k.eq, .c-k.inert')) ev.preventDefault(); });

  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.hasAttribute('data-field')) setField(t.getAttribute('data-field'), t.value);
    else if (t.hasAttribute('data-title') && state.result) { state.result = Object.assign({}, state.result, { title: t.value }); render(); }
    else if (t.hasAttribute('data-email')) set({ email: Object.assign({}, state.email, { to: t.value, status: state.email.status === 'invalid' || state.email.status === 'error' ? 'idle' : state.email.status }) });
  });
  document.addEventListener('focusin', (ev) => {
    const k = ev.target.getAttribute && ev.target.getAttribute('data-field');
    if (k && ev.target.nodeName === 'INPUT' && state.activeField !== k) set({ activeField: k });
  });
  document.addEventListener('focusout', (ev) => {
    const k = ev.target.getAttribute && ev.target.getAttribute('data-touch');
    if (k && !state.touched[k]) set({ touched: Object.assign({}, state.touched, { [k]: true }) });
  });
  document.addEventListener('submit', (ev) => { if (ev.target.getAttribute('data-form') === 'email') { ev.preventDefault(); sendEmail(); } });

  document.addEventListener('keydown', (ev) => {
    const scrim = document.querySelector('.scrim');
    if (scrim) {
      if (ev.key === 'Escape') { ev.preventDefault(); if (state.email.open) closeEmail(); else if (state.dialog) set({ dialog: null }); return; }
      if (ev.key === 'Tab') { // keep focus inside the dialog
        const f = Array.from(scrim.querySelectorAll('button:not([disabled]), input')).filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); last.focus(); }
        else if (!ev.shiftKey && document.activeElement === last) { ev.preventDefault(); first.focus(); }
      }
      return;
    }
    const t = ev.target;
    // Enter in a number field works like "=" on the calculator.
    if (ev.key === 'Enter' && t.classList && t.classList.contains('box-in')) { ev.preventDefault(); ACTIONS.kpEq(); return; }
    // Arrow keys move between options in a radio tray.
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(ev.key) >= 0 && t.getAttribute && t.getAttribute('role') === 'radio') {
      const group = Array.from(t.parentNode.querySelectorAll('[role="radio"]'));
      const i = group.indexOf(t), d = ev.key === 'ArrowLeft' || ev.key === 'ArrowUp' ? -1 : 1;
      const nxt = group[(i + d + group.length) % group.length];
      ev.preventDefault();
      nxt.click();
      const id = nxt.id, field = nxt.getAttribute('data-field'), arg = nxt.getAttribute('data-arg'), action = nxt.getAttribute('data-action');
      setTimeout(() => { const el = id ? document.getElementById(id) : document.querySelector(`[data-action="${action}"][data-arg="${arg}"]${field ? `[data-field="${field}"]` : ''}`); if (el) el.focus(); }, 0);
    }
  });

  window.addEventListener('hashchange', applyRoute);

  // ---------- start ----------
  Store.list().then((list) => { state.records = list; applyRoute(); });
})();
