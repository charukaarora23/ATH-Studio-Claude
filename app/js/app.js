/* My Studio v3: view layer. Presentation and interaction only.
   Persistence and generation go through window.StudioService; writing rules live in StudioLogic; 3D in Studio3D. */
(function () {
  'use strict';
  const S = window.StudioService; const L = window.StudioLogic; const Snd = window.StudioSound; const D3 = window.Studio3D;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('#main'); const html = document.documentElement;
  const has3D = !!(D3 && D3.supported());

  /* ---------------- settings ---------------- */
  const prefs = S.prefs();
  const mq = (q) => window.matchMedia && matchMedia(q).matches;
  let motion = prefs.motion !== false && !mq('(prefers-reduced-motion: reduce)');
  let view3d = null; // the live 3D scene for the current view
  function setTheme(t) {
    html.dataset.theme = t;
    $$('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
    const tc = $('meta[name="theme-color"]'); if (tc) tc.content = t === 'dark' ? '#1F080E' : '#FBF6EF';
    view3d && view3d.setTheme(t === 'dark');
  }
  setTheme(prefs.theme || (mq('(prefers-color-scheme: dark)') ? 'dark' : 'light'));
  $$('[data-theme-set]').forEach((b) => b.addEventListener('click', () => { setTheme(b.dataset.themeSet); S.setPref('theme', b.dataset.themeSet); }));
  function setMotion(on) { motion = on; html.classList.toggle('no-motion', !on); $('#motion-on').checked = on; }
  setMotion(motion);
  $('#motion-on').addEventListener('change', (e) => { setMotion(e.target.checked); S.setPref('motion', motion); });
  Snd.set(!!prefs.sound, prefs.volume); $('#sound-on').checked = !!prefs.sound; $('#sound-vol').value = Math.round((prefs.volume ?? 0.6) * 100);
  $('#sound-on').addEventListener('change', (e) => { Snd.set(e.target.checked, $('#sound-vol').value / 100); S.setPref('sound', e.target.checked); if (e.target.checked) Snd.play('tick'); });
  $('#sound-vol').addEventListener('input', (e) => { Snd.set($('#sound-on').checked, e.target.value / 100); S.setPref('volume', e.target.value / 100); });
  $('#sound-test').addEventListener('click', () => Snd.test());
  const setBtn = $('#settings-btn'); const setPanel = $('#settings');
  const closeSettings = () => { setPanel.hidden = true; setBtn.setAttribute('aria-expanded', 'false'); };
  setBtn.addEventListener('click', () => { const open = setPanel.hidden; setPanel.hidden = !open; setBtn.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', (e) => { if (!setPanel.hidden && !e.target.closest('.pop')) closeSettings(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !setPanel.hidden) { closeSettings(); setBtn.focus(); } });

  const anim = (el, kf, o) => (motion && el && el.animate ? el.animate(kf, { fill: 'both', ...o }).finished.catch(() => {}) : Promise.resolve());
  const ease = 'cubic-bezier(.16,1,.3,1)';

  /* ---------------- content model ---------------- */
  // One colour per section, used for its folder, its nav dot, its buttons and its files.
  const SEC = {
    bio: { color: '#AA0003', tint: '#FFD6DE', ink: '#FFFFFF' },
    statement: { color: '#025054', tint: '#D0D996', ink: '#F9ECE5' },
    files: { color: '#F7C3D6', tint: '#FFF3B2', ink: '#6A0620', backShade: 0.9 },
  };
  const USES = ['Website', 'Gallery or exhibition', 'Application', 'Press', 'Social profile', 'Other'];
  const TYPES = {
    bio: {
      label: 'Artist bio', short: 'Bio', line: 'Who you are and what you make.',
      steps: [
        { key: 'purpose', tab: 'Purpose', q: 'What is this bio for?', lead: 'This sets the tone and what to leave out.', fields: [
          { k: 'use', type: 'chips', label: 'Where will it be used?', options: USES },
          { row: [{ k: 'person', type: 'seg', label: 'Written in', options: [['third', 'Third person'], ['first', 'First person']], def: 'third' }, { k: 'limit', type: 'number', label: 'Word limit', opt: true, presets: [50, 100, 150] }] },
          { k: 'pronouns', type: 'chips', label: 'Pronouns', when: (a) => (a.person || 'third') === 'third', options: [['she', 'she/her'], ['he', 'he/him'], ['they', 'they/them'], ['name', 'Name only']] },
        ] },
        { key: 'practice', tab: 'Practice', q: 'How do you describe what you do?', lead: 'Plain words are best.', fields: [
          { k: 'name', type: 'text', label: 'Your name', required: true, ph: 'As it should appear' },
          { k: 'role', type: 'text', label: 'Your practice in a few words', required: true, ph: 'e.g. textile artist', example: 'Printmaker working with found paper.' },
          { k: 'location', type: 'text', label: 'Where you live or work', opt: true, ph: 'City, region or country' },
        ] },
        { key: 'work', tab: 'The work', q: 'What does the work keep returning to?', lead: 'Only what you write here goes into the bio.', fields: [
          { k: 'subjects', type: 'text', label: 'Subjects or questions', ph: 'Separate with commas', example: 'tides, borrowed recipes, my street at night' },
          { k: 'materials', type: 'text', label: 'Materials and process', ph: 'e.g. natural dye, large woven hangings' },
          { k: 'detail', type: 'area', label: 'One specific detail', help: 'Something a viewer would not know from a photo.' },
        ] },
        { key: 'background', tab: 'Background', q: 'What belongs in this version?', lead: 'No formal training or shows? Leave it blank. The bio will focus on the work.', fields: [
          { k: 'background', type: 'area', label: 'Training, shows or other background', opt: true },
          { row: [{ k: 'series', type: 'text', label: 'Current series', opt: true, ph: 'Title' }, { k: 'seriesLine', type: 'text', label: 'In one line', opt: true, ph: 'What it is' }] },
        ] },
        { key: 'draft', tab: 'Draft' },
      ],
      notes: [['use', 'For', 0], ['person', 'Voice', 0], ['limit', 'Length', 0], ['name', 'Name', 1], ['role', 'Practice', 1], ['location', 'Place', 1], ['subjects', 'Subjects', 2], ['materials', 'Materials', 2], ['detail', 'Detail', 2], ['background', 'Background', 3], ['series', 'Series', 3]],
      required: ['name', 'role'],
    },
    statement: {
      label: 'Artist statement', short: 'Statement', line: 'The work itself and why you make it.',
      steps: [
        { key: 'purpose', tab: 'Purpose', q: 'What is this statement for?', lead: 'This sets the tone and the length.', fields: [
          { k: 'use', type: 'chips', label: 'Where will it be used?', options: USES },
          { row: [{ k: 'person', type: 'seg', label: 'Written in', options: [['first', 'First person'], ['third', 'Third person']], def: 'first' }, { k: 'limit', type: 'number', label: 'Word limit', opt: true, presets: [150, 300, 500] }] },
          { k: 'name', type: 'text', label: 'Your name', opt: true, when: (a) => a.person === 'third' },
          { k: 'pronouns', type: 'chips', label: 'Pronouns', when: (a) => a.person === 'third', options: [['she', 'she/her'], ['he', 'he/him'], ['they', 'they/them'], ['name', 'Name only']] },
        ] },
        { key: 'work', tab: 'The work', q: 'What does your work explore?', lead: 'Notes and fragments are fine.', fields: [
          { k: 'subjects', type: 'text', label: 'Subjects', required: true, ph: 'Separate with commas', example: 'weather, inherited furniture, waiting rooms' },
          { k: 'question', type: 'area', label: 'A question you keep asking', opt: true },
        ] },
        { key: 'process', tab: 'Process', q: 'How do you make it?', lead: 'Describe it the way you would to a friend in the studio.', fields: [
          { k: 'materials', type: 'text', label: 'Materials and process', ph: 'e.g. oil on unstretched linen' },
          { k: 'detail', type: 'area', label: 'One specific detail of the process' },
        ] },
        { key: 'why', tab: 'Why', q: 'Why do you make it this way?', lead: 'One or two sentences in your own words.', fields: [
          { k: 'motivation', type: 'area', label: 'What keeps bringing you back' },
          { row: [{ k: 'series', type: 'text', label: 'Current series', opt: true }, { k: 'seriesLine', type: 'text', label: 'In one line', opt: true }] },
        ] },
        { key: 'draft', tab: 'Draft' },
      ],
      notes: [['use', 'For', 0], ['person', 'Voice', 0], ['limit', 'Length', 0], ['subjects', 'Subjects', 1], ['question', 'Question', 1], ['materials', 'Materials', 2], ['detail', 'Detail', 2], ['motivation', 'Why', 3], ['series', 'Series', 3]],
      required: ['subjects'],
    },
  };

  const work = {};
  function getWork(type) { if (!work[type]) work[type] = S.loadDraft(type) || { answers: {}, step: 0, draft: null }; return work[type]; }
  let saveTimer;
  function autosave(type) { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const w = getWork(type); S.saveDraft(type, { answers: w.answers, step: w.step, draft: w.draft }); const s = $('#saved'); if (s) s.textContent = 'Draft saved on this device'; }, 400); }
  const fmtDate = (iso) => new Date(String(iso).slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
  const voiceLabel = (a, type) => { const p = a.person || (type === 'statement' ? 'first' : 'third'); if (p === 'first') return 'First person'; const pr = { she: 'she/her', he: 'he/him', they: 'they/them', name: 'name only' }[a.pronouns]; return 'Third person' + (pr ? ', ' + pr : ''); };
  function noteValue(k, a, type) {
    if (k === 'limit') return a.limit ? `Up to ${a.limit} words` : '';
    if (k === 'person') return voiceLabel(a, type);
    if (k === 'series') return a.series ? a.series + (a.seriesLine ? ': ' + a.seriesLine : '') : '';
    return a[k] || '';
  }
  const answered = (type) => { const a = getWork(type).answers; return TYPES[type].notes.filter(([k]) => k !== 'person' && noteValue(k, a, type)).length; };

  /* subtle 3D tilt for paper objects that follow the pointer */
  function tilt(el, max = 4) {
    el.addEventListener('pointermove', (e) => { if (!motion || e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `rotateY(${x * max}deg) rotateX(${-y * max}deg) translateZ(0)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  /* ---------------- routing ---------------- */
  let current = null;
  function route() { const h = location.hash.replace(/^#\/?/, ''); return ['bio', 'statement', 'files'].includes(h) ? h : 'home'; }
  async function go() {
    const r = route();
    $$('.nav a').forEach((a) => (a.dataset.route === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const from = current; current = r;
    if (view3d) { view3d.destroy(); view3d = null; }
    main.dataset.sec = r === 'home' ? '' : r;
    if (r === 'home') await renderHome();
    else if (r === 'files') await renderFiles();
    else await renderDesk(r);
    if (from !== null) { main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
    anim(main, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 500, easing: ease }).then(() => main.getAnimations().forEach((a) => a.cancel()));
  }
  window.addEventListener('hashchange', go);

  /* ---------------- home ---------------- */
  const firstName = () => L.clean(((S.loadDraft('bio') || {}).answers || {}).name || '').split(' ')[0];
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  async function renderHome() {
    const all = await S.listDocuments(); const n = { bio: all.filter((d) => d.type === 'bio').length, statement: all.filter((d) => d.type === 'statement').length, files: all.length };
    const recent = all.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
    const label = { bio: 'Bio', statement: 'Statement', files: 'My files' };
    const sub = { bio: plural(n.bio, 'version', 'versions'), statement: plural(n.statement, 'version', 'versions'), files: plural(n.files, 'document', 'documents') };
    main.innerHTML = `<div class="wrap">
      <section class="home-hero"><h1>${greeting()}${firstName() ? ', ' + esc(firstName()) : ''}.</h1><p>Write a bio or an artist statement. Every version you keep is filed in its folder.</p></section>
      <section class="stage3d" aria-label="Folders">
        ${has3D ? '<canvas id="shelf" aria-hidden="true"></canvas>' : '<div class="flat" aria-hidden="true" style="height:clamp(240px,30vw,380px)"><span data-sec="bio"></span><span data-sec="statement"></span><span data-sec="files"></span></div>'}
        <div class="shelf-labels">${['bio', 'statement', 'files'].map((k) => `<a class="shelf-label" data-sec="${k}" data-key="${k}" href="#/${k}"><b><i></i>${label[k]}</b><span>${sub[k]}</span></a>`).join('')}</div>
      </section>
      <section class="recent" aria-labelledby="rec-h"><h2 id="rec-h">Recently filed</h2>
        <ul>${recent.map((d) => `<li><a href="#" data-doc="${d.id}" data-sec="${d.type}"><i></i><b>${esc(d.title)}${d.sample ? '<span class="tag-sample">Sample</span>' : ''}</b><span>${d.type === 'bio' ? 'Bio' : 'Statement'} · ${fmtDate(d.date)}</span></a></li>`).join('') || '<li><a href="#/bio"><i></i><b>Nothing filed yet. Start with your bio.</b><span></span></a></li>'}</ul>
      </section></div>`;
    const labels = $$('.shelf-label', main); let focusKey = null;
    const mark = (k) => labels.forEach((l) => l.classList.toggle('hot', l.dataset.key === k));
    if (has3D) {
      view3d = D3.shelf($('#shelf'), {
        folders: ['bio', 'statement', 'files'].map((k) => ({ key: k, ...SEC[k], label: label[k], sub: sub[k], count: n[k] })),
        motion: () => motion, focus: () => focusKey,
        onHover: mark, onOpen: (k) => openFolder(k),
      });
      view3d.setTheme(html.dataset.theme === 'dark');
    }
    labels.forEach((l) => {
      l.addEventListener('focus', () => { focusKey = l.dataset.key; mark(focusKey); });
      l.addEventListener('blur', () => { focusKey = null; mark(null); });
      l.addEventListener('mouseenter', () => { focusKey = l.dataset.key; });
      l.addEventListener('mouseleave', () => { focusKey = null; });
      l.addEventListener('click', (e) => { e.preventDefault(); openFolder(l.dataset.key); });
    });
    $$('[data-doc]', main).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openDoc(a.dataset.doc); }));
  }
  async function openFolder(k) { Snd.play('open'); if (view3d && view3d.open) await view3d.open(k); location.hash = '#/' + k; }

  /* ---------------- writing desk ---------------- */
  async function renderDesk(type) {
    const T = TYPES[type]; const w = getWork(type); const docs = await S.listDocuments(type);
    main.innerHTML = `<div class="wrap desk">
      <aside class="side">
        <div class="view3d">${has3D ? '<canvas id="folder3d" aria-hidden="true"></canvas>' : `<div class="flat" aria-hidden="true"><span data-sec="${type}"></span></div>`}</div>
        <div class="side-head"><span class="kicker"><i></i>${esc(T.label)}</span><p><span id="filedcount">${plural(docs.length, 'version', 'versions')} filed</span> · <span id="saved">${Object.keys(w.answers).length ? 'Draft saved on this device' : 'New draft'}</span></p></div>
        ${has3D ? '<p class="drag-hint">Drag the folder to turn it.</p>' : ''}
        <ol class="steps" aria-label="Steps"></ol>
      </aside>
      <article class="page" id="page" aria-live="polite"></article></div>`;
    if (has3D) {
      view3d = D3.single($('#folder3d'), { key: type, ...SEC[type], label: T.short, sub: plural(docs.length, 'version', 'versions'), sheets: docs.length + 1, motion: () => motion, tabX: type === 'bio' ? 0.16 : 0.69 });
      view3d.setTheme(html.dataset.theme === 'dark');
    }
    renderSteps(type); await renderPage(type);
  }

  function renderSteps(type) {
    const T = TYPES[type]; const w = getWork(type); const box = $('.steps', main);
    box.innerHTML = T.steps.map((s, i) => `<li><button type="button" data-i="${i}" class="${i < w.step ? 'done' : ''}" ${i === w.step ? 'aria-current="step"' : ''}><span class="dot">${i < w.step ? '✓' : i + 1}</span>${s.tab}</button></li>`).join('');
    $$('button', box).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.i)));
  }

  function fieldHTML(f, a) {
    const v = a[f.k] ?? '';
    const opt = f.opt ? '<span class="opt">Optional</span>' : '';
    const help = f.help ? `<p class="help">${f.help}</p>` : '';
    const ex = f.example ? `<p class="example"><b>Example:</b> ${esc(f.example)} <span>(made up, not added)</span></p>` : '';
    if (f.type === 'chips') {
      const opts = f.options.map((o) => (Array.isArray(o) ? o : [o, o]));
      return `<div class="field" role="group" aria-labelledby="l-${f.k}"><span class="lab" id="l-${f.k}">${f.label}${opt}</span>${help}<div class="chips">${opts.map(([val, txt]) => `<button type="button" class="chip" data-k="${f.k}" data-v="${esc(val)}" aria-pressed="${v === val}">${txt}</button>`).join('')}</div></div>`;
    }
    if (f.type === 'seg') {
      const cur = v || f.def;
      return `<div class="field" role="group" aria-labelledby="l-${f.k}"><span class="lab" id="l-${f.k}">${f.label}</span><div class="seg">${f.options.map(([val, txt]) => `<button type="button" data-k="${f.k}" data-v="${val}" aria-pressed="${cur === val}">${txt}</button>`).join('')}</div></div>`;
    }
    if (f.type === 'number') {
      return `<div class="field"><span class="lab"><label for="f-${f.k}">${f.label}</label>${opt}</span><div class="chips">${f.presets.map((p) => `<button type="button" class="chip small" data-k="${f.k}" data-v="${p}" aria-pressed="${String(v) === String(p)}">${p}</button>`).join('')}<input type="number" min="10" max="2000" inputmode="numeric" id="f-${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="Other" style="width:96px;height:34px;padding:0 12px;border-radius:999px;font:500 14px var(--f-ui)"></div></div>`;
    }
    const tag = f.type === 'area' ? `<textarea id="f-${f.k}" data-k="${f.k}" rows="3" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>` : `<input type="text" id="f-${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}" autocomplete="off">`;
    return `<div class="field"><span class="lab"><label for="f-${f.k}">${f.label}</label>${opt}</span>${help}${tag}${ex}</div>`;
  }

  async function renderPage(type, focusKey) {
    const T = TYPES[type]; const w = getWork(type); const step = T.steps[w.step]; const page = $('#page'); const a = w.answers; const n = T.steps.length;
    const count = `<p class="kicker">Step ${w.step + 1} of ${n}</p>`;
    if (step.key !== 'draft') {
      const rows = step.fields.filter((f) => f.row || !f.when || f.when(a)).map((f) => (f.row ? `<div class="two">${f.row.map((g) => fieldHTML(g, a)).join('')}</div>` : fieldHTML(f, a))).join('');
      page.innerHTML = `${count}<h1 tabindex="-1">${step.q}</h1><p class="lead">${step.lead}</p><div class="fields">${rows}</div>
        <div class="pfoot">${w.step > 0 ? '<button type="button" class="btn btn-quiet" data-nav="-1">Back</button>' : '<span></span>'}<div class="right"><button type="button" class="btn btn-primary" data-nav="1">${w.step === n - 2 ? 'See the draft' : 'Continue'}</button></div></div>`;
      bindFields(type, page);
    } else {
      await renderDraft(type, page, count);
    }
    $$('[data-nav]', page).forEach((b) => b.addEventListener('click', () => turnTo(type, w.step + +b.dataset.nav)));
    if (focusKey) { const el = $(`[data-k="${focusKey}"]`, page); if (el) el.focus(); }
  }

  function bindFields(type, page) {
    const w = getWork(type); const a = w.answers;
    const changed = (k, v) => { a[k] = v; autosave(type); view3d && view3d.setSheets && view3d.setSheets(Math.min(7, 1 + Math.ceil(answered(type) / 2))); };
    $$('input[data-k], textarea[data-k]', page).forEach((el) => {
      el.addEventListener('input', () => { changed(el.dataset.k, el.value.trim() ? el.value : ''); if (el.dataset.k === 'limit') syncPressed(page, 'limit', el.value); });
      el.addEventListener('focus', () => view3d && view3d.peek && view3d.peek(true));
      el.addEventListener('blur', () => view3d && view3d.peek && view3d.peek(false));
    });
    $$('textarea', page).forEach(autoGrow);
    $$('[data-v]', page).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k; const v = b.dataset.v; const same = String(a[k]) === v && !b.closest('.seg');
      changed(k, same ? '' : v); Snd.play('tick');
      if (k === 'limit') { const inp = $('#f-limit', page); if (inp) inp.value = same ? '' : v; }
      if (k === 'person') renderPage(type); else syncPressed(page, k, same ? '' : v);
    }));
  }
  function syncPressed(page, k, v) { $$(`[data-k="${k}"][data-v]`, page).forEach((b) => b.setAttribute('aria-pressed', String(String(v) === b.dataset.v))); }
  function autoGrow(t) { const f = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }; t.addEventListener('input', f); requestAnimationFrame(f); }

  async function turnTo(type, i, focusKey) {
    const T = TYPES[type]; const w = getWork(type);
    if (i < 0 || i >= T.steps.length) return;
    if (i === w.step) { if (focusKey) renderPage(type, focusKey); return; }
    const page = $('#page'); const fwd = i > w.step;
    await anim(page, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: `perspective(1200px) rotateY(${fwd ? -8 : 8}deg) translateX(${fwd ? -24 : 24}px)` }], { duration: 220, easing: 'ease-in' });
    w.step = i; autosave(type); Snd.play('turn');
    await renderPage(type, focusKey); renderSteps(type);
    if (innerWidth <= 960) window.scrollTo({ top: 0 });
    await anim(page, [{ opacity: 0, transform: `perspective(1200px) rotateY(${fwd ? 8 : -8}deg) translateX(${fwd ? 24 : -24}px)` }, { opacity: 1, transform: 'none' }], { duration: 420, easing: ease });
    page.getAnimations().forEach((x) => x.cancel());
    if (!focusKey) { const h = $('h1', page); if (h) h.focus({ preventScroll: true }); }
  }

  /* ---------------- draft ---------------- */
  const sig = (a) => JSON.stringify(a);
  async function renderDraft(type, page, count) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers;
    const missing = T.required.filter((k) => !L.clean(a[k]));
    if (missing.length) {
      const labels = { name: 'Your name', role: 'Your practice', subjects: 'Subjects' };
      page.innerHTML = `${count}<h1 tabindex="-1">A couple of answers first</h1><p class="lead">The draft needs these before it can start. Everything else is optional.</p>
        <div class="chips" style="margin-top:32px">${missing.map((k) => { const s = T.notes.find((x) => x[0] === k); return `<button class="btn btn-quiet" data-goto="${s ? s[2] : 0}" data-k="${k}">${labels[k] || k}</button>`; }).join('')}</div>`;
      $$('[data-goto]', page).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.goto, b.dataset.k)));
      return;
    }
    if (!w.draft || (!w.draft.edited && w.draft.basis !== sig(a))) {
      page.innerHTML = `${count}<h1 tabindex="-1">Writing from your answers…</h1>`;
      const r = await S.generate(type, a); w.draft = { text: r.text, edited: false, basis: sig(a) }; w.result = r; autosave(type);
    } else if (!w.result) { w.result = L.compose(a, type); }
    const stale = w.draft.edited && w.draft.basis !== sig(a); const limit = Number(a.limit) || 0; const r = w.result;
    const used = new Set(r.used); const facts = T.notes.filter(([k]) => used.has(k) && noteValue(k, a, type));
    page.innerHTML = `${count}<h1 tabindex="-1">Your ${T.short.toLowerCase()}</h1><p class="lead">Edit it directly. Every fact comes from your answers.</p>
      <div class="sheet-wrap"><div class="sheet">
        <div class="sheet-meta"><span>${esc(voiceLabel(a, type))}${a.use ? ' · ' + esc(a.use) : ''}</span><span class="badges">${w.draft.edited ? '<span class="badge edited">Edited by you</span>' : ''}<span class="badge" title="Prototype: template writer, not AI">Demo writer</span></span></div>
        <label for="draft" class="visually-hidden">Draft text, editable</label>
        <textarea class="draft-text" id="draft" spellcheck="true">${esc(w.draft.text)}</textarea>
      </div></div>
      <div class="meter" id="meter"><b id="wc">0</b><span id="wlab">${limit ? `of ${limit} words` : 'words'}</span><span class="bar"><i id="wbar"></i></span><span id="wstate"></span></div>
      <div id="notices"></div>
      <details class="facts"><summary>Built from ${plural(facts.length, 'answer', 'answers')}</summary><dl>${facts.map(([k, l]) => `<dt>${l}</dt><dd>${esc(noteValue(k, a, type))}</dd>`).join('')}</dl></details>
      <div class="pfoot"><div class="right" style="margin-left:0"><button class="btn btn-quiet small" id="copy">Copy</button><button class="btn btn-quiet small" id="txt">Download .txt</button></div><button class="btn btn-primary" id="file">Keep this version</button></div>
      <div id="filing"></div>`;
    const ta = $('#draft', page); autoGrow(ta); tilt($('.sheet', page), 2.5);
    function meter() {
      const words = L.count(ta.value); $('#wc', page).textContent = words; const over = limit && words > limit;
      $('#meter', page).classList.toggle('over', !!over);
      $('#wbar', page).style.width = limit ? Math.min(100, (words / limit) * 100) + '%' : '100%';
      $('#wstate', page).textContent = !limit ? '' : over ? `${words - limit} over` : 'Fits';
    }
    const notices = $('#notices', page); let h = '';
    if (stale) h += '<div class="notice warn">Your answers changed after you edited this. <button class="btn btn-text" id="rebuild">Rebuild from answers</button> or keep your text.</div>';
    if (!w.draft.edited && r.over) h += `<div class="notice warn">Your name and practice alone need ${r.words} words, more than the ${limit} you set. Raise the limit or shorten how you describe your practice.</div>`;
    else if (!w.draft.edited && r.omitted.length) h += `<div class="notice">To fit ${limit} words, whole sentences were left out: ${r.omitted.join(', ')}. <button class="btn btn-text" id="nolimit">Show the full version</button></div>`;
    notices.innerHTML = h;
    const rb = $('#rebuild', notices); if (rb) rb.addEventListener('click', () => { if (rb.dataset.armed) { w.draft = null; renderPage(type); return; } rb.dataset.armed = '1'; rb.textContent = 'Yes, replace my edits'; });
    const nl = $('#nolimit', notices); if (nl) nl.addEventListener('click', () => { a.limit = ''; w.draft = null; autosave(type); renderPage(type); });
    meter();
    ta.addEventListener('input', () => { w.draft.text = ta.value; if (!w.draft.edited) { w.draft.edited = true; $('.badges', page).insertAdjacentHTML('afterbegin', '<span class="badge edited">Edited by you</span>'); } meter(); autosave(type); });
    $('#copy', page).addEventListener('click', () => copyText(ta.value));
    $('#txt', page).addEventListener('click', () => downloadTxt(ta.value, (a.use || T.label) + '.txt'));
    $('#file', page).addEventListener('click', () => openFiling(type));
  }

  function copyText(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copied')).catch(() => toast('Copy did not work here. Select the text and copy it.')); }
  function previewFallback(text, what) { navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {}); toast(`${what} is blocked in this hosted preview. The text is copied instead.`); }
  function downloadTxt(text, name) { if (window.STUDIO_PREVIEW) return previewFallback(text, 'Downloading'); const b = new Blob([text + '\n'], { type: 'text/plain' }); const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = name.replace(/[^\w .,-]+/g, '').trim() || 'document.txt'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

  /* ---------------- filing ---------------- */
  async function openFiling(type) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers; const box = $('#filing'); if (box.innerHTML) { $('#vname').focus(); return; }
    const suggested = (a.use || 'Untitled') + (a.limit ? `, ${a.limit} words` : '');
    box.innerHTML = `<form class="file-form" aria-labelledby="file-h"><h2 id="file-h">Name this version</h2>
      <div class="field"><label for="vname">So you can find it again</label><input type="text" id="vname" value="${esc(suggested)}" required maxlength="120"></div>
      <div class="row"><button type="button" class="btn btn-quiet" id="keep">Cancel</button><button type="submit" class="btn btn-primary" id="dofile">File in ${esc(T.label)}</button></div></form>`;
    const form = $('form', box); const name = $('#vname', box);
    await anim(form, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: ease });
    name.focus(); name.select(); form.scrollIntoView({ block: 'nearest', behavior: motion ? 'smooth' : 'auto' });
    const close = () => { box.innerHTML = ''; $('#file').focus(); };
    $('#keep', box).addEventListener('click', close);
    form.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const title = name.value.trim(); if (!title) { name.focus(); return; }
      const btn = $('#dofile', box); btn.disabled = true; btn.textContent = 'Filing…';
      const words = L.count(w.draft.text); let doc;
      try { doc = await S.fileVersion({ type, title, text: w.draft.text, words, purpose: a.use || '', answers: { ...a } }); }
      catch (err) { btn.disabled = false; btn.textContent = `File in ${T.label}`; toast('Could not save on this device. Your text is still here. Copy it to keep it.'); return; }
      Snd.play('file');
      await flyToFolder();
      if (view3d && view3d.file) await view3d.file();
      w.draft = null; w.result = null; autosave(type);
      const all = await S.listDocuments(type);
      if (view3d && view3d.relabel) view3d.relabel(T.short, plural(all.length, 'version', 'versions'));
      $('#filedcount').textContent = plural(all.length, 'version', 'versions') + ' filed';
      showFiled(type, doc, all.length);
      toast(`Filed as version ${all.length}`, { label: 'Undo', run: async () => { await S.removeDocument(doc.id); w.draft = { text: doc.text, edited: true, basis: sig(w.answers) }; toast('Filing undone. Your draft is back.'); go(); } });
    });
  }
  // The paper sheet lifts off the page and drops toward the 3D folder.
  async function flyToFolder() {
    const sheet = $('.sheet', main); const target = $('.view3d', main); if (!motion || !sheet || !target || innerWidth <= 960) return;
    const sr = sheet.getBoundingClientRect(); const tr = target.getBoundingClientRect();
    const ghost = sheet.cloneNode(true); ghost.inert = true; $$('[id]', ghost).forEach((x) => x.removeAttribute('id'));
    Object.assign(ghost.style, { position: 'fixed', left: sr.left + 'px', top: sr.top + 'px', width: sr.width + 'px', height: sr.height + 'px', margin: 0, zIndex: 40, transformOrigin: '50% 50%', pointerEvents: 'none' });
    document.body.appendChild(ghost); sheet.style.visibility = 'hidden';
    const dx = tr.left + tr.width / 2 - (sr.left + sr.width / 2); const dy = tr.top + tr.height * 0.35 - (sr.top + sr.height / 2); const s = (tr.width * 0.4) / sr.width;
    await anim(ghost, [
      { transform: 'perspective(1400px) translate(0, 0)', opacity: 1 },
      { transform: `perspective(1400px) translate(${dx * 0.4}px, ${dy * 0.4 - 80}px) rotateX(18deg) rotateZ(-4deg) scale(${(1 + s) / 2})`, opacity: 1, offset: 0.45 },
      { transform: `perspective(1400px) translate(${dx}px, ${dy}px) rotateX(55deg) scale(${s})`, opacity: 0 },
    ], { duration: 820, easing: 'cubic-bezier(.65,.05,.3,1)' });
    ghost.remove();
  }

  function showFiled(type, doc, version) {
    const T = TYPES[type]; const page = $('#page');
    page.innerHTML = `<p class="kicker">Filed in ${esc(T.label)}</p><h1 tabindex="-1">${esc(doc.title)}</h1>
      <div class="facts-row"><span>Version <b>${version}</b></span><span><b>${doc.words}</b> words</span><span>${fmtDate(doc.date)}</span><span>Saved on this device</span></div>
      <div class="sheet-wrap"><div class="sheet"><p class="read">${esc(doc.text)}</p></div></div>
      <div class="pfoot"><div class="right" style="margin-left:0"><button class="btn btn-quiet small" id="copy">Copy</button><button class="btn btn-quiet small" id="txt">Download .txt</button></div><button class="btn btn-primary" id="again">Start a new version</button></div>`;
    tilt($('.sheet', page), 2.5);
    $('#copy', page).addEventListener('click', () => copyText(doc.text));
    $('#txt', page).addEventListener('click', () => downloadTxt(doc.text, doc.title + '.txt'));
    $('#again', page).addEventListener('click', () => { const w = getWork(type); w.answers = { ...(doc.answers || w.answers) }; w.draft = { text: doc.text, edited: true, basis: sig(w.answers) }; w.step = TYPES[type].steps.length - 1; autosave(type); renderSteps(type); renderPage(type); });
    anim(page, [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: ease }).then(() => page.getAnimations().forEach((x) => x.cancel()));
    $('h1', page).focus({ preventScroll: true });
  }

  /* ---------------- My files ---------------- */
  let filter = 'all'; let q = '';
  async function renderFiles() {
    const all = (await S.listDocuments()).slice().reverse();
    main.innerHTML = `<div class="wrap">
      <div class="files-top"><div><h1>My files</h1><p>${plural(all.length, 'document', 'documents')}, newest first.</p></div>
        <div class="files-tools"><div class="search"><label for="fq" class="visually-hidden">Search files</label><input id="fq" type="search" placeholder="Search titles and text" value="${esc(q)}"></div>
        <div class="chips" role="group" aria-label="Show">${[['all', 'All'], ['bio', 'Bios'], ['statement', 'Statements']].map(([v, t]) => `<button class="chip small" data-f="${v}" aria-pressed="${filter === v}">${t}</button>`).join('')}</div></div></div>
      <div class="cards" id="cards"></div>
      <div class="files-foot">${all.some((d) => d.sample) ? '<button class="btn btn-text" id="nosample">Remove the sample files</button>' : ''}</div></div>`;
    const draw = () => {
      const list = all.filter((d) => (filter === 'all' || d.type === filter) && (!q || (d.title + ' ' + d.text).toLowerCase().includes(q.toLowerCase())));
      $('#cards').innerHTML = list.map((d) => `<button class="card" data-doc="${d.id}" data-sec="${d.type}"><span class="k">${d.type === 'bio' ? 'Bio' : 'Statement'}${d.sample ? ' · Sample' : ''}</span><b>${esc(d.title)}</b><i>${esc(d.sample ? 'A sample file so you can see how filing works. Remove samples to start clean.' : d.text)}</i><span class="meta"><span>${d.words} words</span><span>${fmtDate(d.date)}</span></span></button>`).join('') || `<p class="empty">No files match${q ? ` “${esc(q)}”` : ''}.</p>`;
      $$('.card').forEach((c, i) => { c.addEventListener('click', () => openDoc(c.dataset.doc)); tilt(c, 6); anim(c, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 480, delay: i * 50, easing: ease }).then(() => c.getAnimations().forEach((x) => x.cancel())); });
    };
    draw();
    $('#fq').addEventListener('input', (e) => { q = e.target.value; draw(); });
    $$('[data-f]').forEach((b) => b.addEventListener('click', () => { filter = b.dataset.f; $$('[data-f]').forEach((c) => c.setAttribute('aria-pressed', String(c === b))); draw(); }));
    const ns = $('#nosample'); if (ns) ns.addEventListener('click', async () => { await S.removeSamples(); toast('Sample files removed'); renderFiles(); });
  }

  /* ---------------- document dialog ---------------- */
  const dlg = $('#doc-dialog');
  async function openDoc(id) {
    const d = await S.getDocument(id); if (!d) return;
    const all = await S.listDocuments(d.type); const v = all.findIndex((x) => x.id === id) + 1;
    dlg.dataset.sec = d.type;
    dlg.innerHTML = `<div class="dh"><div><p class="kicker"><i></i>${d.type === 'bio' ? 'Bio' : 'Statement'} · version ${v}${d.sample ? ' · Sample' : ''}</p><h2 id="doc-title">${esc(d.title)}</h2></div><button class="x" id="dclose" aria-label="Close">×</button></div>
      <div class="db"><div class="facts-row" style="margin-top:0"><span><b>${d.words}</b> words</span><span>${esc(d.purpose || 'No purpose set')}</span><span>${fmtDate(d.date)}</span></div>
      <p class="text">${esc(d.text)}</p>
      <div class="acts"><button class="btn btn-quiet small" id="dcopy">Copy</button><button class="btn btn-quiet small" id="dtxt">Download .txt</button><button class="btn btn-primary small" id="dopen">Open in folder</button><button class="btn btn-text" id="ddel" style="margin-left:auto">Delete</button></div></div>`;
    $('#dclose').addEventListener('click', () => dlg.close());
    $('#dcopy').addEventListener('click', () => copyText(d.text));
    $('#dtxt').addEventListener('click', () => downloadTxt(d.text, d.title + '.txt'));
    $('#dopen').addEventListener('click', async () => { dlg.close(); if (route() !== d.type) { location.hash = '#/' + d.type; await new Promise((r) => setTimeout(r, 250)); } showFiled(d.type, d, v); });
    $('#ddel').addEventListener('click', async (e) => { if (e.target.dataset.sure) { await S.removeDocument(d.id); dlg.close(); toast('Deleted ' + d.title); go(); } else { e.target.dataset.sure = '1'; e.target.textContent = 'Delete for good?'; } });
    dlg.showModal();
    anim(dlg, [{ opacity: 0, transform: 'translateY(20px) scale(.98)' }, { opacity: 1, transform: 'none' }], { duration: 360, easing: ease });
  }

  /* ---------------- toast ---------------- */
  const toastEl = $('#toast'); let toastTimer;
  function toast(msg, action) {
    clearTimeout(toastTimer); toastEl.hidden = false;
    toastEl.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${action.label}</button>` : ''}`;
    if (action) $('button', toastEl).addEventListener('click', () => { toastEl.hidden = true; action.run(); });
    anim(toastEl, [{ opacity: 0, transform: 'translate(-50%, 12px)' }, { opacity: 1, transform: 'translate(-50%, 0)' }], { duration: 260, easing: 'ease-out' });
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, action ? 8000 : 3500);
  }

  (document.fonts ? document.fonts.ready : Promise.resolve()).then(go);
})();
