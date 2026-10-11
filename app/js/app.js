/* My Studio v2: view layer. Presentation and interaction only.
   Persistence and generation go through window.StudioService; writing rules live in StudioLogic. */
(function () {
  'use strict';
  const S = window.StudioService; const L = window.StudioLogic; const Snd = window.StudioSound;
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const main = $('#main');
  const html = document.documentElement;

  /* ---------------- preferences ---------------- */
  const prefs = S.prefs();
  const sysDark = window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches;
  const sysCalm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let motion = prefs.motion !== false && !sysCalm;
  function setTheme(t) {
    html.dataset.theme = t;
    $$('[data-theme-set]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.themeSet === t)));
    $('#desk-state').textContent = t === 'dark' ? 'Ink' : 'Paper';
    const tc = $('meta[name="theme-color"]'); if (tc) tc.content = t === 'dark' ? '#2A0A12' : '#F9ECE5';
  }
  setTheme(prefs.theme || (sysDark ? 'dark' : 'light'));
  $$('[data-theme-set]').forEach((b) => b.addEventListener('click', () => { setTheme(b.dataset.themeSet); S.setPref('theme', b.dataset.themeSet); }));
  function setMotion(on) { motion = on; html.classList.toggle('no-motion', !on); $('#motion-on').checked = on; }
  setMotion(motion);
  $('#motion-on').addEventListener('change', (e) => { setMotion(e.target.checked); S.setPref('motion', motion); });
  // sound
  function setSound(on, vol) { Snd.set(on, vol); $('#sound-on').checked = on; }
  setSound(!!prefs.sound, prefs.volume); $('#sound-vol').value = Math.round((prefs.volume ?? 0.6) * 100);
  $('#sound-on').addEventListener('change', (e) => { setSound(e.target.checked, $('#sound-vol').value / 100); S.setPref('sound', e.target.checked); if (e.target.checked) Snd.play('tick'); });
  $('#sound-vol').addEventListener('input', (e) => { Snd.set($('#sound-on').checked, e.target.value / 100); S.setPref('volume', e.target.value / 100); });
  $('#sound-test').addEventListener('click', () => Snd.test());
  const deskBtn = $('#desk-btn'); const deskPanel = $('#desk-panel');
  const closeDesk = () => { deskPanel.hidden = true; deskBtn.setAttribute('aria-expanded', 'false'); };
  deskBtn.addEventListener('click', () => { const open = deskPanel.hidden; deskPanel.hidden = !open; deskBtn.setAttribute('aria-expanded', String(open)); });
  document.addEventListener('click', (e) => { if (!deskPanel.hidden && !e.target.closest('.pop')) closeDesk(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !deskPanel.hidden) { closeDesk(); deskBtn.focus(); } });

  const anim = (el, kf, o) => (motion && el && el.animate ? el.animate(kf, { fill: 'both', ...o }).finished.catch(() => {}) : Promise.resolve());
  const wait = (ms) => new Promise((r) => setTimeout(r, motion ? ms : 0));

  /* ---------------- content model ---------------- */
  const TINT = { ballet: '#FFD6DE', lemon: '#FFF3B2', pistachio: '#D0D996', blue: '#B7D9FF', rose: '#FFA1C2' };
  const SLIP_TINTS = ['#FFF3B2', '#FFD6DE', '#E6EBC4', '#D9EAFB', '#FBF6EF']; // derived pale tints (provisional)
  const USES = ['Website', 'Gallery or exhibition', 'Application', 'Press', 'Social profile', 'Other'];
  const TYPES = {
    bio: {
      label: 'Artist bio', short: 'Bio', idx: '01', titleHTML: 'Artist <em>bio</em>',
      line: 'Who you are, where you work and what you make.',
      intro: 'Each page adds to these notes. Nothing is drafted until the last page, and nothing is added that you did not write.',
      theme: { spine: ['#3A0614', '#440818'], btn: '#AA0003', btnInk: '#FFD6DE', cv: '#AA0003', cvInk: '#FFD6DE', cvAccent: '#FFF3B2', back: ['#770409', '#5D060C'], front: ['#BA2F30', '#AA0003', '#900206'], edge: '#5D060C', ink: '#FFD6DE', sub: '#FFF3B2', rim: '#FFA1C2', tabInk: '#FFD6DE', pocket: ['#BA2F30', '#900206'] },
      steps: [
        { key: 'purpose', tab: 'Purpose', tint: TINT.ballet, q: 'What is this bio <em>for</em>?', fields: [
          { k: 'use', type: 'chips', label: 'Where will it be used?', help: 'This sets the tone and what to leave out. It stays with this version.', options: USES },
          { row: [{ k: 'limit', type: 'number', label: 'Word maximum', opt: true, presets: [50, 100, 150, 250] }, { k: 'person', type: 'seg', label: 'Written in', options: [['third', 'Third person'], ['first', 'First person']], def: 'third' }] },
          { k: 'pronouns', type: 'chips', label: 'Pronouns', when: (a) => (a.person || 'third') === 'third', options: [['she', 'she/her'], ['he', 'he/him'], ['they', 'they/them'], ['name', 'Name only']] },
        ] },
        { key: 'practice', tab: 'Practice', tint: TINT.lemon, q: 'How do you <em>describe</em> what you do?', fields: [
          { k: 'name', type: 'text', label: 'Name as it should appear', required: true, ph: 'Your name' },
          { k: 'role', type: 'text', label: 'Your practice in a few words', required: true, ph: 'e.g. textile artist', help: 'Plain words are best.', example: '“Printmaker working with found paper.”' },
          { k: 'location', type: 'text', label: 'Where you live or work', opt: true, ph: 'City, region or country' },
        ] },
        { key: 'work', tab: 'The work', tint: TINT.pistachio, q: 'What does the work keep <em>returning</em> to?', fields: [
          { k: 'subjects', type: 'text', label: 'Subjects or questions', ph: 'Separate with commas', example: '“tides, borrowed recipes, my street at night”' },
          { k: 'materials', type: 'text', label: 'Materials and process', ph: 'e.g. natural dye, large woven hangings' },
          { k: 'detail', type: 'area', label: 'One specific detail', help: 'Something a viewer would not know from a photo. Written as you type it.' },
        ] },
        { key: 'background', tab: 'Background', tint: TINT.blue, q: 'What belongs in <em>this</em> version?', fields: [
          { k: 'background', type: 'area', label: 'Training, shows or other background', opt: true, help: 'No formal training or exhibitions? Leave this blank. The bio will focus on the work.' },
          { row: [{ k: 'series', type: 'text', label: 'Current series', opt: true, ph: 'Title' }, { k: 'seriesLine', type: 'text', label: 'In one line', opt: true, ph: 'What it is' }] },
        ] },
        { key: 'images', tab: 'Images', tint: TINT.rose, q: 'Show the <em>work</em>.', fields: [{ k: 'images', type: 'images', label: 'Images of your work', opt: true, help: 'Up to 8. They appear on your press page and post with the captions you write.' }] },
        { key: 'draft', tab: 'Outcome', tint: '#FAD2E1' },
      ],
      notes: [['use', 'For', 0], ['limit', 'Length', 0], ['person', 'Voice', 0], ['name', 'Name', 1], ['role', 'Practice', 1], ['location', 'Place', 1], ['subjects', 'Subjects', 2], ['materials', 'Materials', 2], ['detail', 'Detail', 2], ['background', 'Background', 3], ['series', 'Series', 3], ['images', 'Images', 4]],
      required: ['name', 'role'],
    },
    statement: {
      label: 'Artist statement', short: 'Statement', idx: '02', titleHTML: 'Artist <em>statement</em>',
      line: 'The work itself: subjects, materials, process and why.',
      intro: 'A statement is about the work, not your CV. Notes and fragments are fine.',
      theme: { cv: '#025054', cvInk: '#F9ECE5', cvAccent: '#D0D996', back: ['#02464A', '#01363A'], front: ['#0B6468', '#025054', '#02464A'], edge: '#012C2F', ink: '#F9ECE5', sub: '#D0D996', rim: '#D0D996', tabInk: '#F9ECE5', pocket: ['#0B6468', '#02464A'], spine: ['#012427', '#01363A'], btn: '#025054', btnInk: '#F9ECE5' },
      steps: [
        { key: 'purpose', tab: 'Purpose', tint: TINT.ballet, q: 'What is this statement <em>for</em>?', fields: [
          { k: 'use', type: 'chips', label: 'Where will it be used?', options: USES },
          { row: [{ k: 'limit', type: 'number', label: 'Word maximum', opt: true, presets: [100, 150, 300, 500] }, { k: 'person', type: 'seg', label: 'Written in', options: [['first', 'First person'], ['third', 'Third person']], def: 'first' }] },
          { k: 'name', type: 'text', label: 'Your name', opt: true, help: 'Only used if you write in third person.', when: (a) => a.person === 'third' },
          { k: 'pronouns', type: 'chips', label: 'Pronouns', when: (a) => a.person === 'third', options: [['she', 'she/her'], ['he', 'he/him'], ['they', 'they/them'], ['name', 'Name only']] },
        ] },
        { key: 'work', tab: 'The work', tint: TINT.lemon, q: 'What does your work <em>explore</em>?', fields: [
          { k: 'subjects', type: 'text', label: 'Subjects', required: true, ph: 'Separate with commas', example: '“weather, inherited furniture, waiting rooms”' },
          { k: 'question', type: 'area', label: 'A question you keep asking', opt: true, help: 'Write it as a sentence.' },
        ] },
        { key: 'process', tab: 'Process', tint: TINT.pistachio, q: 'How do you <em>make</em> it?', fields: [
          { k: 'materials', type: 'text', label: 'Materials and process', ph: 'e.g. oil on unstretched linen' },
          { k: 'detail', type: 'area', label: 'One specific detail of the process', help: 'Written as you type it.' },
        ] },
        { key: 'why', tab: 'Why', tint: TINT.blue, q: 'Why do you make it <em>this way</em>?', fields: [
          { k: 'motivation', type: 'area', label: 'What keeps bringing you back', help: 'One or two sentences in your own words.' },
          { row: [{ k: 'series', type: 'text', label: 'Current series', opt: true }, { k: 'seriesLine', type: 'text', label: 'In one line', opt: true }] },
        ] },
        { key: 'images', tab: 'Images', tint: TINT.rose, q: 'Show the <em>work</em>.', fields: [{ k: 'images', type: 'images', label: 'Images of your work', opt: true, help: 'Up to 8. They appear on your press page and post with the captions you write.' }] },
        { key: 'draft', tab: 'Outcome', tint: '#FAD2E1' },
      ],
      notes: [['use', 'For', 0], ['limit', 'Length', 0], ['person', 'Voice', 0], ['subjects', 'Subjects', 1], ['question', 'Question', 1], ['materials', 'Materials', 2], ['detail', 'Detail', 2], ['motivation', 'Why', 3], ['series', 'Series', 3], ['images', 'Images', 4]],
      required: ['subjects'],
    },
  };
  TYPES.files = { label: 'My files', theme: { back: ['#FEB0C9', '#FCCAD5'], front: ['#FBDDE8', '#FAD2E1', '#F3C3D5'], edge: '#D4839F', ink: '#6A0620', sub: '#AA0003', rim: '#FFFFFF', tabInk: '#6A0620' } };

  /* work in progress per type (autosaved) */
  const work = {};
  function getWork(type) {
    if (!work[type]) work[type] = S.loadDraft(type) || { answers: {}, step: 0, fresh: {} };
    const w = work[type]; w.fresh = w.fresh || {}; w.images = w.images || []; w.drafts = w.drafts || {}; w.variant = w.variant || 'full'; w.layout = w.layout || 'text';
    if (w.draft) { w.drafts.full = w.draft; delete w.draft; }
    if (w.step >= TYPES[type].steps.length) w.step = TYPES[type].steps.length - 1;
    return work[type];
  }
  let saveTimer;
  function autosave(type) { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const w = getWork(type); S.saveDraft(type, { answers: w.answers, step: w.step, drafts: w.drafts, variant: w.variant, layout: w.layout, images: w.images }); const s = $('.saved-state'); if (s) s.textContent = 'Saved on this device · just now'; }, 400); }

  const fmtDate = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split('-'); return `${d}.${m}.${y}`; };
  const voiceLabel = (a, type) => { const p = a.person || (type === 'statement' ? 'first' : 'third'); if (p === 'first') return 'First person'; const pr = { she: 'she/her', he: 'he/him', they: 'they/them', name: 'name only' }[a.pronouns]; return 'Third person' + (pr ? ', ' + pr : ''); };
  function noteValue(k, a, type) {
    if (k === 'limit') return a.limit ? `Up to ${a.limit} words` : '';
    if (k === 'person') return voiceLabel(a, type);
    if (k === 'series') return a.series ? a.series + (a.seriesLine ? ': ' + a.seriesLine : '') : '';
    if (k === 'images') { const n = getWork(type).images.length; return n ? `${n} ${n === 1 ? 'image' : 'images'}` : ''; }
    return a[k] || '';
  }

  /* ---------------- folder construction (SVG) ---------------- */
  const W = 392, H = 344, TH = 34, FT = 118;
  function backPath(w, h, tx, tw, th, r = 14) { const s = 18; return `M0 ${th + r} Q0 ${th} ${r} ${th} L${tx - s} ${th} C${tx - 6} ${th} ${tx - 2} 0 ${tx + 12} 0 L${tx + tw - 12} 0 C${tx + tw + 2} 0 ${tx + tw + 6} ${th} ${tx + tw + s} ${th} L${w - r} ${th} Q${w} ${th} ${w} ${th + r} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} Z`; }
  function frontPath(w, h, cx, cw, d, r = 14, rt = 5) { return `M0 ${rt} Q0 0 ${rt} 0 L${cx} 0 C${cx + cw * 0.28} 0 ${cx + cw * 0.22} ${d} ${cx + cw / 2} ${d} C${cx + cw * 0.78} ${d} ${cx + cw * 0.72} 0 ${cx + cw} 0 L${w - rt} 0 Q${w} 0 ${w} ${rt} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} Z`; }
  const pct = (v, of) => (v / of * 100).toFixed(3) + '%';
  const CLIP = '<svg class="clip" viewBox="0 0 18 52" aria-hidden="true"><defs><linearGradient id="wire" x1="0" x2="1"><stop offset="0" stop-color="#8E8E92"/><stop offset=".45" stop-color="#F2F2F4"/><stop offset="1" stop-color="#77777C"/></linearGradient></defs><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="rgba(42,10,18,.25)" stroke-width="2.4" transform="translate(.8 1.2)"/><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="url(#wire)" stroke-width="1.6" stroke-linecap="round"/></svg>';

  function folderHTML(type, docs, opts = {}) {
    const T = TYPES[type]; const th = T.theme; const id = 'f' + type;
    const tx = { bio: 44, statement: 132, files: 236 }[type]; const tw = type === 'statement' ? 150 : 132;
    const fh = H - FT; const cx = W - 150, cw = 96;
    const n = Math.max(1, Math.min(docs.length, 4)); const shown = docs.slice(-n);
    let sheets = '';
    for (let i = 0; i < n; i++) {
      const d = shown[i]; const inset = 16 + i * 2; const top = TH + 22 + i * 7; const rot = [-0.9, 0.5, -0.35, 0.2][i]; const dx = [3, -2, 1, 0][i];
      const tint = d ? SLIP_TINTS[(docs.indexOf(d)) % SLIP_TINTS.length] : '#FBF6EF';
      const tag = d ? (type === 'files' ? (d.type === 'bio' ? 'Bio' : 'Stmt') : 'V' + (docs.indexOf(d) + 1)) : '';
      sheets += `<div class="sheet" style="--r:${rot}deg;left:${pct(inset + dx, W)};right:${pct(inset - dx, W)};top:${pct(top, H)};bottom:3%;background-color:${tint};transform:rotate(${rot}deg)">${d ? `<span class="vt" style="left:${24 + i * 70}px">${tag}</span>` : ''}<span class="margin"></span>${i === n - 1 ? `<span class="st">${d ? esc(d.title) + ' · ' + d.words + ' words' : 'Blank page'}</span>` : ''}</div>`;
    }
    const last = docs[docs.length - 1];
    const grainPat = `<pattern id="g${id}" width="192" height="192" patternUnits="userSpaceOnUse"><image href="assets/grain.png" width="192" height="192"/></pattern>`;
    const back = backPath(W, H, tx, tw, TH); const front = frontPath(W, fh, cx, cw, 15);
    const label = type === 'files' ? 'My files' : T.short;
    return `
      <span class="shadow"></span>
      <svg viewBox="0 0 ${W} ${H + 4}" aria-hidden="true" preserveAspectRatio="none">
        <defs>${grainPat}<linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${th.back[0]}"/><stop offset="1" stop-color="${th.back[1]}"/></linearGradient></defs>
        <path class="ring" d="${backPath(W, H + 3, tx, tw, TH)}" fill="none" stroke="#FFA1C2" stroke-width="10" stroke-linejoin="round"/>
        <path d="${back}" fill="url(#b${id})"/><path d="${back}" fill="url(#g${id})" opacity=".55" style="mix-blend-mode:overlay"/>
        <path d="${back}" fill="none" stroke="${th.rim}" stroke-opacity=".35"/>
      </svg>
      <span class="tablabel" style="left:${pct(tx + 10, W)};width:${pct(tw - 20, W)};color:${th.tabInk}">${type === 'files' ? '03' : T.idx} ${label}</span>
      <div class="sheets" style="inset:0">${sheets}</div>
      <div class="front" style="top:${pct(FT, H)}">
        <svg viewBox="0 0 ${W} ${fh + 3}" preserveAspectRatio="none" aria-hidden="true" style="top:3px"><path d="${front}" fill="${th.edge}"/></svg>
        <svg viewBox="0 0 ${W} ${fh}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fr${id}" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${th.front[0]}"/><stop offset=".55" stop-color="${th.front[1]}"/><stop offset="1" stop-color="${th.front[2]}"/></linearGradient></defs>
          <path d="${front}" fill="url(#fr${id})"/><path d="${front}" fill="url(#g${id})" opacity=".55" style="mix-blend-mode:overlay"/>
          <path d="M6 1.5 L${cx} 1.5 M${cx + cw} 1.5 L${W - 6} 1.5" stroke="${th.rim}" stroke-opacity=".55"/>
          <path d="M14 ${fh - 11} L${W - 14} ${fh - 11}" stroke="${th.ink}" stroke-opacity=".4" stroke-dasharray="5 4" stroke-linecap="round"/></svg>
        <div class="front-inner" style="color:${th.ink}">
          <span class="count" style="color:${th.sub}">${String(docs.length).padStart(2, '0')} ${docs.length === 1 ? 'version' : 'versions'} filed</span>
          <span class="ftitle">${type === 'files' ? 'My <em>files</em>' : T.titleHTML}</span>
          <span class="fline">${esc(type === 'files' ? 'Every filed document. Search, reopen and export.' : T.line)}</span>
          <span class="fmeta" style="color:${th.sub}"><span>${last ? 'Last filed ' + fmtDate(last.date) : 'Nothing filed yet'}</span><span>Open folder</span></span>
        </div>
        ${last && opts.clip !== false ? `${CLIP}<span class="clip-slip">Latest · ${type === 'files' ? (last.type === 'bio' ? 'Bio' : 'Statement') : 'V' + docs.length}<b>${esc(last.title)}</b></span>` : ''}
      </div>`;
  }

  /* ---------------- routing ---------------- */
  let current = null;
  function route() { const h = location.hash.replace(/^#\/?/, ''); return ['bio', 'statement', 'files'].includes(h) ? h : 'home'; }
  async function go() {
    const r = route();
    $$('.ix').forEach((a) => (a.dataset.route === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const from = current; current = r;
    if (r === 'home') await renderHome(from);
    else if (r === 'files') await renderFiles();
    else await renderSpread(r, from === 'home');
    if (from !== null) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', go);

  /* ---------------- home ---------------- */
  const firstName = () => { const n = L.clean(((S.loadDraft('bio') || {}).answers || {}).name || ''); return n.split(' ')[0]; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  async function renderHome() {
    const all = await S.listDocuments(); const bio = all.filter((d) => d.type === 'bio'); const st = all.filter((d) => d.type === 'statement');
    const recent = all.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    const seen = new Set(); const wall = [];
    [...['bio', 'statement'].flatMap((t) => (S.loadDraft(t) || {}).images || []), ...all.slice().reverse().flatMap((d) => d.images || [])].forEach((i) => { if (!seen.has(i.id) && wall.length < 5) { seen.add(i.id); wall.push(i); } });
    const inProgress = ['bio', 'statement'].filter((t) => { const w = S.loadDraft(t); return w && Object.values(w.answers || {}).some(Boolean); }).length;
    main.innerHTML = `
      <section class="view home">
        <div class="home-hero">
          <div>
            <p class="eyebrow">My Studio · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 class="display" style="margin-top:14px">${greeting()}${firstName() ? `, <em>${esc(firstName())}</em>.` : ', <em>artist</em>.'}</h1>
          </div>
          <div>
            <p class="lede">Open a folder to write a bio or an artist statement. Every version you file stays in its folder, ready to reopen.</p>
            <div class="stats">
              <div class="stat"><b>${String(bio.length).padStart(2, '0')}</b><span>Bios filed</span></div>
              <div class="stat"><b>${String(st.length).padStart(2, '0')}</b><span>Statements</span></div>
              <div class="stat"><b>${String(inProgress).padStart(2, '0')}</b><span>In progress</span></div>
            </div>
          </div>
        </div>
        <div class="shelf">
          <button class="folder" data-open="bio" aria-label="Open Artist bio folder, ${bio.length} versions filed">${folderHTML('bio', bio)}</button>
          <button class="folder" data-open="statement" aria-label="Open Artist statement folder, ${st.length} versions filed">${folderHTML('statement', st)}</button>
          <button class="folder" data-open="files" aria-label="Open My files, ${all.length} documents">${folderHTML('files', all)}</button>
        </div>
        <section class="wall" aria-labelledby="wall-h">
          <div class="record-head"><h2 class="h2" id="wall-h">On the <em>wall</em></h2><span class="mono" style="color:var(--on-desk-2)">Images from your bio and statement</span></div>
          <div class="wall-row">${wall.length ? wall.map((i, n) => `<figure class="polaroid" style="--r:${[-2.5, 1.8, -1.2, 2.4, -1.6, 1][n % 6]}deg"><span class="tape"></span><img data-img="${i.id}" alt="${esc(capText(i))}">${i.sample ? '<span class="sample-tag">Sample</span>' : ''}<figcaption>${esc(capText(i) || 'Untitled')}</figcaption></figure>`).join('') : [0, 1, 2].map((n) => `<button class="polaroid empty" data-addimg style="--r:${[-2, 1.5, -1][n]}deg"><span class="tape"></span><span class="ph"><span class="drop-art" aria-hidden="true"><i></i><i></i><i></i></span></span><figcaption>${n === 1 ? 'Add images of your work' : ''}</figcaption></button>`).join('')}</div>
        </section>
        <section class="record" aria-labelledby="rec-h">
          <div class="record-head"><h2 class="h2" id="rec-h">Recently <em>filed</em></h2><span class="mono" style="color:var(--on-desk-2)">Saved on this device</span></div>
          <ul class="rows">${recent.map((d) => `<li><span class="t">${esc(d.title)}${d.sample ? '<span class="chip-s">Sample</span>' : ''}</span><span class="m">${d.type === 'bio' ? 'Artist bio' : 'Statement'}</span><span class="m">${d.words} words</span><span class="m">${fmtDate(d.date)}</span><a class="go" href="#" data-doc="${d.id}">Open →</a></li>`).join('') || '<li><span class="t">Nothing filed yet.</span></li>'}</ul>
        </section>
      </section>`;
    $$('.folder', main).forEach((f, i) => {
      anim(f, [{ opacity: 0, transform: 'translateY(24px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: 80 + i * 90, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => { f.style.transform = ''; f.getAnimations().forEach((a) => a.cancel()); });
      f.addEventListener('click', async () => {
        Snd.play('open');
        $$('.sheet', f).forEach((s, j) => anim(s, [{ transform: getComputedStyle(s).transform }, { transform: `translateY(-${14 + j * 4}px) rotate(${s.style.getPropertyValue('--r')})` }], { duration: 240, easing: 'ease-out' }));
        await wait(200);
        location.hash = '#/' + f.dataset.open;
      });
    });
    $$('[data-doc]', main).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); openDoc(a.dataset.doc); }));
    $$('[data-addimg]', main).forEach((b) => b.addEventListener('click', () => { const w = getWork('bio'); w.step = TYPES.bio.steps.findIndex((x) => x.key === 'images'); autosave('bio'); location.hash = '#/bio'; }));
    hydrate(main);
    // 3D: folders lean toward the pointer
    $$('.folder', main).forEach((f) => {
      f.addEventListener('pointermove', (e) => { if (!motion || e.pointerType !== 'mouse') return; const r = f.getBoundingClientRect(); f.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'deg'); f.style.setProperty('--rx', (-(e.clientY - r.top) / r.height + 0.5) * 8 + 'deg'); });
      f.addEventListener('pointerleave', () => { f.style.removeProperty('--rx'); f.style.removeProperty('--ry'); });
    });
    $$('.polaroid:not(.empty)', main).forEach((p) => tilt(p, 8));
  }

  /* ---------------- spread ---------------- */
  async function renderSpread(type, fromHome) {
    const T = TYPES[type]; const w = getWork(type); const docs = await S.listDocuments(type); const th = T.theme;
    const cvVars = `--cv:${th.cv};--cv-ink:${th.cvInk};--cv-accent:${th.cvAccent};--spine-a:${th.spine[0]};--spine-b:${th.spine[1]};--btn:${th.btn};--btn-ink:${th.btnInk}`;
    main.innerHTML = `
      <section class="spread-view" data-type="${type}" style="--btn:${th.btn};--btn-ink:${th.btnInk}">
        <div class="crumbs"><a href="#/">← Studio</a><span class="mono saved-state">${w.answers && Object.keys(w.answers).length ? 'Saved on this device' : 'New version'}</span></div>
        <div class="spread" style="${cvVars}">
          <span class="floor"></span>
          <aside class="cover-in" aria-label="${esc(T.label)} notes" style="${cvVars}"><span class="thumb"></span><div class="cover-content"></div></aside>
          <div class="spine" aria-hidden="true"></div>
          <div class="back">
            <svg class="board" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bk" x1="0" x2="1"><stop offset="0" stop-color="${th.back[1]}"/><stop offset=".08" stop-color="${th.back[0]}"/><stop offset="1" stop-color="${th.back[1]}"/></linearGradient></defs><rect x="0" y="0" width="88.5" height="100" rx="0" fill="url(#bk)"/></svg>
            <div class="stage"><span class="stack s1"></span><span class="stack s2"></span><article class="page" aria-live="polite"></article></div>
            <div class="tabs" role="tablist" aria-label="Pages" aria-orientation="vertical"></div>
          </div>
        </div>
      </section>`;
    // board right edge sits under the tabs: size the svg rect to leave the tab column outside
    const board = $('.board rect', main); const back = $('.back', main);
    const fitBoard = () => { const bw = back.clientWidth; if (bw) board.setAttribute('width', ((bw - 44) / bw * 100).toFixed(2)); };
    fitBoard(); new ResizeObserver(fitBoard).observe(back);
    renderTabs(type); renderCover(type, docs); await renderPage(type); renderCover(type, docs);
    if (fromHome && motion && innerWidth > 860) await openFlap(type);
    else anim($('.spread', main), [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  async function openFlap(type) {
    const T = TYPES[type]; const th = T.theme; const spread = $('.spread', main); const back = $('.back', main); const cover = $('.cover-in', main);
    const sr = spread.getBoundingClientRect(); const br = back.getBoundingClientRect();
    const flap = document.createElement('div'); flap.className = 'flap';
    flap.style.cssText = `left:${br.left - sr.left}px;width:${br.width - 44}px;--cv:${th.cv};--cv-ink:${th.cvInk}`;
    flap.innerHTML = `<div class="face out"><span class="eyebrow" style="color:${th.cvAccent}">${T.idx} · ${esc(T.label)}</span><b style="margin-top:14px">${T.titleHTML.replace(/<\/?em>/g, '')}</b></div><div class="face in"></div>`;
    spread.appendChild(flap);
    const content = $('.cover-content', cover); const page = $('.page', main);
    content.style.opacity = 0; page.style.opacity = 0; cover.style.opacity = 0;
    Snd.play('open');
    await anim(flap, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], { duration: 760, easing: 'cubic-bezier(.65,.05,.25,1)' });
    cover.style.opacity = 1; flap.remove();
    page.style.opacity = '';
    anim(page, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    content.style.opacity = '';
    await anim(content, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: 80, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  function renderTabs(type) {
    const T = TYPES[type]; const w = getWork(type); const box = $('.tabs', main);
    box.innerHTML = T.steps.map((s, i) => `<button class="tab${i < w.step ? ' done' : ''}" role="tab" id="tab-${i}" aria-selected="${i === w.step}" aria-controls="page" tabindex="${i === w.step ? 0 : -1}" style="--tint:${s.tint}"><span>${String(i + 1).padStart(2, '0')} ${s.tab}</span></button>`).join('');
    $$('.tab', box).forEach((b, i) => {
      b.addEventListener('click', () => turnTo(type, i));
      b.addEventListener('keydown', (e) => {
        const k = e.key; const n = T.steps.length;
        let j = null; if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n; if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i - 1 + n) % n; if (k === 'Home') j = 0; if (k === 'End') j = n - 1;
        if (j !== null) { e.preventDefault(); $$('.tab', box)[j].focus(); }
      });
    });
  }

  function renderCover(type, docs, opts = {}) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers; const box = $('.cover-content', main); const th = T.theme;
    const onDraft = T.steps[w.step].key === 'draft';
    let card;
    if (onDraft && w.result) {
      const used = new Set(w.result.used); const labels = Object.fromEntries(T.notes.map(([k, l]) => [k, l]));
      const rows = T.notes.filter(([k]) => used.has(k) || (k === 'series' && used.has('series'))).filter(([k]) => noteValue(k, a, type));
      card = `<div class="notes-card"><div class="nc-head"><span>Facts used</span><span>${rows.length} from your notes</span></div><div class="nc-body">
        ${rows.map(([k, l, s]) => `<button class="note-row" data-step="${s}" data-k="${k}"><span class="k">${l}</span><span class="v">${esc(noteValue(k, a, type))}</span></button>`).join('')}
        ${w.result.omitted.length ? `<p style="margin-top:10px;font:italic 400 14.5px/1.4 var(--f-soft);color:var(--cocoa)">Left out to fit the limit: ${w.result.omitted.map((k) => (labels[k] || k).toLowerCase()).join(', ')}.</p>` : ''}
        ${!a.location && type === 'bio' ? '<p style="margin-top:6px;font:italic 400 14.5px/1.4 var(--f-soft);color:var(--cocoa)">No place given, so none is mentioned.</p>' : ''}</div></div>`;
    } else {
      const shown = T.notes.filter(([k]) => !(k === 'person' && !a.person && type === 'bio' && !a.use));
      const full = shown.filter(([k]) => noteValue(k, a, type)); const blank = shown.filter(([k]) => !noteValue(k, a, type));
      const rows = full.map(([k, l, s]) => `<button class="note-row${w.fresh[k] ? ' fresh' : ''}" data-step="${s}" data-k="${k}"><span class="k">${l}</span><span class="v">${esc(noteValue(k, a, type))}</span></button>`).join('');
      const blanks = blank.length ? `<div class="blanks"><span class="k">${full.length ? 'Still blank' : 'Nothing written yet'}</span><div>${blank.map(([k, l, s]) => `<button class="note-row blank" data-step="${s}" data-k="${k}">${l}</button>`).join('')}</div></div>` : '';
      card = `<div class="notes-card"><div class="nc-head"><span>Notes · in your words</span><span>${full.length} of ${T.notes.length}</span></div><div class="nc-body">${rows}${blanks}</div></div>`;
    }
    const recent = docs.slice(-3).reverse();
    const imgStep = T.steps.findIndex((s) => s.key === 'images'); const pins = w.images.slice(0, 3);
    const pinHTML = pins.length
      ? `<div class="pins">${pins.map((p, i) => `<button class="pin" data-goto="${imgStep}" aria-label="Images: ${esc(p.title || 'image ' + (i + 1))}" style="--r:${[-5, 4, -2][i]}deg;z-index:${3 - i}"><img data-img="${p.id}" alt=""><span class="tape"></span></button>`).join('')}</div>`
      : `<button class="pins pins-empty" data-goto="${imgStep}"><span class="tape"></span><span>Add images<br>of your work</span></button>`;
    box.innerHTML = `${pinHTML}
      <p class="eyebrow">${T.idx} · ${esc(T.label)} · ${String(docs.length).padStart(2, '0')} filed</p>
      <h1>${onDraft ? '<em>Review</em>' : 'Your <em>notes</em>'}</h1>
      <p class="intro">${onDraft ? 'Edit the page directly. Every fact comes from your notes.' : esc(T.intro)}</p>
      ${card}
      <div class="pocket">
        <div class="slips">${recent.map((d, i) => `<button class="slip${opts.newId === d.id ? ' new' : ''}" data-doc="${d.id}" style="bottom:${(recent.length - 1 - i) * 30 - 40}px;--r:${[-0.6, 0.4, -0.2][i]}deg;transform:rotate(${[-0.6, 0.4, -0.2][i]}deg);background-color:${SLIP_TINTS[docs.indexOf(d) % SLIP_TINTS.length]};left:${40 + i * 10}px"><b>${esc(d.title)}</b><span>${opts.newId === d.id ? 'Filed today · V' + docs.length : d.words + ' words · ' + fmtDate(d.date)}</span></button>`).join('')}</div>
        <svg viewBox="0 0 600 132" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="pk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${th.pocket[0]}"/><stop offset="1" stop-color="${th.pocket[1]}"/></linearGradient></defs><path d="M0 30 L600 4 L600 132 L0 132 Z" fill="url(#pk)"/><path d="M0 30 L600 4" stroke="${th.rim}" stroke-opacity=".5"/><path d="M0 33 L600 7" stroke="rgba(0,0,0,.35)"/><path d="M20 44 L580 20" stroke="${th.cvInk}" stroke-opacity=".3" stroke-dasharray="5 4"/></svg>
        <div class="pk-label"><span>In this folder</span><span>${docs.length ? 'Select a slip to open it' : 'Nothing filed yet'}</span></div>
      </div>`;
    $$('.note-row', box).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.step, b.dataset.k === 'images' ? null : b.dataset.k)));
    $$('[data-goto]', box).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.goto)));
    hydrate(box);
    $$('.slip', box).forEach((b) => b.addEventListener('click', () => openDoc(b.dataset.doc)));
  }

  /* ---------------- pages ---------------- */
  function fieldHTML(f, a, w) {
    if (f.type === 'images') return imagesFieldHTML(f, w);
    const v = a[f.k] ?? '';
    const lab = `<span class="lab"><span>${f.label}</span>${f.opt ? '<span class="opt">Optional</span>' : ''}</span>`;
    const help = f.help ? `<p class="help">${f.help}</p>` : '';
    const ex = f.example ? `<div class="example"><span class="mono">Fictional example · not added to your notes</span><p>${f.example}</p></div>` : '';
    if (f.type === 'chips') {
      const opts = f.options.map((o) => (Array.isArray(o) ? o : [o, o]));
      return `<div class="field" role="group" aria-label="${f.label}">${lab}${help}<div class="chips">${opts.map(([val, txt]) => `<button type="button" class="chip" data-k="${f.k}" data-v="${esc(val)}" aria-pressed="${v === val}">${txt}</button>`).join('')}</div></div>`;
    }
    if (f.type === 'seg') {
      const cur = v || f.def;
      return `<div class="field" role="group" aria-label="${f.label}">${lab}<div class="seg" style="--on-desk:var(--burgundy);--desk:var(--ballet);--pill-line:rgba(106,6,32,.3);display:flex">${f.options.map(([val, txt]) => `<button type="button" data-k="${f.k}" data-v="${val}" aria-pressed="${cur === val}" style="flex:1;height:38px">${txt}</button>`).join('')}</div></div>`;
    }
    if (f.type === 'number') {
      return `<div class="field"><label for="f-${f.k}"><span>${f.label}</span>${f.opt ? '<span class="opt">Optional</span>' : ''}</label><input type="number" min="10" max="2000" inputmode="numeric" id="f-${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="No limit"><div class="chips" style="margin-top:10px">${f.presets.map((p) => `<button type="button" class="chip" data-k="${f.k}" data-v="${p}" aria-pressed="${String(v) === String(p)}" style="height:30px;padding:0 12px;font-size:13px">${p}</button>`).join('')}</div></div>`;
    }
    const tag = f.type === 'area' ? 'textarea' : 'input';
    return `<div class="field"><label for="f-${f.k}"><span>${f.label}</span>${f.opt ? '<span class="opt">Optional</span>' : (f.required ? '<span class="opt">Needed</span>' : '')}</label>${help}${tag === 'textarea' ? `<textarea id="f-${f.k}" data-k="${f.k}" rows="3" placeholder="${esc(f.ph || '')}">${esc(v)}</textarea>` : `<input type="text" id="f-${f.k}" data-k="${f.k}" value="${esc(v)}" placeholder="${esc(f.ph || '')}" autocomplete="off">`}${ex}</div>`;
  }

  async function renderPage(type, focusKey) {
    const T = TYPES[type]; const w = getWork(type); const step = T.steps[w.step]; const page = $('.page', main); const a = w.answers;
    page.id = 'page'; page.setAttribute('role', 'tabpanel'); page.setAttribute('aria-labelledby', 'tab-' + w.step); page.style.setProperty('--tint', step.tint);
    const n = T.steps.length;
    const top = `<div class="ptop"><span class="chapter"><i></i>${String(w.step + 1).padStart(2, '0')} · ${step.tab}</span><span>Page ${w.step + 1} of ${n}</span></div>`;
    if (step.key !== 'draft') {
      const rows = step.fields.filter((f) => f.row || !f.when || f.when(a)).map((f) => (f.row ? `<div class="two">${f.row.map((g) => fieldHTML(g, a, w)).join('')}</div>` : fieldHTML(f, a, w))).join('');
      page.innerHTML = `${top}<h2 class="q" tabindex="-1">${step.q}</h2><div class="fields">${rows}</div>
        <div class="pfoot"><div>${w.step > 0 ? '<button type="button" class="btn btn-line" data-nav="-1">← Back</button>' : ''}</div><div style="display:flex;gap:14px;align-items:center">${step.fields.every((f) => f.opt || (f.row && f.row.every((g) => g.opt))) ? '<button type="button" class="btn btn-text" data-nav="1">Skip for now</button>' : ''}<button type="button" class="btn btn-primary" data-nav="1">${w.step === n - 2 ? 'See the draft' : 'Next page'} →</button></div></div>`;
      bindFields(type, page); bindImages(type, page);
    } else {
      await renderDraft(type, page, top);
    }
    $$('[data-nav]', page).forEach((b) => b.addEventListener('click', () => turnTo(type, w.step + +b.dataset.nav)));
    if (focusKey) { const el = $(`[data-k="${focusKey}"]`, page); if (el) el.focus({ preventScroll: false }); }
  }

  function bindFields(type, page) {
    const w = getWork(type); const a = w.answers;
    const changed = (k, v, rerender) => {
      a[k] = v; w.fresh[k] = true; autosave(type); renderCoverOnly(type);
      if (rerender) { const step = TYPES[type].steps[w.step]; const hasWhen = step.fields && step.fields.some((f) => f.when); if (hasWhen && (k === 'person')) renderPage(type); else syncPressed(page, k, v); }
    };
    $$('input[data-k], textarea[data-k]', page).forEach((el) => el.addEventListener('input', () => changed(el.dataset.k, el.value.trim() ? el.value : '', false)));
    $$('textarea', page).forEach(autoGrow);
    $$('[data-v]', page).forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k; const v = b.dataset.v; const same = String(a[k]) === v && !b.closest('.seg');
      changed(k, same ? '' : v, true);
      if (k === 'limit') { const inp = $('#f-limit', page); if (inp) inp.value = same ? '' : v; }
      Snd.play('tick');
    }));
  }
  function syncPressed(page, k, v) { $$(`[data-k="${k}"][data-v]`, page).forEach((b) => b.setAttribute('aria-pressed', String(String(v) === b.dataset.v))); }
  function autoGrow(t) { const f = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }; t.addEventListener('input', f); requestAnimationFrame(f); }
  let coverTimer;
  async function renderCoverOnly(type) { clearTimeout(coverTimer); coverTimer = setTimeout(async () => { const docs = await S.listDocuments(type); renderCover(type, docs); }, 120); }

  async function turnTo(type, i, focusKey) {
    const T = TYPES[type]; const w = getWork(type); if (i < 0 || i >= T.steps.length || i === w.step) { if (focusKey) renderPage(type, focusKey); return; }
    const page = $('.page', main); const stage = $('.stage', main);
    const ghost = page.cloneNode(true); ghost.removeAttribute('id'); ghost.setAttribute('aria-hidden', 'true'); ghost.inert = true; $$('[id]', ghost).forEach((n) => n.removeAttribute('id'));
    const forward = i > w.step; w.step = i; w.fresh = {}; autosave(type);
    if (motion) { ghost.style.zIndex = 4; stage.appendChild(ghost); }
    await renderPage(type, focusKey);
    renderTabs(type); renderCoverOnly(type);
    Snd.play('turn');
    if (motion) {
      ghost.style.transformOrigin = forward ? '0% 100%' : '100% 100%';
      const out = anim(ghost, [{ transform: 'none', opacity: 1 }, { transform: `translateX(${forward ? -36 : 36}px) rotate(${forward ? -2.2 : 2.2}deg)`, opacity: 0 }], { duration: 460, easing: 'cubic-bezier(.45,0,.2,1)' });
      anim(page, [{ transform: 'translateY(6px) scale(.992)', opacity: .5 }, { transform: 'none', opacity: 1 }], { duration: 520, delay: 90, easing: 'cubic-bezier(.16,1,.3,1)' });
      await out; ghost.remove();
    }
    if (!focusKey) { const h = $('.q, .page h2', page); if (h) h.focus({ preventScroll: true }); }
    page.scrollTop = 0;
    $$('.tab', main)[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  /* ---------------- images of the work ---------------- */
  const MAX_IMG = 8;
  const capText = (i) => [i.title, i.year, i.medium].map((x) => L.clean(x || '')).filter(Boolean).join(', ');
  function hydrate(root) { $$('img[data-img]', root).forEach(async (im) => { if (im.src) return; const src = await S.imageSrc(im.dataset.img); if (src) im.src = src; else im.closest('figure, .pin, .thumbimg')?.classList.add('missing'); }); }
  function imagesFieldHTML(f, w) {
    const pics = w.images.map((i, n) => `<figure class="pic" data-n="${n}">
        <div class="ph"><img data-img="${i.id}" alt="${esc(capText(i) || 'Image ' + (n + 1))}"><span class="tape"></span>${i.sample ? '<span class="sample-tag">Sample</span>' : ''}</div>
        <div class="pic-tools">${n === 0 ? '<span class="lead-tag">Lead image</span>' : '<button type="button" class="btn-text btn mk-lead">Make lead</button>'}<button type="button" class="rm" aria-label="Remove image ${n + 1}">×</button></div>
        <input type="text" data-cap="title" value="${esc(i.title || '')}" placeholder="Title" aria-label="Title of image ${n + 1}">
        <div class="cap2"><input type="text" data-cap="year" value="${esc(i.year || '')}" placeholder="Year" aria-label="Year of image ${n + 1}"><input type="text" data-cap="medium" value="${esc(i.medium || '')}" placeholder="Medium" aria-label="Medium of image ${n + 1}"></div>
      </figure>`).join('');
    const full = w.images.length >= MAX_IMG;
    return `<div class="field imgfield"><span class="lab"><span>${f.label}</span><span class="opt">Optional</span></span><p class="help">${f.help}</p>
      ${full ? '' : `<label class="drop" for="f-images"><input type="file" id="f-images" accept="image/*" multiple class="visually-hidden"><span class="drop-art" aria-hidden="true"><i></i><i></i><i></i></span><b>Drop images here or choose files</b><span class="mono">JPG, PNG or WebP · ${MAX_IMG - w.images.length} left</span></label>`}
      ${pics ? `<div class="pics">${pics}</div>` : ''}
      <p class="fine" style="margin-top:12px;color:var(--cocoa)">Captions are only what you write. Nothing is guessed from the image.${w.images.length ? '' : ' <button type="button" class="btn btn-text" id="sample-imgs">No photos to hand? Try sample images</button>'}</p></div>`;
  }
  function bindImages(type, page) {
    const w = getWork(type); const field = $('.imgfield', page); if (!field) return;
    hydrate(field);
    const refresh = (focusSel) => { autosave(type); renderPage(type).then(() => { renderCoverOnly(type); if (focusSel) { const el = $(focusSel, $('.page', main)); el && el.focus(); } }); };
    async function add(files) {
      const list = [...files].filter((f) => /^image\//.test(f.type)).slice(0, MAX_IMG - w.images.length);
      if (!list.length) { toast('Choose image files: JPG, PNG or WebP.', true); return; }
      toast(`Adding ${list.length} ${list.length === 1 ? 'image' : 'images'}…`);
      for (const f of list) { try { const r = await S.addImage(f); w.images.push({ id: r.id, title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').slice(0, 60), year: '', medium: '' }); } catch (e) { toast(e.message || 'That image could not be added.', true); } }
      Snd.play('file'); refresh();
      toast('Added. Check the titles: they start from the file names.');
    }
    const input = $('#f-images', field); const drop = $('.drop', field);
    if (input) input.addEventListener('change', () => add(input.files));
    if (drop) {
      ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
      ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
      drop.addEventListener('drop', (e) => add(e.dataTransfer.files));
    }
    $$('.pic', field).forEach((fig) => {
      const n = +fig.dataset.n;
      $$('[data-cap]', fig).forEach((inp) => inp.addEventListener('input', () => { w.images[n][inp.dataset.cap] = inp.value; autosave(type); }));
      $('.rm', fig).addEventListener('click', () => { w.images.splice(n, 1); refresh(); });
      const mk = $('.mk-lead', fig); if (mk) mk.addEventListener('click', () => { const [m] = w.images.splice(n, 1); w.images.unshift(m); Snd.play('tick'); refresh(); });
    });
    const smp = $('#sample-imgs', field);
    if (smp) smp.addEventListener('click', async () => { for (let i = 0; i < 3; i++) { const r = await S.addImage(sampleArt(i)); w.images.push({ id: r.id, title: 'Sample image ' + (i + 1), year: '', medium: 'Generated placeholder', sample: true }); } refresh(); });
  }
  // Generated placeholder artwork, clearly labelled as a sample. Never presented as the artist's work.
  function sampleArt(i) {
    const c = document.createElement('canvas'); c.width = 1200; c.height = [900, 1500, 1200][i % 3]; const g = c.getContext('2d');
    const pal = [['#AA0003', '#FFD6DE', '#FFF3B2', '#6A0620'], ['#025054', '#D0D996', '#FBF6EF', '#2A0A12'], ['#F7C3D6', '#6A0620', '#FFF3B2', '#B7D9FF']][i % 3];
    g.fillStyle = pal[2]; g.fillRect(0, 0, c.width, c.height);
    for (let y = 0, k = 0; y < c.height; k++) { const h = 10 + ((k * 37) % 46); g.fillStyle = pal[k % 4]; g.globalAlpha = 0.18 + ((k * 13) % 7) / 10; g.fillRect(0, y, c.width, h); y += h + 6; }
    g.globalAlpha = 0.92; g.fillStyle = pal[0]; g.beginPath(); g.ellipse(c.width * 0.58, c.height * 0.48, c.width * 0.26, c.height * 0.2, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = pal[3]; g.fillRect(c.width * 0.14, c.height * 0.62, c.width * 0.3, c.height * 0.08);
    g.globalAlpha = 0.08; for (let n = 0; n < 9000; n++) { g.fillStyle = n % 2 ? '#000' : '#fff'; g.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
    g.globalAlpha = 1; g.fillStyle = 'rgba(42,10,18,.75)'; g.font = '600 34px "Hanken Grotesk", sans-serif'; g.fillText('SAMPLE IMAGE', 40, c.height - 40);
    return c.toDataURL('image/jpeg', 0.85);
  }

  /* ---------------- outcome: variations and layouts ---------------- */
  const sig = (a) => JSON.stringify(a);
  const LAYOUTS = [['text', 'Text'], ['press', 'Press page'], ['post', 'Square post']];
  const nameFor = (type, a) => L.clean(a.name || ((S.loadDraft('bio') || {}).answers || {}).name || '');
  function syncDrafts(type) {
    const w = getWork(type); const a = w.answers; const basis = sig(a); const vs = L.variants(a, type);
    vs.forEach((v) => { const d = w.drafts[v.key]; if (!d || (!d.edited && d.basis !== basis)) w.drafts[v.key] = { text: v.text, edited: false, basis }; });
    if (!vs.some((v) => v.key === w.variant)) w.variant = 'full';
    w.result = vs.find((v) => v.key === w.variant); w.vs = vs;
    return vs;
  }
  async function renderDraft(type, page, top) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers;
    const missing = T.required.filter((k) => !L.clean(a[k]));
    if (missing.length) {
      const labels = { name: 'Name', role: 'Your practice', subjects: 'Subjects' };
      page.innerHTML = `${top}<h2 class="q" tabindex="-1">A few notes <em>first</em>.</h2><p class="read-text" style="font-size:18px;color:var(--cocoa)">The outcome needs these before it can start. Everything else is optional.</p>
        <div class="chips" style="margin-top:22px">${missing.map((k) => { const s = T.notes.find((n) => n[0] === k); return `<button class="btn btn-line" data-goto="${s ? s[2] : 0}" data-k="${k}">${labels[k] || k} →</button>`; }).join('')}</div>`;
      $$('[data-goto]', page).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.goto, b.dataset.k)));
      return;
    }
    if (!w.drafts.full) { page.innerHTML = `${top}<p class="mono" style="margin-top:40px;color:var(--cocoa)">Writing from your notes…</p>`; await S.generate(type, a); }
    const vs = syncDrafts(type); autosave(type);
    page.innerHTML = `${top}
      <div class="draft-head" style="margin-top:18px"><h2 class="q" tabindex="-1" style="margin:0">Your <em>outcome</em></h2><span class="badge demo" title="Prototype: template writer, not AI">Template writer · demo</span></div>
      <p class="mono" style="margin-top:10px;color:var(--cocoa)">${esc(T.label)} · ${esc(voiceLabel(a, type))}${a.use ? ' · ' + esc(a.use) : ''}</p>
      <div class="vtabs" role="tablist" aria-label="Length">${vs.map((v) => { const d = w.drafts[v.key]; return `<button role="tab" class="vtab${v.same && !d.edited ? ' same' : ''}" data-var="${v.key}" aria-selected="${v.key === w.variant}" ${v.same && !d.edited ? 'title="Your notes already fit this length"' : ''}><b>${v.label}</b><span>${L.count(d.text)} words${d.edited ? ' · edited' : v.same ? ' · fits' : ''}</span></button>`; }).join('')}</div>
      <div class="layouts"><span class="mono">See it as</span><div class="seg lay" role="group" aria-label="Layout">${LAYOUTS.map(([k, l]) => `<button type="button" data-lay="${k}" aria-pressed="${w.layout === k}">${l}</button>`).join('')}</div></div>
      <div id="outcome"></div>
      <div id="notices"></div>
      <div class="pfoot"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line" id="copy">Copy</button><button class="btn btn-line" id="txt">Download .txt</button></div><button class="btn btn-primary" id="file">File this version →</button></div>`;
    $$('.vtab', page).forEach((b) => b.addEventListener('click', () => { w.variant = b.dataset.var; Snd.play('turn'); autosave(type); renderPage(type).then(() => { renderCoverOnly(type); const t = $(`.vtab[data-var="${w.variant}"]`, main); t && t.focus(); }); }));
    $$('.vtabs [role=tab]', page).forEach((b, i, all) => b.addEventListener('keydown', (e) => { const j = e.key === 'ArrowRight' ? i + 1 : e.key === 'ArrowLeft' ? i - 1 : null; if (j !== null && all[(j + all.length) % all.length]) { e.preventDefault(); all[(j + all.length) % all.length].click(); } }));
    $$('[data-lay]', page).forEach((b) => b.addEventListener('click', () => { w.layout = b.dataset.lay; autosave(type); $$('[data-lay]', page).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); Snd.play('tick'); renderOutcome(type, page, true); }));
    $('#copy', page).addEventListener('click', () => copyText(w.drafts[w.variant].text));
    $('#txt', page).addEventListener('click', () => downloadTxt(w.drafts[w.variant].text, (a.use || T.label) + (w.variant !== 'full' ? ' ' + w.result.label : '') + '.txt'));
    $('#file', page).addEventListener('click', () => openFiling(type));
    renderOutcome(type, page);
  }

  function pressHTML(type, text, images, a, opts = {}) {
    const T = TYPES[type]; const lead = images[0]; const name = nameFor(type, a);
    const imgStep = T.steps.findIndex((s) => s.key === 'images');
    return `<article class="press${lead ? '' : ' no-img'}">
      ${lead ? `<figure class="press-lead"><img data-img="${lead.id}" alt="${esc(capText(lead))}">${lead.sample ? '<span class="sample-tag">Sample</span>' : ''}</figure>` : (opts.read ? '' : `<button class="press-empty" data-goto="${imgStep}"><span class="drop-art" aria-hidden="true"><i></i><i></i><i></i></span><b>Add images of your work</b><span class="mono">They lead the press page</span></button>`)}
      <div class="press-body">
        <p class="mono">${esc(T.label)}${a.location ? ' · ' + esc(a.location) : ''}</p>
        ${name ? `<h3>${esc(name)}</h3>` : ''}
        ${type === 'bio' && a.role ? `<p class="press-role">${esc(a.role)}</p>` : (a.series ? `<p class="press-role">${esc(a.series)}</p>` : '')}
        <p class="press-text">${esc(text)}</p>
      </div>
      ${lead && capText(lead) ? `<p class="press-cap"><span class="mono">Above</span> ${esc(capText(lead))}</p>` : ''}
      ${images.length > 1 ? `<div class="press-strip">${images.slice(1, 4).map((i) => `<figure><img data-img="${i.id}" alt="${esc(capText(i))}"><figcaption>${esc(capText(i))}</figcaption></figure>`).join('')}</div>` : ''}
    </article>`;
  }
  function postHTML(type, text, images, a) {
    const T = TYPES[type]; const lead = images[0]; const imgStep = T.steps.findIndex((s) => s.key === 'images');
    return `<div class="post-wrap"><div class="post" style="--pc:${T.theme.cv};--pi:${T.theme.cvInk};--pa:${T.theme.cvAccent}">
      <div class="post-img">${lead ? `<img data-img="${lead.id}" alt="${esc(capText(lead))}">` : `<button class="press-empty" data-goto="${imgStep}"><b>Add an image</b></button>`}</div>
      <div class="post-band"><p>${esc(text)}</p><span class="mono">${esc(nameFor(type, a) || T.label)}</span></div></div>
      <p class="fine post-note">A 1:1 layout for social posts. ${L.count(text) > 40 ? 'This text is long for a post. Try <b>Brief</b> or <b>One line</b>.' : 'The length suits a post.'}</p></div>`;
  }

  function renderOutcome(type, page, animate) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers; const box = $('#outcome', page); const d = w.drafts[w.variant]; const r = w.result;
    const limit = r.limit || 0;
    if (w.layout === 'text') {
      box.innerHTML = `<div class="sheet-text"><span class="badges">${d.edited ? '<span class="badge edited">Edited by you</span>' : ''}</span>
        <label for="draft" class="visually-hidden">${esc(r.label)} text, editable</label><textarea class="draft-text" id="draft" spellcheck="true">${esc(d.text)}</textarea></div>
        <div class="meter" id="meter"><div class="num"><b id="wc">0</b> <span>${limit ? `/ ${limit} words` : 'words'}</span></div><div class="bar"><i id="wbar" style="width:0"></i></div><span class="state" id="wstate"></span></div>`;
      const ta = $('#draft', box); autoGrow(ta);
      const meter = () => { const words = L.count(ta.value); $('#wc', box).textContent = words; const over = limit && words > limit; $('#meter', box).classList.toggle('over', !!over); $('#wbar', box).style.width = limit ? Math.min(100, (words / limit) * 100) + '%' : '100%'; $('#wstate', box).textContent = !limit ? 'No limit' : over ? `Over by ${words - limit}` : 'Fits'; const vt = $(`.vtab[data-var="${w.variant}"] span`, page); if (vt) vt.textContent = `${words} words${d.edited ? ' · edited' : ''}`; };
      meter();
      ta.addEventListener('input', () => { d.text = ta.value; if (!d.edited) { d.edited = true; $('.badges', box).innerHTML = '<span class="badge edited">Edited by you</span>'; } meter(); autosave(type); });
    } else {
      box.innerHTML = w.layout === 'press' ? pressHTML(type, d.text, w.images, a) : postHTML(type, d.text, w.images, a);
      hydrate(box);
      $$('[data-goto]', box).forEach((b) => b.addEventListener('click', () => turnTo(type, +b.dataset.goto)));
      const el = $('.press, .post', box); if (el) tilt(el);
    }
    if (animate) anim(box.firstElementChild, [{ opacity: 0, transform: 'perspective(1200px) rotateX(8deg) translateY(14px)' }, { opacity: 1, transform: 'none' }], { duration: 480, easing: 'cubic-bezier(.16,1,.3,1)' });
    // notices
    const stale = d.edited && d.basis !== sig(a); const labels = Object.fromEntries(T.notes.map(([k, l]) => [k, l.toLowerCase()]));
    let h = '';
    if (stale) h += `<div class="notice warn">Your notes changed after you edited this. <button class="btn-text btn" id="rebuild">Rebuild from notes</button> or keep your text.</div>`;
    if (!d.edited && r.over) h += `<div class="notice warn">Your name and practice alone need ${r.words} words, more than ${limit}. Raise the limit or shorten how you describe your practice.</div>`;
    else if (!d.edited && w.variant === 'line') h += `<div class="notice">One line keeps only who you are and what you do.</div>`;
    else if (!d.edited && r.omitted.length) h += `<div class="notice">To fit ${limit} words, whole sentences were left out: ${r.omitted.map((k) => labels[k] || k).join(', ')}.${w.variant === 'full' ? ' <button class="btn-text btn" id="nolimit">Show the full version</button>' : ''}</div>`;
    const notices = $('#notices', page); notices.innerHTML = h;
    const rb = $('#rebuild', notices); if (rb) rb.addEventListener('click', () => { if (rb.dataset.armed) { delete w.drafts[w.variant]; renderPage(type); return; } rb.dataset.armed = '1'; rb.textContent = 'Yes, replace my edits'; });
    const nl = $('#nolimit', notices); if (nl) nl.addEventListener('click', () => { a.limit = ''; autosave(type); renderPage(type); renderCoverOnly(type); });
  }

  /* subtle 3D tilt that follows the pointer */
  function tilt(el, max = 3) {
    el.addEventListener('pointermove', (e) => { if (!motion || e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(1200px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }

  function copyText(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copied to your clipboard')).catch(() => toast('Copy did not work here. Select the text and copy it.', true)); }
  function previewFallback(text, what) { navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {}); toast(`${what} is blocked in this hosted preview. The text is copied instead.`); }
  function downloadTxt(text, name) { if (window.STUDIO_PREVIEW) return previewFallback(text, 'Downloading'); const b = new Blob([text + '\n'], { type: 'text/plain' }); const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = name.replace(/[^\w .,-]+/g, '').trim() || 'document.txt'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

  /* ---------------- filing ---------------- */
  async function openFiling(type) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers; const docs = await S.listDocuments(type);
    const stage = $('.stage', main); if ($('.filing', stage)) return;
    const d = w.drafts[w.variant]; const words = L.count(d.text); const vlabel = w.result.label;
    const suggested = (a.use || 'Untitled') + (w.variant !== 'full' ? `, ${vlabel.toLowerCase()}` : a.limit ? `, ${a.limit} words` : '');
    const card = document.createElement('form'); card.className = 'filing'; card.setAttribute('aria-labelledby', 'file-h');
    card.innerHTML = `<svg class="clipw" viewBox="0 0 18 52" aria-hidden="true">${CLIP.replace(/<svg[^>]*>|<\/svg>/g, '')}</svg>
      <div class="fhead"><h2 id="file-h">File <em>this version</em></h2><span class="mono">V${docs.length + 1}</span></div>
      <div class="fbody">
        <div class="cells"><div><span class="k">Folder</span><div class="v">${esc(T.label)}</div></div><div><span class="k">Length</span><div class="v">${esc(vlabel)} · ${words}</div></div><div><span class="k">Images</span><div class="v">${w.images.length || 'None'}</div></div><div><span class="k">Date</span><div class="v">${fmtDate(new Date().toISOString())}</div></div></div>
        <div class="field"><label for="vname"><span>Name it so you can find it again</span></label><input type="text" id="vname" value="${esc(suggested)}" required maxlength="120"></div>
        <div class="factions"><button type="button" class="btn btn-line" id="keep">Keep editing</button><button type="submit" class="btn btn-primary" id="dofile">File in ${esc(T.label)} →</button></div>
      </div>`;
    stage.appendChild(card);
    await anim(card, [{ transform: 'translateY(60px) rotate(-.6deg)', opacity: 0 }, { transform: 'rotate(-.6deg)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    const name = $('#vname', card); name.focus(); name.select();
    const close = async () => { await anim(card, [{ transform: 'rotate(-.6deg)', opacity: 1 }, { transform: 'translateY(60px) rotate(-.6deg)', opacity: 0 }], { duration: 220, easing: 'ease-in' }); card.remove(); $('#file', main) && $('#file', main).focus(); };
    $('#keep', card).addEventListener('click', close);
    card.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); close(); } });
    card.addEventListener('submit', async (e) => {
      e.preventDefault(); const title = name.value.trim(); if (!title) { name.focus(); return; }
      const btn = $('#dofile', card); btn.disabled = true; btn.textContent = 'Filing…';
      let doc;
      try { doc = await S.fileVersion({ type, title, text: d.text, words, purpose: a.use || '', answers: { ...a }, variant: { key: w.variant, label: vlabel, layout: w.layout }, images: w.images.map((i) => ({ ...i })) }); }
      catch (err) { btn.disabled = false; btn.textContent = `File in ${T.label} →`; toast('Could not save on this device. Your text is still here; copy it to keep it.', true); return; }
      Snd.play('file');
      await flyToPocket(stage);
      card.remove();
      w.drafts = {}; w.result = null; autosave(type);
      const all = await S.listDocuments(type);
      renderCover(type, all, { newId: doc.id });
      const slip = $(`.slip[data-doc="${doc.id}"]`, main);
      if (slip) anim(slip, [{ transform: 'translateY(-60px) rotate(-3deg)', opacity: 0 }, { transform: 'rotate(-.6deg)', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' });
      showFiled(type, doc, all.length);
      toast(`Filed in ${T.label} as V${all.length} · Saved on this device`, false, { label: 'Undo', run: async () => { await S.removeDocument(doc.id); w.drafts = { [w.variant]: { text: doc.text, edited: true, basis: sig(w.answers) } }; toast('Filing undone. Your draft is back.'); renderSpread(type, false); } });
    });
  }

  async function flyToPocket(stage) {
    if (!motion) return;
    const pocket = $('.pocket', main); if (!pocket || innerWidth <= 860) return;
    const sr = stage.getBoundingClientRect(); const pr = pocket.getBoundingClientRect();
    const ghost = stage.cloneNode(true); ghost.inert = true; $$('[id]', ghost).forEach((n) => n.removeAttribute('id'));
    Object.assign(ghost.style, { position: 'fixed', left: sr.left + 'px', top: sr.top + 'px', width: sr.width + 'px', height: sr.height + 'px', right: 'auto', bottom: 'auto', zIndex: 40, transformOrigin: '0 0' });
    document.body.appendChild(ghost); $('.page', stage).style.visibility = 'hidden'; $('.filing', stage) && ($('.filing', stage).style.visibility = 'hidden');
    const s = (pr.width - 80) / sr.width; const dx = pr.left + 40 - sr.left; const dy = pr.top - 40 - sr.top;
    await anim(ghost, [{ transform: 'perspective(1600px) translate(0, 0)', opacity: 1 }, { transform: `perspective(1600px) translate(${dx * .5}px, ${dy * .3 - 40}px) scale(${(1 + s) / 2}) rotateX(14deg) rotate(-3deg)`, opacity: 1, offset: .45 }, { transform: `perspective(1600px) translate(${dx}px, ${dy}px) scale(${s}) rotateX(40deg) rotate(-1deg)`, opacity: 0 }], { duration: 820, easing: 'cubic-bezier(.65,.05,.3,1)' });
    ghost.remove(); $('.page', stage).style.visibility = '';
  }

  function showFiled(type, doc, version) {
    const T = TYPES[type]; const page = $('.page', main); const imgs = doc.images || []; const vl = doc.variant ? doc.variant.label : 'Full';
    page.innerHTML = `<div class="ptop"><span class="chapter"><i></i>V${version} · Filed</span><span>${doc.words} words</span></div>
      <h2 class="q" tabindex="-1">${esc(doc.title)}</h2>
      <div class="cells fc-cells" style="margin-top:18px"><div><span class="k">Folder</span><div class="v">${esc(T.label)}</div></div><div><span class="k">Length</span><div class="v">${esc(vl)}</div></div><div><span class="k">For</span><div class="v">${esc(doc.purpose || '—')}</div></div><div><span class="k">Filed</span><div class="v">${fmtDate(doc.date)}</div></div></div>
      ${imgs.length ? `<div style="margin-top:22px">${pressHTML(type, doc.text, imgs, doc.answers || {}, { read: true })}</div>` : `<p class="read-text">${esc(doc.text)}</p>`}
      <div style="margin-top:22px;text-align:right"><span class="stamp">Filed ${fmtDate(doc.date)} · ${new Date(doc.filedAt || Date.now()).toTimeString().slice(0, 5)}<br>Saved on this device</span></div>
      <div class="pfoot"><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-line" id="copy">Copy</button><button class="btn btn-line" id="txt">.txt</button><button class="btn btn-line" id="print">Print</button></div><button class="btn btn-dark" id="again">Edit as new version</button></div>`;
    hydrate(page); const pr = $('.press', page); if (pr) tilt(pr);
    anim($('.stamp', page), [{ opacity: 0, transform: 'rotate(-4deg) scale(1.12)' }, { opacity: 1, transform: 'rotate(-4deg) scale(1)' }], { duration: 300, delay: 300, easing: 'cubic-bezier(.2,1.4,.4,1)' });
    $('#copy', page).addEventListener('click', () => copyText(doc.text));
    $('#txt', page).addEventListener('click', () => downloadTxt(doc.text, doc.title + '.txt'));
    $('#print', page).addEventListener('click', () => printDoc(doc));
    $('#again', page).addEventListener('click', () => { const w = getWork(type); w.answers = { ...(doc.answers || w.answers) }; const key = doc.variant ? doc.variant.key : 'full'; w.variant = key; w.drafts = { [key]: { text: doc.text, edited: true, basis: sig(w.answers) } }; w.images = (doc.images || []).map((i) => ({ ...i })); w.step = TYPES[type].steps.length - 1; autosave(type); renderPage(type); renderTabs(type); renderCoverOnly(type); });
    $('.q', page).focus({ preventScroll: true });
  }
  function printDoc(doc) { if (window.STUDIO_PREVIEW) return previewFallback(doc.text, 'Printing'); const wn = window.open('', '_blank'); if (!wn) return; wn.document.write(`<title>${esc(doc.title)}</title><body style="font:19px/1.6 Georgia,serif;max-width:640px;margin:60px auto;color:#2A0A12"><p style="font:12px monospace;letter-spacing:.08em;text-transform:uppercase;color:#AA0003">${esc(doc.title)} · ${doc.words} words</p><p>${esc(doc.text)}</p></body>`); wn.document.close(); wn.focus(); wn.print(); }

  /* ---------------- My files ---------------- */
  let filter = 'all'; let q = '';
  async function renderFiles() {
    const all = (await S.listDocuments()).slice().reverse();
    main.innerHTML = `<section class="view">
      <div class="files-top"><div><p class="eyebrow">03 · Archive</p><h1 class="display" style="margin-top:12px">My <em>files</em></h1></div>
        <div style="display:grid;gap:12px;justify-items:end"><div class="search"><label for="fq" class="visually-hidden">Search files</label><input id="fq" type="search" placeholder="Search titles and text" value="${esc(q)}"></div>
        <div class="chips filter" role="group" aria-label="Filter">${[['all', 'All'], ['bio', 'Bios'], ['statement', 'Statements']].map(([v, t]) => `<button class="chip" data-f="${v}" aria-pressed="${filter === v}">${t}</button>`).join('')}</div></div></div>
      <div class="sleeves" id="sleeves"></div>
      ${all.some((d) => d.sample) ? '<p style="margin-top:36px"><button class="btn-text btn" id="nosample" style="color:var(--on-desk)">Remove sample files</button></p>' : ''}
    </section>`;
    const draw = () => {
      const list = all.filter((d) => (filter === 'all' || d.type === filter) && (!q || (d.title + ' ' + d.text).toLowerCase().includes(q.toLowerCase())));
      $('#sleeves').innerHTML = list.map((d, i) => `<button class="sleeve" data-doc="${d.id}" style="--tint:${SLIP_TINTS[i % SLIP_TINTS.length]}"><span class="card">${d.images && d.images.length ? `<span class="thumbimg"><img data-img="${d.images[0].id}" alt=""></span>` : ''}<span class="k">${d.type === 'bio' ? 'Artist bio' : 'Statement'}${d.variant && d.variant.key !== 'full' ? ' · ' + esc(d.variant.label) : ''}${d.sample ? ' · Sample' : ''}</span><b>${esc(d.title)}</b><i>${esc(d.sample ? 'Sample file for design review. Remove samples to start clean.' : d.text)}</i><span class="meta"><span>${d.words} words</span><span>${fmtDate(d.date)}</span></span></span><span class="film"></span></button>`).join('') || `<p class="empty-state">No files match${q ? ` “${esc(q)}”` : ''}.</p>`;
      hydrate($('#sleeves'));
      $$('.sleeve').forEach((s, i) => { s.addEventListener('click', () => openDoc(s.dataset.doc)); anim(s, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 420, delay: i * 50, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => s.getAnimations().forEach((x) => x.cancel())); });
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
    const bio = d.type === 'bio';
    dlg.style.setProperty('--tint', bio ? '#AA0003' : '#025054'); dlg.style.setProperty('--dh-ink', bio ? '#FFD6DE' : '#F9ECE5');
    dlg.innerHTML = `<div class="dh"><div><p class="mono" style="color:${bio ? '#FFF3B2' : '#D0D996'}">${bio ? 'Artist bio' : 'Statement'} · V${v}${d.sample ? ' · Sample' : ''}</p><h2 id="doc-title" style="margin-top:8px">${esc(d.title)}</h2></div><button class="x" id="dclose" aria-label="Close">×</button></div>
      <div class="db"><div class="cells"><div><span class="k">Words</span><div class="v">${d.words}</div></div><div><span class="k">For</span><div class="v">${esc(d.purpose || '—')}</div></div><div><span class="k">Filed</span><div class="v">${fmtDate(d.date)}</div></div><div><span class="k">Kept</span><div class="v">This device</div></div></div>
      ${d.images && d.images.length ? `<div style="margin-top:20px">${pressHTML(d.type, d.text, d.images, d.answers || {}, { read: true })}</div>` : `<p class="read-text">${esc(d.text)}</p>`}
      <div class="acts"><button class="btn btn-line" id="dcopy">Copy</button><button class="btn btn-line" id="dtxt">Download .txt</button><button class="btn btn-primary" id="dopen">Open in folder</button><button class="btn btn-text" id="ddel" style="margin-left:auto">Delete</button></div></div>`;
    $('#dclose').addEventListener('click', () => dlg.close());
    $('#dcopy').addEventListener('click', () => copyText(d.text));
    $('#dtxt').addEventListener('click', () => downloadTxt(d.text, d.title + '.txt'));
    $('#dopen').addEventListener('click', async () => { dlg.close(); if (route() !== d.type) { location.hash = '#/' + d.type; await new Promise((r) => setTimeout(r, motion ? 1500 : 60)); } showFiled(d.type, d, v); });
    $('#ddel').addEventListener('click', async (e) => { if (e.target.dataset.sure) { await S.removeDocument(d.id); dlg.close(); toast('Deleted ' + d.title); go(); } else { e.target.dataset.sure = '1'; e.target.textContent = 'Delete for good?'; } });
    hydrate(dlg); dlg.showModal();
    anim(dlg, [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  /* ---------------- toast ---------------- */
  const toastEl = $('#toast'); let toastTimer;
  function toast(msg, err, action) {
    clearTimeout(toastTimer); toastEl.className = 'toast' + (err ? ' err' : ''); toastEl.hidden = false;
    toastEl.innerHTML = `<span>${esc(msg)}</span>${action ? `<button type="button">${action.label}</button>` : ''}`;
    if (action) $('button', toastEl).addEventListener('click', () => { toastEl.hidden = true; action.run(); });
    anim(toastEl, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 260, easing: 'ease-out' });
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, action ? 9000 : 4000);
  }

  go();
})();
