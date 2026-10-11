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

  const mq = (q) => window.matchMedia && matchMedia(q).matches;
  /* ---------------- motion layer: torchlight, cursor, parallax, confetti ----------------
     All of it is decoration on top of working controls. It stops when Motion is off or reduced motion is set,
     and the cursor ring only exists on a fine pointer (not on phones). */
  const FX = (() => {
    const torch = $('#torch'); const ring = $('#cursor'); const label = ring && $('span', ring);
    const fine = mq('(pointer: fine)');
    const p = { x: innerWidth * 0.5, y: innerHeight * 0.35, tx: innerWidth * 0.5, ty: innerHeight * 0.35, cx: 0, cy: 0, last: performance.now() };
    let layers = [];
    addEventListener('pointermove', (e) => { p.tx = e.clientX; p.ty = e.clientY; p.last = performance.now(); }, { passive: true });
    addEventListener('touchstart', (e) => { const t = e.touches[0]; if (t) { p.tx = t.clientX; p.ty = t.clientY; p.last = performance.now(); } }, { passive: true });
    function frame(t) {
      const idle = t - p.last > 2400;
      // when the hand is still, the torch drifts slowly on its own
      const gx = idle ? innerWidth * (0.5 + Math.sin(t / 3200) * 0.3) : p.tx; const gy = idle ? innerHeight * (0.4 + Math.cos(t / 4100) * 0.2) : p.ty;
      const k = motion ? 0.08 : 1;
      p.x += (gx - p.x) * k; p.y += (gy - p.y) * k;
      if (torch) { torch.style.setProperty('--tx', p.x + 'px'); torch.style.setProperty('--ty', p.y + 'px'); }
      if (ring && fine && motion) { p.cx += (p.tx - p.cx) * 0.22; p.cy += (p.ty - p.cy) * 0.22; ring.style.transform = `translate(${p.cx}px, ${p.cy}px)`; }
      if (motion) { const nx = p.x / innerWidth - 0.5; const ny = p.y / innerHeight - 0.5; layers.forEach(([el, d]) => { el.style.translate = `${(-nx * d).toFixed(2)}px ${(-ny * d).toFixed(2)}px`; }); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    if (ring && fine) {
      document.addEventListener('pointerover', (e) => { const el = e.target.closest('[data-cursor], a, button, label[for], .folder, input, textarea'); ring.classList.toggle('on', !!el); const txt = el && el.dataset && el.dataset.cursor; ring.classList.toggle('label', !!txt); label.textContent = txt || ''; ring.classList.toggle('text', !!el && /INPUT|TEXTAREA/.test(el.tagName)); });
      document.addEventListener('pointerdown', () => ring.classList.add('down')); document.addEventListener('pointerup', () => ring.classList.remove('down'));
      document.documentElement.classList.add('has-ring');
    }
    return {
      // depth layers: positive numbers move against the pointer, so near things move more than far things
      parallax(list) { layers = list.filter(([el]) => el); if (!motion) layers.forEach(([el]) => { el.style.translate = ''; }); },
      confetti(n = 90, origin) {
        if (!motion) return;
        const c = document.createElement('canvas'); c.className = 'confetti'; c.width = innerWidth * devicePixelRatio; c.height = innerHeight * devicePixelRatio; document.body.appendChild(c);
        const g = c.getContext('2d'); g.scale(devicePixelRatio, devicePixelRatio);
        const cols = ['#AA0003', '#6A0620', '#FAD2E1', '#FFA1C2', '#FFF3B2', '#FFD6DE'];
        const ox = origin ? origin.x : innerWidth / 2; const oy = origin ? origin.y : innerHeight * 0.35;
        const bits = Array.from({ length: n }, () => ({ x: ox, y: oy, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 9, h: 4 + Math.random() * 6, c: cols[(Math.random() * cols.length) | 0] }));
        const t0 = performance.now();
        (function step(t) {
          g.clearRect(0, 0, innerWidth, innerHeight);
          bits.forEach((b) => { b.vy += 0.38; b.vx *= 0.985; b.x += b.vx; b.y += b.vy; b.r += b.vr; g.save(); g.translate(b.x, b.y); g.rotate(b.r); g.scale(1, Math.cos(b.r * 2)); g.fillStyle = b.c; g.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); g.restore(); });
          if (t - t0 < 2600) requestAnimationFrame(step); else c.remove();
        })(t0);
      },
    };
  })();

  /* ---------------- content model ---------------- */
  const SLIP_TINTS = ['#FFF3B2', '#FFD6DE', '#E6EBC4', '#D9EAFB', '#FBF6EF']; // derived pale tints (provisional)
  const TYPES = {
    bio: {
      label: 'Artist bio', short: 'Bio', idx: '01', titleHTML: 'Artist <em>bio</em>', line: 'Who you are, where you work and what you make.',
      theme: { cv: '#6A0620', cvInk: '#FAD2E1', cvAccent: '#FFA1C2', sheet: '#FAD2E1', spine: ['#2A0410', '#440818'], btn: '#6A0620', btnInk: '#FAD2E1', back: ['#50081A', '#3E0716'], front: ['#7E1634', '#6A0620', '#5A061C'], edge: '#3A0614', ink: '#FAD2E1', sub: '#FFA1C2', rim: '#FFA1C2', tabInk: '#FAD2E1' },
    },
    statement: {
      label: 'Artist statement', short: 'Statement', idx: '02', titleHTML: 'Artist <em>statement</em>', line: 'The work itself: subjects, materials, process and why.',
      theme: { cv: '#AA0003', cvInk: '#FFD6DE', cvAccent: '#FFD6DE', sheet: '#FFD6DE', spine: ['#4A050A', '#770409'], btn: '#AA0003', btnInk: '#FFD6DE', back: ['#8A0307', '#6E0409'], front: ['#BD2326', '#AA0003', '#930206'], edge: '#5D060C', ink: '#FFD6DE', sub: '#FFD6DE', rim: '#FFA1C2', tabInk: '#FFD6DE' },
    },
  };
  TYPES.files = { label: 'My files', titleHTML: 'My <em>files</em>', theme: { back: ['#F7B5CB', '#F2A7BF'], front: ['#FBDDE8', '#FAD2E1', '#F3C3D5'], edge: '#D4839F', ink: '#6A0620', sub: '#AA0003', rim: '#FFFFFF', tabInk: '#6A0620' } };

  /* One question per screen. "word" is the big poster word for that question. */
  const SERIES_Q = { how: 'No current series? Skip this. The bio reads fine without it.', k: 'series', word: 'now', tab: 'Now', q: 'What are you working on right now?', help: 'The title of a current series, and one line about it.', ph: 'Series title', second: { k: 'seriesLine', ph: 'In one line, what it is' }, opt: true };
  const IMAGES_Q = { how: 'Use a clear photo of one finished work as the lead. Captions are only what you write.', k: 'images', word: 'work', tab: 'Images', q: 'Show the work.', help: 'Add up to 8 images. The first one leads your page.', images: true, opt: true };
  const QS = {
    bio: [
      { k: 'name', word: 'name', tab: 'Name', q: 'What name do you exhibit under?', help: 'Curators and editors search for you by this name.', ph: 'e.g. Amara Okafor', voice: true, required: true, how: 'Open calls usually want third person (she, he or they). Your own website can use I.' },
      { k: 'role', word: 'make', tab: 'Practice', q: 'What kind of artist are you?', help: 'This is the first thing a reader needs: what will they see?', ph: 'e.g. painter and textile artist', tryList: ['painter', 'photographer', 'sculptor', 'ceramicist', 'printmaker'], how: 'Use the words you would say at an opening. One or two roles is plenty.', required: true },
      { k: 'location', word: 'where', tab: 'Place', how: 'A city is enough. Add a region or country only if the reader needs it.',  q: 'Where are you based?', help: 'A city is enough. Leave it blank if you would rather not say.', ph: 'e.g. Leeds', opt: true },
      { k: 'subjects', word: 'about', tab: 'Subjects', q: 'What does your work keep returning to?', help: 'Two or three subjects, separated with commas.', ph: 'e.g. memory, home, tides', how: 'Name what is in the work, not how it should make people feel.' },
      { k: 'materials', word: 'how', tab: 'Process', q: 'What do you make it with?', how: 'Materials first, then how you use them. Plain words beat technical ones.',  help: 'Materials and process, in your own words.', ph: 'e.g. natural dye on large woven hangings' },
      { k: 'detail', word: 'detail', tab: 'Detail', q: 'Tell us one thing a photo would not show.', how: 'Pick one thing only you would know: a rule you keep, a ritual, a place you return to.',  help: 'A habit, a rule, a place. It goes in exactly as you write it.', area: true, opt: true },
      { k: 'background', word: 'past', tab: 'Background', how: 'Choose the two that matter most for where this bio is going. You can file other versions later.',  q: 'Any training, shows or awards to mention?', help: 'No formal training is fine. The bio will focus on the work.', area: true, opt: true },
      SERIES_Q, IMAGES_Q,
    ],
    statement: [
      { k: 'subjects', word: 'about', tab: 'Subjects', q: 'What does your work explore?', help: 'Notes and fragments are fine. Separate subjects with commas.', ph: 'e.g. weather, inherited furniture', required: true },
      { k: 'question', word: 'why', tab: 'Question', how: 'The question your work keeps circling. It does not need an answer.',  q: 'What question do you keep asking?', help: 'Write it as a sentence.', area: true, opt: true },
      { k: 'materials', word: 'how', tab: 'Process', q: 'How do you make it?', help: 'Materials and process, the way you would say it in the studio.', ph: 'e.g. oil on unstretched linen' },
      { k: 'detail', word: 'detail', tab: 'Detail', q: 'What is one specific detail of the process?', help: 'It goes in exactly as you write it.', area: true, opt: true },
      { k: 'motivation', word: 'reason', tab: 'Reason', how: 'Say what keeps you making it, not what it should mean to others.',  q: 'Why do you make it this way?', help: 'One or two sentences in your own words.', area: true },
      SERIES_Q, IMAGES_Q,
    ],
  };
  // Poster colours alternate per question: light (tint ground) and dark (section ground). Same pairs every time, so each section is recognisable.
  const POSTER = { // used by the square post

    bio: { light: { bg: '#FAD2E1', ink: '#6A0620', soft: '#8A2C45', ribbon: '#AA0003', band: '#6A0620', sheet: '#FBF6EF', btn: '#6A0620', btnInk: '#FAD2E1' },
           dark: { bg: '#6A0620', ink: '#FAD2E1', soft: '#F0B9CB', ribbon: '#FFA1C2', band: '#AA0003', sheet: '#FAD2E1', btn: '#FAD2E1', btnInk: '#6A0620' } },
    statement: { light: { bg: '#FFD6DE', ink: '#AA0003' }, dark: { bg: '#AA0003', ink: '#FFD6DE', ribbon: '#FFA1C2' } },
  };
  const VOICES = [['she', 'She'], ['he', 'He'], ['they', 'They'], ['first', 'I (first person)']];

  /* work in progress per type (autosaved) */
  const work = {};
  function getWork(type) {
    if (!work[type]) work[type] = S.loadDraft(type) || { answers: {}, step: 0 };
    const w = work[type]; w.images = w.images || []; w.drafts = w.drafts || {}; w.variant = w.variant || 'full';
    if (w.draft) { w.drafts.full = w.draft; delete w.draft; }
    if (!(w.step >= 0) || w.step > QS[type].length) w.step = 0;
    return w;
  }
  let saveTimer;
  function autosave(type) { clearTimeout(saveTimer); saveTimer = setTimeout(() => { const w = getWork(type); S.saveDraft(type, { answers: w.answers, step: w.step, drafts: w.drafts, variant: w.variant, images: w.images }); }, 400); }

  const fmtDate = (iso) => { const [y, m, d] = String(iso).slice(0, 10).split('-'); return `${d}.${m}.${y}`; };
  const voiceKey = (a, type) => (a.person || (type === 'statement' ? 'first' : 'third')) === 'first' ? 'first' : (a.pronouns || '');

  /* ---------------- folder construction (SVG) ---------------- */
  const W = 392, H = 344, TH = 34, FT = 118;
  function backPath(w, h, tx, tw, th, r = 14) { const s = 18; return `M0 ${th + r} Q0 ${th} ${r} ${th} L${tx - s} ${th} C${tx - 6} ${th} ${tx - 2} 0 ${tx + 12} 0 L${tx + tw - 12} 0 C${tx + tw + 2} 0 ${tx + tw + 6} ${th} ${tx + tw + s} ${th} L${w - r} ${th} Q${w} ${th} ${w} ${th + r} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} Z`; }
  function frontPath(w, h, cx, cw, d, r = 14, rt = 5) { return `M0 ${rt} Q0 0 ${rt} 0 L${cx} 0 C${cx + cw * 0.28} 0 ${cx + cw * 0.22} ${d} ${cx + cw / 2} ${d} C${cx + cw * 0.78} ${d} ${cx + cw * 0.72} 0 ${cx + cw} 0 L${w - rt} 0 Q${w} 0 ${w} ${rt} L${w} ${h - r} Q${w} ${h} ${w - r} ${h} L${r} ${h} Q0 ${h} 0 ${h - r} Z`; }
  const pct = (v, of) => (v / of * 100).toFixed(3) + '%';
  const CLIP = '<svg class="clip" viewBox="0 0 18 52" aria-hidden="true"><defs><linearGradient id="wire" x1="0" x2="1"><stop offset="0" stop-color="#8E8E92"/><stop offset=".45" stop-color="#F2F2F4"/><stop offset="1" stop-color="#77777C"/></linearGradient></defs><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="rgba(42,10,18,.25)" stroke-width="2.4" transform="translate(.8 1.2)"/><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="url(#wire)" stroke-width="1.6" stroke-linecap="round"/></svg>';

  // A folder on the shelf: the artist's own images peek out like prints; the front carries one title and one count.
  function folderHTML(type, docs, opts = {}) {
    const T = TYPES[type]; const th = T.theme; const id = 'f' + type;
    const tx = { bio: 44, statement: 132, files: 236 }[type]; const tw = type === 'statement' ? 150 : 132;
    const fh = H - FT; const cx = W - 150, cw = 96;
    const imgs = (opts.images || []).slice(0, 3);
    const PAPERS = ['#FBF6EF', '#FFD6DE', '#FAD2E1'];
    let sheets = '';
    if (imgs.length) {
      const pos = [[9, 13, -6], [35, 6, 3], [60, 15, -2]];
      imgs.forEach((im, i) => { const [l, t, r] = pos[i]; sheets += `<figure class="print" style="--r:${r}deg;left:${l}%;top:${t}%;transform:rotate(${r}deg)"><img data-img="${im.id}" alt=""></figure>`; });
    } else {
      [0, 1].forEach((i) => { sheets += `<div class="sheet" style="--r:${[-0.9, 0.6][i]}deg;left:${pct(16 + i * 4, W)};right:${pct(16 - i * 4, W)};top:${pct(TH + 22 + i * 9, H)};bottom:3%;background-color:${PAPERS[i + (type === 'files' ? 0 : 1)]};transform:rotate(${[-0.9, 0.6][i]}deg)"></div>`; });
    }
    const grainPat = `<pattern id="g${id}" width="192" height="192" patternUnits="userSpaceOnUse"><image href="assets/grain.png" width="192" height="192"/></pattern>`;
    const back = backPath(W, H, tx, tw, TH); const front = frontPath(W, fh, cx, cw, 15);
    const n = docs.length; const count = type === 'files' ? `${n} ${n === 1 ? 'document' : 'documents'}` : `${n} ${n === 1 ? 'version' : 'versions'}`;
    return `
      <span class="shadow"></span>
      <svg viewBox="0 0 ${W} ${H + 4}" aria-hidden="true" preserveAspectRatio="none">
        <defs>${grainPat}<linearGradient id="b${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${th.back[0]}"/><stop offset="1" stop-color="${th.back[1]}"/></linearGradient></defs>
        <path class="ring" d="${backPath(W, H + 3, tx, tw, TH)}" fill="none" stroke="#FFA1C2" stroke-width="10" stroke-linejoin="round"/>
        <path d="${back}" fill="url(#b${id})"/><path d="${back}" fill="url(#g${id})" opacity=".5" style="mix-blend-mode:overlay"/>
        <path d="${back}" fill="none" stroke="${th.rim}" stroke-opacity=".3"/>
      </svg>
      <div class="sheets" style="inset:0">${sheets}</div>
      <div class="front" style="top:${pct(FT, H)}">
        <svg viewBox="0 0 ${W} ${fh + 3}" preserveAspectRatio="none" aria-hidden="true" style="top:3px"><path d="${front}" fill="${th.edge}"/></svg>
        <svg viewBox="0 0 ${W} ${fh}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="fr${id}" x1="0" y1="0" x2=".9" y2="1"><stop offset="0" stop-color="${th.front[0]}"/><stop offset=".55" stop-color="${th.front[1]}"/><stop offset="1" stop-color="${th.front[2]}"/></linearGradient></defs>
          <path d="${front}" fill="url(#fr${id})"/><path d="${front}" fill="url(#g${id})" opacity=".5" style="mix-blend-mode:overlay"/>
          <path d="M6 1.5 L${cx} 1.5 M${cx + cw} 1.5 L${W - 6} 1.5" stroke="${th.rim}" stroke-opacity=".5"/></svg>
        <div class="front-inner" style="color:${th.ink}">
          <span class="ftitle">${T.titleHTML}</span>
          <span class="fmeta"><span style="color:${th.sub}">${count}</span><span class="fgo" aria-hidden="true">→</span></span>
        </div>
      </div>`;
  }

  /* ---------------- routing ---------------- */
  let current = null;
  function route() { const h = location.hash.replace(/^#\/?/, ''); return ['bio', 'statement', 'files'].includes(h) ? h : 'home'; }
  async function go() {
    const r = route();
    $$('.ix').forEach((a) => (a.dataset.route === r ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current')));
    const from = current; current = r;
    document.body.classList.toggle('writing', r === 'bio' || r === 'statement');
    FX.parallax([]);
    if (r === 'home') await renderHome(from);
    else if (r === 'files') await renderFiles();
    else { main.innerHTML = ''; await renderWriting(r, { fromHome: from === 'home' }); }
    if (from !== null) main.focus({ preventScroll: true });
  }
  window.addEventListener('hashchange', go);

  /* ---------------- home ---------------- */
  const firstName = () => { const n = L.clean(((S.loadDraft('bio') || {}).answers || {}).name || ''); return n.split(' ')[0]; };
  const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };
  function imagesOf(type, docs) {
    const seen = new Set(); const out = [];
    const drafts = type ? [type] : ['bio', 'statement'];
    [...drafts.flatMap((t) => (S.loadDraft(t) || {}).images || []), ...docs.slice().reverse().flatMap((d) => d.images || [])].forEach((i) => { if (!seen.has(i.id)) { seen.add(i.id); out.push(i); } });
    return out;
  }
  async function renderHome() {
    const all = await S.listDocuments(); const bio = all.filter((d) => d.type === 'bio'); const st = all.filter((d) => d.type === 'statement');
    const recent = all.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
    const seen = new Set(); const wall = [];
    [...['bio', 'statement'].flatMap((t) => (S.loadDraft(t) || {}).images || []), ...all.slice().reverse().flatMap((d) => d.images || [])].forEach((i) => { if (!seen.has(i.id) && wall.length < 5) { seen.add(i.id); wall.push(i); } });
    const inProgress = ['bio', 'statement'].filter((t) => { const w = S.loadDraft(t); return w && Object.values(w.answers || {}).some(Boolean); }).length;
    const wb = S.loadDraft('bio'); const wsd = S.loadDraft('statement');
    const inBio = wb && Object.values(wb.answers || {}).some(Boolean); const bioStep = wb ? Math.min(wb.step || 0, QS.bio.length) : 0;
    const cta = inBio && bioStep < QS.bio.length
      ? `<a class="hero-btn" href="#/bio" data-cursor="Continue"><span>Continue your bio</span><small>Question ${bioStep + 1} of ${QS.bio.length}</small></a>`
      : !bio.length || !inBio ? `<a class="hero-btn" href="#/bio" data-cursor="Start"><span>Start your bio</span><small>9 short questions · about 4 minutes</small></a>`
      : `<a class="hero-btn" href="#/statement" data-cursor="Start"><span>Write your statement</span><small>7 short questions</small></a>`;
    main.innerHTML = `
      ${prefs.sound || S.prefs().sound ? '' : '<button class="sticker st-round st-rose sound-sticker" id="soundst" aria-label="Turn on studio sounds"><span>Sound on?</span></button>'}
      <section class="view home">
        <div class="home-hero">
          <div>
            <p class="eyebrow">My Studio · ${new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 class="display" style="margin-top:14px">${greeting()}${firstName() ? `, <em>${esc(firstName())}</em>.` : ', <em>artist</em>.'}</h1>
          </div>
          <div class="hero-cta">
            ${cta}
            <div class="stats">
              <div class="stat"><b>${String(bio.length).padStart(2, '0')}</b><span>Bios filed</span></div>
              <div class="stat"><b>${String(st.length).padStart(2, '0')}</b><span>Statements</span></div>
              <div class="stat"><b>${String(inProgress).padStart(2, '0')}</b><span>In progress</span></div>
            </div>
          </div>
        </div>
        <div class="shelf">
          <button class="folder" data-cursor="Open" data-open="bio" aria-label="Open Artist bio folder, ${bio.length} versions filed">${folderHTML('bio', bio, { images: imagesOf('bio', bio) })}</button>
          <button class="folder" data-cursor="Open" data-open="statement" aria-label="Open Artist statement folder, ${st.length} versions filed">${folderHTML('statement', st, { images: imagesOf('statement', st) })}</button>
          <button class="folder" data-cursor="Open" data-open="files" aria-label="Open My files, ${all.length} documents">${folderHTML('files', all, { images: imagesOf(null, all) })}</button>
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
    $$('[data-addimg]', main).forEach((b) => b.addEventListener('click', () => { const w = getWork('bio'); w.step = QS.bio.findIndex((x) => x.images); autosave('bio'); location.hash = '#/bio'; }));
    hydrate(main);
    const ss = $('#soundst'); if (ss) ss.addEventListener('click', () => { $('#sound-on').checked = true; $('#sound-on').dispatchEvent(new Event('change')); Snd.play('chime'); anim(ss, [{ transform: 'rotate(8deg) scale(1)' }, { transform: 'rotate(30deg) scale(0)', opacity: 0 }], { duration: 420, easing: 'ease-in' }).then(() => ss.remove()); });
    $$('.folder', main).forEach((f) => f.addEventListener('pointerenter', () => Snd.play('tick')));
    FX.parallax([[$('.home-hero h1', main), 8], [$('.hero-cta', main), 4], [$('.shelf', main), -10], [$('.wall-row', main), -16]]);
    // 3D: folders lean toward the pointer
    $$('.folder', main).forEach((f) => {
      f.addEventListener('pointermove', (e) => { if (!motion || e.pointerType !== 'mouse') return; const r = f.getBoundingClientRect(); f.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 10 + 'deg'); f.style.setProperty('--rx', (-(e.clientY - r.top) / r.height + 0.5) * 8 + 'deg'); });
      f.addEventListener('pointerleave', () => { f.style.removeProperty('--rx'); f.style.removeProperty('--ry'); });
    });
    $$('.polaroid:not(.empty)', main).forEach((p) => tilt(p, 8));
  }

  /* ---------------- writing: the open folder, one question per page ---------------- */
  const GROUPS = {
    bio: [['You', 0], ['The work', 3], ['Story', 6], ['Images', 8], ['Your bio', 9]],
    statement: [['The work', 0], ['Process', 2], ['Why', 4], ['Images', 6], ['Statement', 7]],
  };
  const groupOf = (type, step) => { const g = GROUPS[type]; let i = 0; g.forEach(([, s], n) => { if (step >= s) i = n; }); return i; };
  const CLIP_SVG = '<svg class="clip" viewBox="0 0 18 52" aria-hidden="true"><defs><linearGradient id="wire6" x1="0" x2="1"><stop offset="0" stop-color="#8E8E92"/><stop offset=".45" stop-color="#F2F2F4"/><stop offset="1" stop-color="#77777C"/></linearGradient></defs><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="rgba(42,10,18,.25)" stroke-width="2.4" transform="translate(.8 1.2)"/><path d="M5 44 V9 a5 5 0 0 1 10 0 V40 a2.6 2.6 0 0 1 -5.2 0 V14" fill="none" stroke="url(#wire6)" stroke-width="1.6" stroke-linecap="round"/></svg>';
  const pad2 = (n) => String(n).padStart(2, '0');

  // Encouragement stickers: earned as the bio grows, stuck onto the sheet with a slap and a sound.
  function earnedStickers(type) {
    const w = getWork(type); const a = w.answers; const n = QS[type].length; const out = [];
    const first = L.clean(a.name || '').split(' ')[0];
    if (type === 'bio' ? first : L.clean(a.subjects || '')) out.push({ id: 'hello', text: type === 'bio' ? `Hi, ${first}!` : 'Good start', shape: 'burst', col: 'lemon' });
    if (w.step >= Math.floor(n / 2)) out.push({ id: 'half', text: 'Halfway', shape: 'round', col: 'rose' });
    if (w.images.length) out.push({ id: 'imgs', text: 'Lovely work', shape: 'scallop', col: 'ballet' });
    if (w.step >= n - 1) out.push({ id: 'near', text: 'Nearly there', shape: 'tag', col: 'chilli' });
    return out;
  }
  function stickerHTML(s, i) { return `<button type="button" class="sticker st-${s.shape} st-${s.col}" data-st="${s.id}" style="--i:${i}" aria-label="Sticker: ${esc(s.text)}"><span>${esc(s.text)}</span></button>`; }

  async function renderWriting(type, opts = {}) {
    const w = getWork(type);
    if (w.step >= QS[type].length) return renderFinal(type, opts);
    const T = TYPES[type]; const th = T.theme; const docs = await S.listDocuments(type);
    const fresh = !$(`.spread-view[data-type="${type}"]`, main);
    if (fresh) {
      main.innerHTML = `<section class="spread-view" data-type="${type}" style="--btn:${th.btn};--btn-ink:${th.btnInk}">
        <div class="spread" style="--cv:${th.cv};--cv-ink:${th.cvInk};--cv-accent:${th.cvAccent};--sheet:${th.sheet};--spine-a:${th.spine[0]};--spine-b:${th.spine[1]}">
          <span class="floor"></span>
          <aside class="cover-in" aria-label="Your ${type === 'bio' ? 'bio' : 'statement'} so far"><span class="thumb"></span>
            <p class="eyebrow"><span>${T.idx} · ${esc(T.label)}</span><span>${docs.length} filed · saved here</span></p>
            <div class="bio-sheet">${CLIP_SVG}<div class="bs-head"><span>Your ${type === 'bio' ? 'bio' : 'statement'} so far</span><span id="bswc"></span></div><p class="sofar" id="sofar" aria-live="polite"></p><div class="bs-stickers" id="bsst"></div></div>
            <div class="bs-prints" id="bspin"></div>
          </aside>
          <div class="spine" aria-hidden="true"><i class="ring r1"></i><i class="ring r2"></i><i class="ring r3"></i></div>
          <div class="back">
            <svg class="board" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bk6" x1="0" x2="1"><stop offset="0" stop-color="${th.back[1]}"/><stop offset=".08" stop-color="${th.back[0]}"/><stop offset="1" stop-color="${th.back[1]}"/></linearGradient></defs><rect x="0" y="0" width="88.5" height="100" fill="url(#bk6)"/></svg>
            <div class="stage"><span class="stack s1"></span><span class="stack s2"></span><article class="page" id="page"></article></div>
            <div class="tabs" role="tablist" aria-label="Chapters" aria-orientation="vertical"></div>
          </div>
        </div></section>`;
      const board = $('.board rect', main); const back = $('.back', main);
      const fit = () => { const bw = back.clientWidth; if (bw) board.setAttribute('width', ((bw - 44) / bw * 100).toFixed(2)); };
      fit(); new ResizeObserver(fit).observe(back);
      FX.parallax([[$('.cover-in', main), 5], [$('.bio-sheet', main), 12], [$('.bs-prints', main), 20], [$('.back', main), -3]]);
    }
    renderTabs6(type); renderPage6(type, opts); drawSoFar(type, QS[type][w.step].k);
    if (fresh) {
      if (opts.fromHome && motion && innerWidth > 860) await openFlap6(type);
      else anim($('.spread', main), [{ opacity: 0, transform: 'translateY(16px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => { const s = $('.spread', main); s && s.getAnimations().forEach((x) => x.cancel()); });
    }
  }

  function renderTabs6(type) {
    const w = getWork(type); const box = $('.tabs', main); const cur = groupOf(type, w.step);
    box.innerHTML = GROUPS[type].map(([l, s], i) => `<button class="tab${i < cur ? ' done' : ''}" role="tab" aria-selected="${i === cur}" tabindex="${i === cur ? 0 : -1}" data-s="${s}" data-cursor="${l}"><span>${l}</span></button>`).join('');
    $$('.tab', box).forEach((b, i, all) => {
      b.addEventListener('click', () => stepTo(type, +b.dataset.s, +b.dataset.s < w.step));
      b.addEventListener('keydown', (e) => { const j = e.key === 'ArrowDown' ? i + 1 : e.key === 'ArrowUp' ? i - 1 : null; if (j !== null && all[j]) { e.preventDefault(); all[j].focus(); } });
    });
  }

  function renderPage6(type, opts = {}) {
    const w = getWork(type); const Q = QS[type]; const q = Q[w.step]; const a = w.answers; const page = $('#page', main);
    const vk = voiceKey(a, type); const v = a[q.k] || '';
    let control = '';
    if (q.images) control = imagesPanelHTML(w);
    else {
      control = q.area ? `<textarea class="write" id="pq" data-k="${q.k}" rows="4" placeholder="${esc(q.ph || 'Write here, in your own words')}">${esc(v)}</textarea>`
        : `<input class="write one" id="pq" data-k="${q.k}" type="text" value="${esc(v)}" placeholder="${esc(q.ph || '')}" autocomplete="off">`;
      if (q.second) control += `<input class="write one second" data-k="${q.second.k}" type="text" value="${esc(a[q.second.k] || '')}" placeholder="${esc(q.second.ph)}" aria-label="${esc(q.second.ph)}" autocomplete="off">`;
    }
    const last = w.step === Q.length - 1;
    page.innerHTML = `<span class="holes" aria-hidden="true"><i></i><i></i><i></i></span>
      <div class="ptop"><span>${pad2(w.step + 1)} / ${pad2(Q.length)}</span><span>${q.tab}${q.opt ? ' · optional' : ''}</span></div>
      <div class="prule"><i style="width:${((w.step + 1) / Q.length) * 100}%"></i></div>
      ${q.how ? `<div class="tip" id="tip"><button type="button" class="tip-btn" aria-expanded="false" aria-controls="tipcard" data-cursor="Open tip"><span>Tip</span></button><div class="tip-card" id="tipcard" role="note" hidden><span class="tape"></span><p>${esc(q.how)}</p></div></div>` : ''}
      <div class="qwrap">
        <h1 class="q" tabindex="-1"><label for="pq">${esc(q.q)}</label></h1>
        <p class="q-help">${q.help}</p>
        ${control}
        ${q.voice ? `<div class="chiprow"><span class="p-k">Write about me as</span><div class="p-chips" role="group" aria-label="Write about me as">${VOICES.map(([k, l]) => `<button type="button" class="p-chip" data-voice="${k}" aria-pressed="${vk === k}">${l}</button>`).join('')}</div></div>` : ''}
        ${q.tryList ? `<div class="chiprow"><span class="p-k">Try</span><div class="p-chips">${q.tryList.map((t) => `<button type="button" class="p-chip" data-try="${t}" aria-pressed="${L.clean(v).toLowerCase() === t}">${t}</button>`).join('')}</div></div>` : ''}
      </div>
      ${w.step > 0 ? '<button type="button" class="pback" id="pback" data-cursor="Back">← Back</button>' : ''}
      <button type="button" class="turn" id="pnext"><span class="turn-label"></span><span class="turn-fold" aria-hidden="true"></span></button>`;
    const next = $('#pnext', page);
    const label = () => { $('.turn-label', next).textContent = last ? `See my ${type === 'bio' ? 'bio' : 'statement'} →` : q.opt && !answeredQ(q, a, w) ? 'Skip →' : 'Next →'; };
    label();
    $$('.write[data-k]', page).forEach((el) => {
      el.addEventListener('input', () => { a[el.dataset.k] = el.value; autosave(type); drawSoFar(type, q.k); label(); Snd.play('scratch'); $$('[data-try]', page).forEach((c) => c.setAttribute('aria-pressed', String(L.clean(el.value).toLowerCase() === c.dataset.try))); });
      if (el.tagName === 'TEXTAREA') autoGrow(el); else el.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); next.click(); } });
    });
    $$('[data-try]', page).forEach((c) => c.addEventListener('click', () => { const inp = $('#pq', page); inp.value = c.dataset.try; inp.dispatchEvent(new Event('input')); inp.focus(); Snd.play('pop'); }));
    $$('[data-voice]', page).forEach((c) => c.addEventListener('click', () => { const k = c.dataset.voice; if (k === 'first') a.person = 'first'; else { a.person = 'third'; a.pronouns = k; } $$('[data-voice]', page).forEach((x) => x.setAttribute('aria-pressed', String(x === c))); autosave(type); drawSoFar(type, q.k); Snd.play('pop'); }));
    const tip = $('#tip', page);
    if (tip) {
      const btn = $('.tip-btn', tip); const card = $('.tip-card', tip);
      btn.addEventListener('click', () => { const open = card.hidden; card.hidden = !open; btn.setAttribute('aria-expanded', String(open)); tip.classList.toggle('open', open); Snd.play('peel'); if (open) anim(card, [{ opacity: 0, transform: 'rotate(-8deg) translateY(-10px) scale(.9)' }, { opacity: 1, transform: 'rotate(-2deg)' }], { duration: 360, easing: 'cubic-bezier(.2,1.4,.4,1)' }); });
    }
    if (q.images) bindImagesPanel(type, page);
    next.addEventListener('click', () => stepTo(type, w.step + 1));
    const back = $('#pback', page); if (back) back.addEventListener('click', () => stepTo(type, w.step - 1, true));
    if (opts.focus !== false) { const f = $('#pq', page) || $('.q', page); setTimeout(() => f.focus({ preventScroll: true }), motion ? 160 : 0); }
  }
  const answeredQ = (q, a, w) => (q.images ? w.images.length > 0 : !!L.clean(a[q.k] || ''));

  // The sheet on the inside cover: every sentence so far, the one being written in italic, earned stickers, pinned prints.
  function drawSoFar(type, currentKey) {
    const w = getWork(type); const el = $('#sofar'); if (!el) return;
    const r = L.compose(w.answers, type);
    $('#bswc').textContent = r.words ? r.words + ' words' : '';
    if (!r.parts.length) el.innerHTML = `<span class="ghost">Answer on the right. Your ${type === 'bio' ? 'bio' : 'statement'} writes itself here, only from what you type.</span>`;
    else el.innerHTML = r.parts.map((p) => `<span class="${p.key === currentKey ? 'fresh' : ''}">${esc(p.text)}</span>`).join(' ');
    el.style.fontSize = r.words > 110 ? '16px' : r.words > 70 ? '18px' : '';
    // stickers
    const box = $('#bsst'); w.seen = w.seen || [];
    const list = earnedStickers(type);
    box.innerHTML = list.map(stickerHTML).join('');
    list.forEach((s) => { if (!w.seen.includes(s.id)) { w.seen.push(s.id); const b = $(`[data-st="${s.id}"]`, box); Snd.play('stick'); anim(b, [{ transform: 'scale(1.9) rotate(-30deg)', opacity: 0 }, { transform: 'scale(.92) rotate(var(--rot))', opacity: 1, offset: .7 }, { transform: 'scale(1) rotate(var(--rot))', opacity: 1 }], { duration: 520, easing: 'cubic-bezier(.2,1.2,.4,1)' }).then(() => b && b.getAnimations().forEach((x) => x.cancel())); } });
    $$('.sticker', box).forEach((b) => b.addEventListener('click', () => { Snd.play('pop'); anim(b, [{ transform: 'rotate(var(--rot)) scale(1)' }, { transform: 'rotate(calc(var(--rot) + 12deg)) scale(1.12)' }, { transform: 'rotate(var(--rot)) scale(1)' }], { duration: 420, easing: 'cubic-bezier(.2,1.6,.4,1)' }); }));
    // prints of the work, pinned over the sheet
    const pin = $('#bspin'); const imgs = w.images.slice(0, 3);
    const cov = $('.cover-in', main); if (cov) cov.classList.toggle('has-prints', imgs.length > 0);
    if (pin) { pin.innerHTML = imgs.map((im, i) => `<figure class="print p${i}"><span class="tape"></span><img data-img="${im.id}" alt=""></figure>`).join(''); hydrate(pin); }
  }

  // Page turn: the page swings over the rings in 3D, with a shadow sweeping across it.
  async function stepTo(type, i, back) {
    const w = getWork(type); const n = QS[type].length; if (i < 0) return;
    const page = $('#page', main); const stage = $('.stage', main);
    if (i >= n) { w.step = n; autosave(type); Snd.play('flip'); if (motion && page) await anim(page, [{ transform: 'perspective(1800px) rotateY(0)', opacity: 1 }, { transform: 'perspective(1800px) rotateY(-100deg)', opacity: .2 }], { duration: 520, easing: 'cubic-bezier(.5,0,.2,1)' }); return renderFinal(type, { celebrate: true }); }
    const phone = innerWidth <= 860;
    let ghost = null;
    if (motion && page && stage && !back) { ghost = page.cloneNode(true); ghost.removeAttribute('id'); ghost.inert = true; $$('[id]', ghost).forEach((x) => x.removeAttribute('id')); ghost.classList.add('ghost-page'); stage.appendChild(ghost); }
    w.step = i; autosave(type); Snd.play('flip');
    await renderWriting(type);
    const np = $('#page', main);
    if (!motion) return;
    if (phone) { anim(np, [{ transform: `translateX(${back ? -40 : 40}px)`, opacity: 0 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' }); if (ghost) ghost.remove(); return; }
    if (ghost) {
      await anim(ghost, [{ transform: 'perspective(1800px) rotateY(0deg)', filter: 'brightness(1)' }, { transform: 'perspective(1800px) rotateY(-92deg)', filter: 'brightness(.82)', offset: .55 }, { transform: 'perspective(1800px) rotateY(-178deg)', filter: 'brightness(.7)', opacity: 0 }], { duration: 820, easing: 'cubic-bezier(.45,.05,.25,1)' });
      ghost.remove();
    } else {
      await anim(np, [{ transform: 'perspective(1800px) rotateY(-150deg)', opacity: 0, filter: 'brightness(.75)' }, { transform: 'perspective(1800px) rotateY(0deg)', opacity: 1, filter: 'brightness(1)' }], { duration: 760, easing: 'cubic-bezier(.3,.1,.2,1)' });
      np.getAnimations().forEach((x) => x.cancel());
    }
  }

  // Opening from the shelf: the front cover swings open on its spine.
  async function openFlap6(type) {
    const T = TYPES[type]; const th = T.theme; const spread = $('.spread', main); const back = $('.back', main); const cover = $('.cover-in', main);
    const sr = spread.getBoundingClientRect(); const br = back.getBoundingClientRect();
    const flap = document.createElement('div'); flap.className = 'flap';
    flap.style.cssText = `left:${br.left - sr.left}px;width:${br.width - 44}px;--cv:${th.cv};--cv-ink:${th.cvInk}`;
    flap.innerHTML = `<div class="face out"><span class="eyebrow" style="color:${th.cvAccent}">${T.idx} · ${esc(T.label)}</span><b>${T.titleHTML}</b></div><div class="face in"></div>`;
    spread.appendChild(flap); cover.style.opacity = 0; $('#page', main).style.opacity = 0;
    Snd.play('open');
    await anim(flap, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(-180deg)' }], { duration: 900, easing: 'cubic-bezier(.65,.05,.25,1)' });
    cover.style.opacity = ''; flap.remove(); const pg = $('#page', main); pg.style.opacity = '';
    anim(pg, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
    anim($('.bio-sheet', main), [{ opacity: 0, transform: 'translateY(40px) rotate(-5deg)' }, { opacity: 1, transform: 'rotate(-1.6deg)' }], { duration: 640, delay: 80, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => { const b = $('.bio-sheet', main); b && b.getAnimations().forEach((x) => x.cancel()); });
  }

  /* ---------------- images (question 'work' and the final page) ---------------- */
  const MAX_IMG = 8;
  const capText = (i) => [i.title, i.year, i.medium].map((x) => L.clean(x || '')).filter(Boolean).join(', ');
  function hydrate(root) { $$('img[data-img]', root).forEach(async (im) => { if (im.src) return; const src = await S.imageSrc(im.dataset.img); if (src) im.src = src; else im.closest('figure, .thumbimg, .p-thumb')?.classList.add('missing'); }); }
  let selImg = 0;
  function imagesPanelHTML(w) {
    const sel = w.images[selImg] ? selImg : 0; const cur = w.images[sel];
    return `<label class="p-drop" for="f-images"><input type="file" id="f-images" accept="image/*" multiple class="visually-hidden" ${w.images.length >= MAX_IMG ? 'disabled' : ''}>
        <b>${w.images.length >= MAX_IMG ? 'That is the most for one page' : 'Drop images here or choose files'}</b><span>JPG, PNG or WebP · ${MAX_IMG - w.images.length} of ${MAX_IMG} left</span></label>
      ${w.images.length ? `<div class="p-thumbs" role="list">${w.images.map((i, n) => `<button type="button" role="listitem" class="p-thumb" data-sel="${n}" aria-pressed="${n === sel}" aria-label="Image ${n + 1}${n === 0 ? ', lead' : ''}"><img data-img="${i.id}" alt="">${n === 0 ? '<span>Lead</span>' : ''}</button>`).join('')}</div>
        <div class="p-cap"><input class="p-input small" data-cap="title" value="${esc(cur.title || '')}" placeholder="Title" aria-label="Title of image ${sel + 1}"><input class="p-input small" data-cap="year" value="${esc(cur.year || '')}" placeholder="Year" aria-label="Year"><input class="p-input small" data-cap="medium" value="${esc(cur.medium || '')}" placeholder="Medium" aria-label="Medium"></div>
        <div class="p-imgacts">${sel > 0 ? '<button type="button" class="p-link" id="mklead">Make this the lead image</button>' : '<span class="p-note" style="margin:0">The lead image opens your page.</span>'}<button type="button" class="p-link" id="rmimg">Remove</button></div>`
      : '<p class="p-note">Captions are only what you write. <button type="button" class="p-link" id="sample-imgs">No photos to hand? Try sample images</button></p>'}`;
  }
  async function addImages(type, files) {
    const w = getWork(type); const list = [...files].filter((f) => /^image\//.test(f.type)).slice(0, MAX_IMG - w.images.length);
    if (!list.length) { toast('Choose image files: JPG, PNG or WebP.', true); return false; }
    for (const f of list) { try { const r = await S.addImage(f); w.images.push({ id: r.id, title: f.name.replace(/\.[a-z0-9]+$/i, '').replace(/[_-]+/g, ' ').slice(0, 60), year: '', medium: '' }); } catch (e) { toast(e.message || 'That image could not be added.', true); } }
    autosave(type); Snd.play('file'); toast('Added. Check each title: it starts from the file name.');
    return true;
  }
  function bindImagesPanel(type, poster) {
    const w = getWork(type); const rerender = () => renderWriting(type, { focus: false });
    hydrate(poster);
    const input = $('#f-images', poster); const drop = $('.p-drop', poster);
    input.addEventListener('change', async () => { if (await addImages(type, input.files)) { selImg = w.images.length - 1; rerender(); } });
    ['dragenter', 'dragover'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
    ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
    drop.addEventListener('drop', async (e) => { if (await addImages(type, e.dataTransfer.files)) { selImg = w.images.length - 1; rerender(); } });
    $$('[data-sel]', poster).forEach((b) => b.addEventListener('click', () => { selImg = +b.dataset.sel; rerender(); }));
    $$('[data-cap]', poster).forEach((inp) => inp.addEventListener('input', () => { w.images[selImg][inp.dataset.cap] = inp.value; autosave(type); }));
    const mk = $('#mklead', poster); if (mk) mk.addEventListener('click', () => { const [m] = w.images.splice(selImg, 1); w.images.unshift(m); selImg = 0; autosave(type); Snd.play('tick'); rerender(); });
    const rm = $('#rmimg', poster); if (rm) rm.addEventListener('click', () => { w.images.splice(selImg, 1); selImg = 0; autosave(type); rerender(); });
    const smp = $('#sample-imgs', poster); if (smp) smp.addEventListener('click', async () => { for (let i = 0; i < 3; i++) { const r = await S.addImage(sampleArt(i)); w.images.push({ id: r.id, title: 'Sample image ' + (i + 1), year: '', medium: 'Generated placeholder', sample: true }); } autosave(type); rerender(); });
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

  /* ---------------- the finished record sheet ---------------- */
  const sig = (a) => JSON.stringify(a);
  const nameFor = (type, a) => L.clean(a.name || ((S.loadDraft('bio') || {}).answers || {}).name || '');
  const LEN_NOTE = { full: 'Everything you wrote.', short: 'Fits a 100-word limit.', brief: 'Fits a 50-word limit.', line: 'One sentence, for captions and profiles.' };
  function syncDrafts(type) {
    const w = getWork(type); const a = w.answers; const basis = sig(a); const vs = L.variants(a, type);
    vs.forEach((v) => { const d = w.drafts[v.key]; if (!d || (!d.edited && d.basis !== basis)) w.drafts[v.key] = { text: v.text, edited: false, basis }; });
    if (!vs.some((v) => v.key === w.variant)) w.variant = 'full';
    w.result = vs.find((v) => v.key === w.variant); w.vs = vs;
    return vs;
  }
  async function renderFinal(type, opts = {}) {
    const T = TYPES[type]; const th = T.theme; const w = getWork(type); const a = w.answers; const word = type === 'bio' ? 'bio' : 'statement';
    const missing = (type === 'bio' ? ['name', 'role'] : ['subjects']).filter((k) => !L.clean(a[k]));
    if (missing.length) { w.step = QS[type].findIndex((q) => q.k === missing[0]); autosave(type); toast(type === 'bio' ? 'Your name and practice come first.' : 'The statement needs your subjects first.'); main.innerHTML = ''; return renderWriting(type); }
    const vs = syncDrafts(type); autosave(type);
    const docs = await S.listDocuments(type);
    const d = w.drafts[w.variant]; const name = nameFor(type, a); const first = name.split(' ')[0]; const lead = w.images[0]; const vk = voiceKey(a, type);
    const sub = type === 'bio' ? [a.role, a.location].map((x) => L.clean(x || '')).filter(Boolean).join(' · ') : (a.series ? L.clean(a.series) : 'Artist statement');
    const other = type === 'bio' ? 'statement' : 'bio'; const otherLabel = other === 'bio' ? 'artist bio' : 'artist statement';
    main.innerHTML = `<section class="final-view" data-type="${type}" style="--cv:${th.cv};--cv-ink:${th.cvInk};--cv-accent:${th.cvAccent};--btn:${th.btn};--btn-ink:${th.btnInk}">
      <header class="fin-hero">
        <p class="eyebrow">${esc(T.label)} · version ${docs.length + 1}</p>
        <h1 class="fin-title" tabindex="-1">Your ${word} is <em>ready</em>${first ? `, ${esc(first)}` : ''}.</h1>
        <p class="fin-sub">Copy it, change the length, or file it in your folder.</p>
      </header>
      <article class="rec-sheet">
        <header class="rec-head">${CLIP_SVG}<span>${esc(T.label)}</span><span>${fmtDate(new Date().toISOString())}</span></header>
        <div class="rec-body${lead ? '' : ' no-img'}">
          <figure class="rec-img">${lead ? `<span class="tape"></span><img data-img="${lead.id}" alt="${esc(capText(lead))}">${lead.sample ? '<span class="sample-tag">Sample</span>' : ''}${capText(lead) ? `<figcaption>${esc(capText(lead))}</figcaption>` : ''}` : `<label class="rec-add" for="f-addimg" data-cursor="Add image"><input type="file" id="f-addimg" accept="image/*" multiple class="visually-hidden"><span class="drop-art" aria-hidden="true"><i></i><i></i><i></i></span><b>Add an image of your work</b><span>It sits beside your ${word}.</span></label>`}</figure>
          <div class="rec-text">
            <h2 class="rec-name">${esc(name || T.label)}</h2>
            <p class="rec-sub">${esc(sub)}</p>
            <label for="ftext" class="visually-hidden">Your ${word}, editable</label>
            <textarea class="rec-words" id="ftext" spellcheck="true" data-cursor="Edit">${esc(d.text)}</textarea>
            <p class="rec-note"><b id="fwc">${L.count(d.text)}</b> words · <span id="fnote">${d.edited ? 'edited by you' : LEN_NOTE[w.variant].replace(/\.$/, '').toLowerCase()}</span> <span class="f-demo" title="Prototype: template writer, not AI">Demo writer</span></p>
            <div id="fnotice"></div>
          </div>
        </div>
        <button type="button" class="sticker st-burst st-lemon done-sticker" aria-label="Sticker: Done"><span>Done!</span></button>
        <span class="stamp rec-stamp" id="fstamp" hidden></span>
      </article>
      <div class="rec-controls">
        <button class="btn btn-primary rec-copy" id="fcopy" data-cursor="Copy">Copy my ${word}</button>
        <div class="seg rec-seg" role="group" aria-label="Length">${vs.map((v) => `<button type="button" data-var="${v.key}" aria-pressed="${v.key === w.variant}">${v.label}</button>`).join('')}</div>
        <div class="seg rec-seg" role="group" aria-label="Voice">${[['she', 'She'], ['he', 'He'], ['they', 'They'], ['first', 'I']].map(([k, l]) => `<button type="button" data-voice="${k}" aria-pressed="${vk === k}">${l}</button>`).join('')}</div>
      </div>
      <div id="ffiling"></div>
      <section class="next-steps" aria-labelledby="next-h">
        <h2 id="next-h">What <em>next</em>?</h2>
        <div class="next-row">
          <button class="next-card nc-file" id="ffile" data-cursor="File it"><span class="nc-k">Keep it</span><b>File this version</b><span>Saved in your ${esc(T.short)} folder, ready to reopen.</span></button>
          <button class="next-card nc-other" id="fother" data-cursor="Start"><span class="nc-k">Keep going</span><b>Write your ${otherLabel}</b><span>${other === 'statement' ? 'About the work itself. Seven short questions.' : 'Who you are and what you make. Nine short questions.'}</span></button>
          <button class="next-card nc-post" id="fpost" data-cursor="Preview"><span class="nc-k">Share it</span><b>Make a square post</b><span>Your lead image with a short version of the text.</span></button>
        </div>
        <p class="fin-links"><button class="btn-text btn" id="ftxt">Download .txt</button><button class="btn-text btn" id="fedit">Edit answers</button></p>
      </section>
    </section>`;
    const root = $('.final-view', main); hydrate(root);
    const ta = $('#ftext', root); autoGrow(ta);
    const notice = () => { const r = w.result; $('#fnotice', root).innerHTML = d.edited && d.basis !== sig(a) ? '<p class="rec-warn">Your answers changed after you edited this. <button class="btn-text btn" id="frebuild">Rebuild from answers</button></p>' : r.omitted.length && !d.edited && w.variant !== 'line' ? `<p class="rec-warn">Left out to fit: ${r.omitted.join(', ')}.</p>` : ''; const rb = $('#frebuild', root); if (rb) rb.addEventListener('click', () => { if (rb.dataset.armed) { delete w.drafts[w.variant]; renderFinal(type, { quiet: true }); return; } rb.dataset.armed = '1'; rb.textContent = 'Yes, replace my edits'; }); };
    notice();
    ta.addEventListener('input', () => { d.text = ta.value; d.edited = true; $('#fwc', root).textContent = L.count(ta.value); $('#fnote', root).textContent = 'edited by you'; autosave(type); Snd.play('scratch'); });
    $('#fcopy', root).addEventListener('click', (e) => { copyText(ta.value); Snd.play('pop'); const r = e.currentTarget.getBoundingClientRect(); FX.confetti(26, { x: r.left + r.width / 2, y: r.top }); });
    $$('[data-var]', root).forEach((b) => b.addEventListener('click', () => { w.variant = b.dataset.var; autosave(type); Snd.play('turn'); swapText(type); }));
    $$('[data-voice]', root).forEach((b) => b.addEventListener('click', () => { const k = b.dataset.voice; if (k === 'first') a.person = 'first'; else { a.person = 'third'; a.pronouns = k; } autosave(type); Snd.play('pop'); swapText(type); }));
    $('#ftxt', root).addEventListener('click', () => downloadTxt(ta.value, (name || T.label) + ' ' + w.result.label + '.txt'));
    $('#fedit', root).addEventListener('click', () => { w.step = 0; autosave(type); main.innerHTML = ''; renderWriting(type); });
    $('#fpost', root).addEventListener('click', () => openPost(type));
    $('#ffile', root).addEventListener('click', () => openFiling(type));
    $('#fother', root).addEventListener('click', () => { Snd.play('open'); location.hash = '#/' + other; });
    $('.done-sticker', root).addEventListener('click', (e) => { Snd.play('chime'); const r = e.currentTarget.getBoundingClientRect(); FX.confetti(40, { x: r.left + r.width / 2, y: r.top + r.height / 2 }); });
    const add = $('#f-addimg', root); if (add) add.addEventListener('change', async () => { if (await addImages(type, add.files)) renderFinal(type, { quiet: true }); });
    const rec = $('.rec-sheet', root); tilt(rec, 2); $$('.next-card', root).forEach((c) => tilt(c, 6));
    FX.parallax([[$('.fin-hero', root), 10], [rec, -4]]);
    if (!opts.quiet) {
      $('.fin-title', root).focus({ preventScroll: true });
      if (motion) {
        anim($('.fin-title', root), [{ opacity: 0, transform: 'translateY(30px)', letterSpacing: '.02em' }, { opacity: 1, transform: 'none', letterSpacing: '-.04em' }], { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)' });
        anim(rec, [{ opacity: 0, transform: 'perspective(1600px) rotateX(24deg) translateY(120px) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 1000, delay: 150, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => rec.getAnimations().forEach((x) => x.cancel()));
        const ds = $('.done-sticker', root); anim(ds, [{ opacity: 0, transform: 'scale(2.2) rotate(-40deg)' }, { opacity: 1, transform: 'scale(.9) rotate(12deg)', offset: .75 }, { opacity: 1, transform: 'scale(1) rotate(10deg)' }], { duration: 600, delay: 900, easing: 'cubic-bezier(.2,1.2,.4,1)' }).then(() => ds.getAnimations().forEach((x) => x.cancel()));
        $$('.next-card', root).forEach((c, i) => anim(c, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 640, delay: 700 + i * 110, easing: 'cubic-bezier(.16,1,.3,1)' }).then(() => c.getAnimations().forEach((x) => x.cancel())));
      }
      if (opts.celebrate) { setTimeout(() => { Snd.play('chime'); FX.confetti(110); }, motion ? 450 : 0); setTimeout(() => Snd.play('stick'), motion ? 950 : 0); }
    }
  }
  async function swapText(type) {
    const ta = $('#ftext'); if (motion && ta) await anim(ta, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'perspective(900px) rotateX(-14deg) translateY(-8px)' }], { duration: 160, easing: 'ease-in' });
    const y = scrollY; await renderFinal(type, { quiet: true }); scrollTo(0, y);
    anim($('#ftext'), [{ opacity: 0, transform: 'perspective(900px) rotateX(14deg) translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  function postHTML(type, text, images, a) {
    const P = POSTER[type].dark; const lead = images[0];
    return `<div class="post-wrap"><div class="post" style="--pc:${P.bg};--pi:${P.ink};--pa:${P.ribbon}">
      <div class="post-img">${lead ? `<img data-img="${lead.id}" alt="${esc(capText(lead))}">` : '<span class="post-noimg">Add an image on your page to see it here</span>'}</div>
      <div class="post-band"><p>${esc(text)}</p><span>${esc(nameFor(type, a) || TYPES[type].label)}</span></div></div></div>`;
  }
  function openPost(type) {
    const w = getWork(type); const brief = w.drafts.line || w.drafts.brief; const text = w.variant === 'full' || w.variant === 'short' ? brief.text : w.drafts[w.variant].text;
    dlg.dataset.kind = 'post';
    dlg.innerHTML = `<div class="dh plain"><div><p class="mono">Square post · 1:1</p><h2 id="doc-title" style="margin-top:6px">For social media</h2></div><button class="x" id="dclose" aria-label="Close">×</button></div>
      <div class="db">${postHTML(type, text, w.images, w.answers)}<p class="fine" style="margin-top:14px;text-align:center">Uses your ${w.variant === 'full' || w.variant === 'short' ? (w.drafts.line ? 'One line' : 'Brief') : w.result.label} text. Saving as an image is not built yet.</p>
      <div class="acts" style="justify-content:center"><button class="btn btn-primary" id="dcopy">Copy text</button></div></div>`;
    $('#dclose').addEventListener('click', () => dlg.close()); $('#dcopy').addEventListener('click', () => copyText(text));
    hydrate(dlg); dlg.showModal(); const p = $('.post', dlg); tilt(p, 8);
    anim(p, [{ opacity: 0, transform: 'perspective(1200px) rotateY(-20deg) scale(.94)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  /* subtle 3D tilt that follows the pointer */
  function tilt(el, max = 3) {
    if (!el) return;
    el.addEventListener('pointermove', (e) => { if (!motion || e.pointerType !== 'mouse') return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5; el.style.transform = `perspective(1200px) rotateY(${x * max}deg) rotateX(${-y * max}deg)`; });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  }
  function autoGrow(t) { const f = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 2 + 'px'; }; t.addEventListener('input', f); requestAnimationFrame(f); }

  function copyText(t) { (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => toast('Copied to your clipboard')).catch(() => toast('Copy did not work here. Select the text and copy it.', true)); }
  function previewFallback(text, what) { navigator.clipboard && navigator.clipboard.writeText(text).catch(() => {}); toast(`${what} is blocked in this hosted preview. The text is copied instead.`); }
  function downloadTxt(text, name) { if (window.STUDIO_PREVIEW) return previewFallback(text, 'Downloading'); const b = new Blob([text + '\n'], { type: 'text/plain' }); const u = URL.createObjectURL(b); const l = document.createElement('a'); l.href = u; l.download = name.replace(/[^\w .,-]+/g, '').trim() || 'document.txt'; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() => URL.revokeObjectURL(u), 1000); }

  /* ---------------- filing: the page slides into its folder ---------------- */
  async function openFiling(type) {
    const T = TYPES[type]; const w = getWork(type); const a = w.answers; const box = $('#ffiling'); if (box.innerHTML) { $('#vname').focus(); return; }
    const d = w.drafts[w.variant]; const vlabel = w.result.label;
    box.innerHTML = `<form class="f-slip" aria-labelledby="slip-h"><p class="mono" id="slip-h">File in ${esc(T.label)} · ${esc(vlabel)} · ${L.count(d.text)} words${w.images.length ? ' · ' + w.images.length + ' images' : ''}</p>
      <label for="vname" class="visually-hidden">Name this version</label><input id="vname" type="text" maxlength="120" value="${esc(vlabel === 'Full' ? 'Full ' + (type === 'bio' ? 'bio' : 'statement') : vlabel + ' ' + (type === 'bio' ? 'bio' : 'statement'))}">
      <div class="f-slip-acts"><button type="button" class="f-link" id="fcancel">Cancel</button><button type="submit" class="f-copy small" id="fdo">File it</button></div></form>`;
    const form = $('form', box); const name = $('#vname', box);
    await anim(form, [{ opacity: 0, transform: 'perspective(900px) rotateX(-30deg) translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.16,1,.3,1)' });
    name.focus(); name.select();
    $('#fcancel', box).addEventListener('click', () => { box.innerHTML = ''; $('#ffile').focus(); });
    form.addEventListener('keydown', (e) => { if (e.key === 'Escape') { box.innerHTML = ''; $('#ffile').focus(); } });
    form.addEventListener('submit', async (e) => {
      e.preventDefault(); const title = name.value.trim(); if (!title) return name.focus();
      $('#fdo', box).disabled = true; let doc;
      try { doc = await S.fileVersion({ type, title, text: d.text, words: L.count(d.text), purpose: '', answers: { ...a }, variant: { key: w.variant, label: vlabel }, images: w.images.map((i) => ({ ...i })) }); }
      catch (err) { $('#fdo', box).disabled = false; toast('Could not save on this device. Copy your text to keep it.', true); return; }
      Snd.play('file'); box.innerHTML = '';
      await flyToTab(type);
      Snd.play('stamp'); FX.confetti(60); const fb = $('#ffile'); if (fb) { fb.classList.add('done'); $('b', fb).textContent = 'Filed ✓'; }
      const st = $('#fstamp'); if (st) { st.hidden = false; st.innerHTML = `Filed ${fmtDate(new Date().toISOString())}<br>${esc(title)}`; anim(st, [{ opacity: 0, transform: 'rotate(-6deg) scale(1.4)' }, { opacity: 1, transform: 'rotate(-6deg) scale(1)' }], { duration: 340, easing: 'cubic-bezier(.2,1.4,.4,1)' }); }
      const n = (await S.listDocuments(type)).length;
      toast(`Filed in ${T.label} as version ${n}`, false, { label: 'Undo', run: async () => { await S.removeDocument(doc.id); toast('Filing undone.'); } });
    });
  }
  // A paper copy of the text folds and flies into the section's index tab.
  async function flyToTab(type) {
    const src = $('#ftext'); const tab = $(`.ix[data-route="${type}"]`); if (!motion || !src || !tab) return;
    const r = src.getBoundingClientRect(); const t = tab.getBoundingClientRect();
    const g = document.createElement('div'); g.className = 'fly-paper'; g.textContent = src.value.slice(0, 260);
    Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: Math.min(r.height, 260) + 'px' });
    document.body.appendChild(g);
    const dx = t.left + t.width / 2 - (r.left + r.width / 2); const dy = t.top + t.height / 2 - (r.top + Math.min(r.height, 260) / 2);
    await anim(g, [{ transform: 'perspective(1200px) translate(0, 0)', opacity: 1 }, { transform: `perspective(1200px) translate(${dx * .3}px, ${dy * .3 - 60}px) rotateX(20deg) rotate(-4deg) scale(.7)`, opacity: 1, offset: .4 }, { transform: `perspective(1200px) translate(${dx}px, ${dy}px) rotateX(60deg) scale(.06)`, opacity: .2 }], { duration: 900, easing: 'cubic-bezier(.65,.05,.3,1)' });
    g.remove(); anim(tab, [{ transform: 'translateY(0)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0)' }], { duration: 420, easing: 'cubic-bezier(.2,1.6,.4,1)' });
  }

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
    dlg.style.setProperty('--tint', bio ? '#6A0620' : '#AA0003'); dlg.style.setProperty('--dh-ink', bio ? '#FAD2E1' : '#FFD6DE');
    delete dlg.dataset.kind;
    dlg.innerHTML = `<div class="dh"><div><p class="mono" style="color:${bio ? '#FFA1C2' : '#FFD6DE'}">${bio ? 'Artist bio' : 'Statement'} · V${v}${d.sample ? ' · Sample' : ''}</p><h2 id="doc-title" style="margin-top:8px">${esc(d.title)}</h2></div><button class="x" id="dclose" aria-label="Close">×</button></div>
      <div class="db"><div class="cells"><div><span class="k">Words</span><div class="v">${d.words}</div></div><div><span class="k">For</span><div class="v">${esc(d.purpose || '—')}</div></div><div><span class="k">Filed</span><div class="v">${fmtDate(d.date)}</div></div><div><span class="k">Kept</span><div class="v">This device</div></div></div>
      ${d.images && d.images.length ? `<figure class="d-img"><img data-img="${d.images[0].id}" alt="${esc(capText(d.images[0]))}"></figure>` : ''}<p class="read-text">${esc(d.text)}</p>
      <div class="acts"><button class="btn btn-line" id="dcopy">Copy</button><button class="btn btn-line" id="dtxt">Download .txt</button><button class="btn btn-primary" id="dopen">Edit as new version</button><button class="btn btn-text" id="ddel" style="margin-left:auto">Delete</button></div></div>`;
    $('#dclose').addEventListener('click', () => dlg.close());
    $('#dcopy').addEventListener('click', () => copyText(d.text));
    $('#dtxt').addEventListener('click', () => downloadTxt(d.text, d.title + '.txt'));
    $('#dopen').addEventListener('click', () => { dlg.close(); if (d.sample) { toast('Sample files have no answers to edit.'); return; } const w = getWork(d.type); w.answers = { ...(d.answers || {}) }; const key = d.variant ? d.variant.key : 'full'; w.variant = key; w.drafts = { [key]: { text: d.text, edited: true, basis: sig(w.answers) } }; w.images = (d.images || []).map((i) => ({ ...i })); w.step = QS[d.type].length; autosave(d.type); if (route() === d.type) renderWriting(d.type); else location.hash = '#/' + d.type; });
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
