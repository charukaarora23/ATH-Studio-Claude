/* ATH Creative Fund: one artist a month gets $500, no questions asked. A signature programme and a lead engine:
   every round brings new artists in (the apply form collects their email), and every post points to the link.
   A round = one month: the window, the dated posts, the winner, the artists we found, the emails, the check-ins. */
let FUND = null, FUNDSEL = null, FUNDTAB = 'plan', FUNDVIEW = null, FUNDBUSY = false, FUNDLOCAL = false;
const FD_LINK = 'https://submit.artstoheartsproject.com/ath-creative-fund';
const FD_TABS = [['plan', 'Posts'], ['setup', 'Setup'], ['winner', 'Recipient'], ['found', 'Work that stayed with us'], ['emails', 'Emails'], ['web', 'Website'], ['track', 'Checklist']];
const fdIso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const fdDate = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? new Date(+m[1], m[2] - 1, +m[3]) : null; };
const fdAdd = (d, n) => d ? new Date(d.getFullYear(), d.getMonth(), d.getDate() + n) : null;
const fdDay = d => d ? d.getDate() + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][d.getMonth()] : '';
const fdMonthOf = id => { const d = fdDate(id + '-01'); return d ? fdDay(d).replace(/^\d+ /, '') + ' ' + d.getFullYear() : id; };
const fdMonth = id => { const r = (FUND && FUND[id]) || {id}; const o = fdDate(r.opens || id + '-15'), c = fdDate(r.closes) || fdAdd(o, 30); return fdName(r) + ' · ' + fdMonthOf(fdIso(o).slice(0, 7)).split(' ')[0] + ' to ' + fdMonthOf(fdIso(c).slice(0, 7)); };
const fdFirst = n => String(n || '').trim().split(/\s+/)[0] || '';
const fdE = s => bkEsc(s);

/* a cycle opens on the 15th, closes on the 15th of the next month (11:59 PM), the recipient is announced on the 23rd. Cycle 01 opened 15 October 2026. */
const fdCycle = id => { const m = String(id).match(/^(\d{4})-(\d{2})/); return m ? (+m[1] - 2026) * 12 + (+m[2] - 10) + 1 : 0; };
const fdName = r => 'Cycle ' + String(r.cycle || fdCycle(r.id)).padStart(2, '0');
function fdNew(id){ const d = fdDate(id + '-01');
  return {id, cycle: fdCycle(id), opens: fdIso(new Date(d.getFullYear(), d.getMonth(), 15)), closes: fdIso(new Date(d.getFullYear(), d.getMonth() + 1, 15)), announce: fdIso(new Date(d.getFullYear(), d.getMonth() + 1, 23)), link: FD_LINK, keyword: 'FUND', amount: '$500',
    who: 'Visual artists, photographers and writers, 18 or older, anywhere in the world. Every career stage.', free: true, winner: {}, found: [], done: {}}; }
const fdRounds = () => Object.values(FUND || {}).sort((a, b) => a.id < b.id ? -1 : 1);
const fdPrev = r => fdRounds().filter(x => x.id < r.id && x.winner && x.winner.name).pop() || null;
const fdNext = r => { const d = fdDate(r.id + '-01'); return fdNew(fdIso(new Date(d.getFullYear(), d.getMonth() + 1, 1)).slice(0, 7)); };
const fdNextR = r => { const n = fdNext(r); return (FUND && FUND[n.id]) || n; };

async function fundLoad(){ FUNDBUSY = true;
  try { const r = await fetch('api/fund'); if (!r.ok) throw 0; FUND = await r.json(); FUNDLOCAL = false; }
  catch { try { FUND = JSON.parse(localStorage.getItem('athFund') || '{}'); } catch { FUND = {}; } FUNDLOCAL = true; }
  FUNDBUSY = false; let demoOn = false; try { demoOn = localStorage.getItem('athFundDemo') === '1'; } catch {} if (demoOn && !FUNDDEMO) { FUNDREAL = FUND; FUND = fdDemo(); FUNDDEMO = true; FUNDSEL = '2026-11'; fundRender(); if (FUNDVIEW) render(); return; }
  if (FUNDSEL === null) { const now = fdIso(new Date()).slice(0, 7); const t = new Date(); const cur = fdIso(t.getDate() >= 15 ? t : new Date(t.getFullYear(), t.getMonth() - 1, 1)).slice(0, 7); FUNDSEL = FUND[cur] ? cur : (fdRounds().pop() || {}).id || null; }
  fundRender(); if (FUNDVIEW) render(); }
let fdSaveT = null;
function fundSave(id){ if (FUNDDEMO) { status('This is the example: changes show here but are not saved.'); return; } clearTimeout(fdSaveT); fdSaveT = setTimeout(async () => {
  if (!FUNDLOCAL) { try { const r = await fetch('api/fund', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, round: FUND[id] || null})}); if (!r.ok) throw 0; status('Saved for the team.'); return; } catch { FUNDLOCAL = true; } }
  try { localStorage.setItem('athFund', JSON.stringify(FUND)); status('Saved in this browser (the shared store could not be reached).'); } catch {} }, 600); }
async function fdUpload(file){ const url = await shrink(file);
  try { const r = await fetch('api/upload', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({data: url})}); if (!r.ok) throw 0; return (await r.json()).url; } catch { return url; } }

/* ---------- the cycle: every post, with its date. Fewer posts, each with a hook and a reason to exist ---------- */
function fdPlan(r){ const o = fdDate(r.opens), c = fdDate(r.closes), a = fdDate(r.announce), w = r.winner || {}; const past = fdRecips(r).filter(x => x.r.id !== r.id);
  const L = [
    {id: 'launch', when: o, title: 'The fund is open', what: 'Hook: $500, no receipts, no reports. What it is, who it is for, how to apply, the cycle on a calendar.'},
    {id: 'why', when: fdAdd(o, 4), title: 'Why we started the fund', what: 'Investing in artists: the story and the role of the fund, what it is, what it isn\'t, the numbers, what a recipient gets.'},
    {id: 'guide', when: fdAdd(o, 9), title: 'Before you apply', what: 'Value: what we look for, how to choose your work sample, the post, your words, the one thing that makes an application complete.'},
    past.length && {id: 'record', when: fdAdd(o, 13), title: 'The fund so far', what: `The track record: ${past.map(x => x.w.name).join(', ')}. Proof it is real, and what it made possible.`},
    {id: 'week', when: fdAdd(c, -6), title: 'One week left', what: 'The deadline on the calendar, the five-tick eligibility check, the link.'},
    {id: 'winner', when: a, title: w.name ? `Meet ${w.name}` : 'Meet the recipient', what: w.name ? 'Who they are, why we chose them, their work, what the grant makes possible, the track record.' : 'Fill in the Recipient tab first.'},
    {id: 'recap', when: fdAdd(a, 3), title: `${fdName(r)} recap`, what: (r.found || []).length ? 'The cycle in a folder: the work that stayed with us, what stood out, what comes next.' : 'Add work in the Work that stayed with us tab.'},
    {id: 'feature', when: fdAdd(a, 12), title: w.name ? `In conversation with ${w.name}` : 'The recipient feature', what: w.q1 ? 'Their interview, as published on artstoheartsproject.com.' : 'Add their interview answers in the Recipient tab.'}];
  return L.filter(Boolean).map(p => ({...p, t: p.when ? +p.when : 0})); }

/* ---------- the fund's own looks, inside the house system (Burgundy, Pink, Inter Tight, Baskerville, credits on every image, work never cropped) ----------
   calendar with polaroids (the cycle), letters cut out of the paper with the work showing through (titles), a wall of words with framed work (statements),
   the folder with tabs (chapters, as the tabbed card), the recap circle with file-style labels (track record). */
const FDNAT = {};
function fdNat(u){ if (!u) return null; if (FDNAT[u] !== undefined) return FDNAT[u]; FDNAT[u] = null; const im = new Image();
  im.onload = () => { FDNAT[u] = {w: im.naturalWidth, h: im.naturalHeight}; clearTimeout(fdNat.t); fdNat.t = setTimeout(() => { if (FUNDVIEW) render(); }, 150); }; im.src = u; return null; }
const fdPill = (sz = 34) => `<span style="display:inline-block;${T_MED};font-size:${sz}px;line-height:1;letter-spacing:-.005em;color:#FFFFFF;background:${HL.burg};border-radius:999px;padding:${Math.round(sz * .45)}px ${Math.round(sz * .95)}px">ATH Creative Fund</span>`;
const fdCred = x => x ? [x.title, x.name].filter(Boolean).join(' by ') + (x.handle ? ' ' + x.handle : '') : '';
const fdBrand = (c = HL.burg) => `<p class="a cn" style="left:52px;top:48px;color:${c}">Arts to Hearts Project</p>`;
const fdFoot = (c = HL.burg, bg = HL.white, fg = HL.burg) => `<p class="a" style="left:52px;bottom:52px;${T_REG};font-size:24px;color:${c};opacity:.85">@artstoheartsproject</p><div class="a" style="right:52px;bottom:40px;width:56px;height:56px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;${T_MED};font-size:28px;color:${fg}">&rarr;</div>`;
const fdEm = (t, c) => esc(bkKeep(t)).replace(/\*\*(.+?)\*\*/g, `<span style="color:${c}">$1</span>`);
/* a polaroid that hugs the work: the whole artwork, its credit on the white strip */
function fdPol(x, o){ const u = x && bkPic(o.slot, x.art); const n = fdNat(u); const b = bkFitBox(n, o.w, o.h); const W = n ? b.w : o.w, H = n ? b.h : Math.round(o.w * 1.2);
  return `<div class="a" style="left:${o.x - W / 2 - 14}px;top:${o.y - H / 2 - 14}px;padding:14px 14px 0;background:#FFFFFF;box-shadow:0 18px 40px rgba(28,19,16,.22);transform:rotate(${o.r || 0}deg);width:${W}px">
    ${u ? `<div class="img" data-slot="${o.slot}" style="width:${W}px;height:${H}px;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center"></div>` : `<div class="ph" data-slot="${o.slot}" style="width:${W}px;height:${H}px;background:${HL.pink};color:${HL.burg};font-size:18px">Artwork</div>`}
    <p style="${T_REG};font-size:${o.fs || 15}px;line-height:1.2;color:${HL.ink};opacity:.7;padding:10px 2px 14px;white-space:normal;overflow-wrap:anywhere">${esc(fdCred(x))}</p></div>`; }
const FDT = {
  /* cover A: the fund in focus. $500 large, the hook in Baskerville, the work pinned beside it */
  fundcover(o){ const x = o.x || {};
    return {bg: HL.burg, html: `${fdBrand(HL.white)}${ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
      <p class="a" style="left:64px;top:150px;${T_MED};font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:${HL.rose}">${esc(o.label)}</p>
      <p class="a" style="left:52px;top:190px;${T_MED};font-size:300px;line-height:1;letter-spacing:-.06em;color:${HL.white}">${esc(o.amt)}</p>
      <p class="a" style="left:64px;width:520px;top:540px;${BASK};font-size:64px;line-height:1.14;color:${HL.white}">${fdEm(o.head, HL.rose)}</p>
      <p class="a" style="left:64px;width:470px;top:${o.subTop || 800}px;${BASK};font-size:34px;line-height:1.4;color:${HL.pink}">${fdEm(o.sub || '', HL.white)}</p>
      ${fdPol(x, {x: 800, y: 860, w: 360, h: 460, r: 4, slot: o.slot, fs: 17})}
      <p class="a" style="left:64px;bottom:120px;${T_MED};font-size:36px;letter-spacing:-.01em;color:${HL.white}">${esc(o.meet)} <span style="color:${HL.rose}">&rarr;</span></p>
      <p class="a" style="left:64px;bottom:56px;${T_REG};font-size:24px;color:${HL.pink};opacity:.85">@artstoheartsproject</p>`}; },
  /* cover B: the fund's promise in a folder over the work (full bleed: a cover may crop) */
  foldcover(o){ const u = bkPic(o.slot, o.img); const tabs = ['The fund', 'The artist', "What's next"];
    return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div><div class="a" style="inset:0;background:rgba(20,9,12,.22)"></div>` : ''}
      ${fdBrand(HL.white)}${ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
      ${tabs.map((t, i) => `<div class="a" style="left:${80 + i * 314}px;top:236px;width:300px;height:84px;border-radius:22px 22px 0 0;background:${i ? '#8A2740' : HL.burg};display:flex;justify-content:center;padding-top:22px;box-sizing:border-box"><p style="${T_MED};font-size:21px;letter-spacing:.2em;text-transform:uppercase;color:${i ? HL.pink : HL.white}">${esc(t)}</p></div>`).join('')}
      <div class="a" style="left:80px;right:80px;top:306px;bottom:330px;background:${HL.burg};border-radius:0 26px 26px 26px;box-shadow:0 30px 70px rgba(20,9,12,.4);padding:64px 72px;box-sizing:border-box;display:flex;flex-direction:column;gap:26px">
        <p style="${T_MED};font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:${HL.pink}">ATH Creative Fund</p>
        <p style="${BASK};font-size:84px;line-height:1.06;letter-spacing:-.015em;color:${HL.white}">${fdEm(o.head, HL.rose)}</p>
        <p style="${BASK};font-size:36px;line-height:1.38;color:${HL.pink}">${fdEm(o.sub, HL.white)}</p>
        <div style="margin-top:auto;border-top:1px solid rgba(250,210,225,.3);padding-top:26px">
          <p style="${T_MED};font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:${HL.rose}">${esc(o.kicker)}</p>
          <p style="${T_MED};font-size:76px;line-height:1;letter-spacing:-.04em;color:${HL.white};margin-top:14px">${esc(o.name)}</p></div></div>
      <p class="a" style="left:80px;bottom:280px;${T_REG};font-size:20px;color:${HL.white};opacity:.9">Artwork: ${esc(o.credit || '')}</p>
      ${fdFoot(HL.white, HL.white, HL.burg)}`}; },
  /* the announcement cover: the work full bleed (a cover may crop), the name set large, one line of who they are */
  hero(o){ const u = bkPic(o.slot, o.img); const nm = String(o.name || ''); const sp = nm.lastIndexOf(' '); const L = sp > 0 ? [nm.slice(0, sp), nm.slice(sp + 1)] : [nm]; const fs = Math.min(170, Math.floor(960 / (Math.max(...L.map(l => l.length)) * .52)));
    return {bg: HL.ink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div>` : `<div class="a ph" data-slot="${o.slot}" style="inset:0;background:${HL.burg};color:${HL.pink}">Their artwork</div>`}
      ${fdBrand(HL.white)}${o.mono === false ? '' : ivMono('white', 'right:52px;top:36px;width:112px;height:63px')}
      <div class="a" style="left:64px;right:64px;bottom:96px;display:flex;flex-direction:column;gap:22px;text-shadow:0 2px 18px rgba(20,9,12,.55),0 1px 3px rgba(20,9,12,.45)">
        <p style="${T_MED};font-size:24px;letter-spacing:.22em;text-transform:uppercase;color:${HL.rose}">${esc(o.label)}</p>
        <p style="${T_MED};font-size:${fs}px;line-height:.9;letter-spacing:-.045em;color:${HL.white}">${L.map(esc).join('<br>')}</p>
        ${o.sub ? `<p style="${BASK};font-style:italic;font-size:40px;line-height:1.25;color:${HL.white}">${esc(o.sub)}</p>` : ''}</div>`}; },
  /* the work whole and large on white, the credit right under it */
  plate(o){ const x = o.x || {}; const u = bkPic(o.slot, x.art); const n = fdNat(u); const top = o.label ? (String(o.label).length > 34 ? 290 : 230) : 130; const b = bkFitBox(n, 940, 1350 - top - 250); const W = n ? b.w : 800, H = n ? b.h : 900;
    return {bg: HL.white, html: `${fdBrand()}
      ${o.label ? `<p class="a" style="left:70px;right:70px;top:120px;${BASK};font-size:44px;line-height:1.2;color:${HL.ink}">${fdEm(o.label, HL.burg)}</p>` : ''}
      ${u ? `<div class="a img" data-slot="${o.slot}" style="left:${540 - W / 2}px;top:${top}px;width:${W}px;height:${H}px;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center"></div>` : `<div class="a ph" data-slot="${o.slot}" style="left:140px;right:140px;top:${top}px;height:${H}px;background:${HL.pink};color:${HL.burg}">Their artwork</div>`}
      <div class="a" style="left:${540 - W / 2}px;width:${Math.max(W, 520)}px;top:${top + H + 26}px;display:flex;flex-direction:column;gap:6px">
        <p style="${T_MED};font-size:30px;color:${HL.ink}">${esc(x.name || '')}${x.handle ? ` <span style="${T_REG};color:${HL.burg}">${esc(x.handle)}</span>` : ''}</p>
        ${x.title ? `<p style="${BASK};font-style:italic;font-size:26px;color:rgba(28,19,16,.56)">${esc(x.title)}${x.medium ? `<span style="font-style:normal">, ${esc(x.medium.toLowerCase())}</span>` : ''}</p>` : ''}</div>`}; },
  /* story frames: the artist's own, and ours */
  kit(o){ const x = o.x || {}; const u = bkPic(o.slot, x.art); const n = fdNat(u); const b = bkFitBox(n, 780, 900); const W = n ? b.w : 700, H = n ? b.h : 820; const mine = o.kind === 'artist';
    return {h: 1920, bg: mine ? HL.burg : HL.pink, html: `<p class="a cn" style="left:60px;top:120px;color:${mine ? HL.white : HL.burg}">Arts to Hearts Project</p>
      <div class="a" style="left:${540 - W / 2 - 24}px;top:240px;width:${W + 48}px;height:${H + 110}px;background:${HL.white};box-shadow:0 30px 60px rgba(20,9,12,.3)"></div>
      ${u ? `<div class="a img" data-slot="${o.slot}" style="left:${540 - W / 2}px;top:264px;width:${W}px;height:${H}px;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center"></div>` : ''}
      <p class="a" style="left:${540 - W / 2}px;width:${W}px;top:${264 + H + 22}px;${T_REG};font-size:22px;color:rgba(28,19,16,.7)">${esc(fdCred(x))}</p>
      <div class="a" style="left:70px;right:70px;top:${240 + H + 160}px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:12px">
        <p style="${BASK};font-style:italic;font-size:48px;color:${mine ? HL.rose : HL.burg}">${esc(o.kicker)}</p>
        <p style="${T_MED};font-size:76px;line-height:.98;letter-spacing:-.035em;color:${mine ? HL.white : HL.ink}">${esc(o.head)}</p>
        ${o.sub ? `<p style="${T_REG};font-size:30px;line-height:1.35;color:${mine ? HL.pink : HL.burg};margin-top:10px">${esc(o.sub)}</p>` : ''}</div>
      <div class="a zone" style="left:240px;right:240px;top:1760px;height:80px;border:2px dashed ${mine ? HL.pink : HL.burg};border-radius:24px;opacity:.6;display:flex;align-items:center;justify-content:center;${T_MED};font-size:24px;color:${mine ? HL.pink : HL.burg}">${esc(o.zone)}</div>`}; },
  /* letters cut out of the paper, the work showing through (a cover may crop) */
  cut(o){ const u = bkPic(o.slot, o.img); const L = o.lines; const fs = o.fs || Math.min(520, Math.floor(1000 / (Math.max(...L.map(l => l.length)) * .55)));
    return {bg: o.white ? HL.white : HL.pink, html: `${fdBrand()}${ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px')}
      <div class="a" style="left:20px;right:20px;top:${o.top || 140}px;display:flex;flex-direction:column;align-items:center">${L.map(l => `<p class="img" data-slot="${o.slot}" style="${T_MED};font-size:${fs}px;line-height:.84;letter-spacing:-.06em;white-space:nowrap;color:${u ? 'transparent' : HL.burg};${u ? `background-image:url(${u});background-size:cover;background-position:center;-webkit-background-clip:text;background-clip:text;` : ''}">${esc(l)}</p>`).join('')}</div>
      <div class="a" style="left:60px;right:60px;bottom:${o.credit ? 120 : 90}px;display:flex;flex-direction:column;gap:14px">
        ${o.pill ? `<div>${fdPill(40)}</div>` : o.label ? `<p style="${T_MED};font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:${HL.burg}">${esc(o.label)}</p>` : ''}
        ${o.sub ? `<p style="${BASK};font-size:44px;line-height:1.25;color:${HL.ink}">${fdEm(o.sub, HL.burg)}</p>` : ''}</div>
      ${o.credit ? `<p class="a" style="left:60px;bottom:60px;${T_REG};font-size:20px;color:${HL.ink};opacity:.6">Artwork: ${esc(o.credit)}</p>` : ''}`}; },
  /* the folder: tabs on top (the chapters), one idea inside */
  folder(o){ const tabs = o.tabs || [], on = o.tab; const tw = Math.min(300, (920 - (tabs.length - 1) * 14) / Math.max(1, tabs.length)); const u = o.photo ? bkPic(o.slot, o.photo) : '';
    const top = o.photo ? 330 : 250, bot = o.photo ? 300 : 170;
    return {bg: HL.pink, html: `${u ? `<div class="a img" data-slot="${o.slot}" style="inset:0;background-image:url(${u});background-size:cover;background-position:center"></div><div class="a" style="inset:0;background:rgba(28,19,16,.18)"></div>` : ''}
      ${fdBrand(u ? HL.white : HL.burg)}${o.mono ? ivMono(u ? 'white' : 'burgundy', 'right:52px;top:36px;width:112px;height:63px') : ''}
      ${tabs.map((t, i) => `<div class="a" style="left:${80 + i * (tw + 14)}px;top:${top - 70}px;width:${tw}px;height:84px;border-radius:22px 22px 0 0;background:${t === on ? HL.burg : '#8A2740'};display:flex;align-items:flex-start;justify-content:center;padding-top:22px;box-sizing:border-box"><p style="${T_MED};font-size:21px;letter-spacing:.2em;text-transform:uppercase;color:${t === on ? HL.white : HL.pink};opacity:${t === on ? 1 : .8}">${esc(t)}</p></div>`).join('')}
      <div class="a" style="left:80px;right:80px;top:${top}px;bottom:${bot}px;background:${HL.burg};border-radius:${tabs.length ? '0 0' : '22px 22px'} 26px 26px;box-shadow:0 30px 60px rgba(28,19,16,.25);padding:${o.photo ? 70 : 80}px 76px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;align-items:${o.center ? 'center' : 'flex-start'};text-align:${o.center ? 'center' : 'left'};gap:30px">
        ${o.kicker ? `<p style="${T_MED};font-size:22px;letter-spacing:.22em;text-transform:uppercase;color:${HL.pink}">${esc(o.kicker)}</p>` : ''}
        ${o.head ? `<p style="${BASK};font-size:${o.headSz || 92}px;line-height:1.04;letter-spacing:-.015em;color:${HL.white}">${o.head.map(h => fdEm(h, HL.rose)).join('<br>')}</p>` : ''}
        ${o.body ? `<p style="${BASK};font-size:${o.body.length > 300 ? 36 : o.body.length > 180 ? 42 : 48}px;line-height:1.36;color:${HL.white}">${fdEm(o.body, HL.rose)}</p>` : ''}
        ${o.rows ? `<div style="width:100%;display:flex;flex-direction:column">${o.rows.map(rw => `<div style="display:flex;align-items:baseline;gap:30px;padding:${o.rows.length > 4 ? 20 : 28}px 0;border-top:1px solid rgba(250,210,225,.28)"><p style="${T_MED};font-size:${o.rowSz || 30}px;line-height:1.1;color:${HL.rose};min-width:${o.rowW || 240}px;flex:none">${esc(rw[0])}</p><p style="${BASK};font-size:${o.rowTx || 32}px;line-height:1.35;color:${HL.white}">${fdEm(rw[1], HL.rose)}</p></div>`).join('')}</div>` : ''}
        ${o.foot ? `<p style="${T_REG};font-size:26px;line-height:1.45;color:${HL.pink};opacity:.9">${fdEm(o.foot, HL.white)}</p>` : ''}</div>
      ${o.credit ? `<p class="a" style="left:80px;bottom:${bot - 52}px;${T_REG};font-size:20px;color:${HL.white};opacity:.85">Artwork: ${esc(o.credit)}</p>` : ''}
      ${fdFoot(u ? HL.white : HL.burg, u ? HL.white : HL.burg, u ? HL.burg : HL.white)}`}; },
  /* a wall of words, the work framed over it */
  wall(o){ const n = o.words.length; const fs = o.fs || (n > 90 ? 78 : n > 60 ? 90 : 104);
    const k = (o.works || []).length; const spots = o.spots || (k >= 3 ? [{x: 220, y: 930, r: -4}, {x: 540, y: 880, r: 2}, {x: 860, y: 950, r: -2}] : k === 2 ? [{x: 330, y: 920, r: -3}, {x: 760, y: 900, r: 3}] : [{x: 540, y: 900, r: 2}]);
    return {bg: HL.white, html: `${fdBrand()}${o.mono ? ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px') : ''}
      <p class="a" style="left:52px;right:40px;top:120px;${T_MED};font-size:${fs}px;line-height:1.02;letter-spacing:-.03em;text-transform:uppercase;color:${HL.ink}">${fdEm(o.words, HL.burg)}</p>
      ${o.pill ? `<div class="a" style="left:52px;bottom:120px">${fdPill(36)}</div>` : ''}
      ${(o.works || []).slice(0, spots.length).map((x, i) => fdPol(x, {...spots[i], w: o.pw || (k >= 3 ? 280 : 360), h: o.ph || 360, slot: (o.slot || 'fdwall') + i})).join('')}
      ${fdFoot()}`}; },
  /* the cycle on a calendar: the days that matter marked, the work pinned on the others */
  cal(o){ const d = o.month, y = d.getFullYear(), m = d.getMonth(); const first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate(); const rows = Math.ceil((first + days) / 7);
    const cw = 900 / 7, top = 520, rh = Math.min(140, 600 / rows); const marks = o.marks || {}; const cells = [];
    for (let k = 1; k <= days; k++) { const i = first + k - 1, cx = 90 + (i % 7) * cw + cw / 2, cy = top + Math.floor(i / 7) * rh + 40; const mk = marks[k];
      cells.push(mk ? `<div class="a" style="left:${cx - 46}px;top:${cy - 46}px;width:92px;height:92px;border-radius:50%;background:${HL.burg};display:flex;align-items:center;justify-content:center;${T_MED};font-size:42px;color:${HL.white}">${k}</div><p class="a c" style="left:${cx - 100}px;width:200px;top:${cy + 50}px;${T_MED};font-size:22px;letter-spacing:.1em;text-transform:uppercase;color:${HL.burg}">${esc(mk)}</p>`
        : `<p class="a c" style="left:${cx - 40}px;width:80px;top:${cy - 24}px;${T_MED};font-size:38px;color:${(i % 7) > 4 ? 'rgba(28,19,16,.4)' : HL.ink}">${k}</p>`); }
    const free = []; for (let k = 1; k <= days; k++) if (!marks[k] && !Object.keys(marks).some(x => Math.abs(x - k) < 2 || Math.abs(x - k - 7) < 2)) free.push(k);   /* a polaroid hangs over the row below, so it never sits above a marked day */
    const want = Math.min(3, (o.works || []).length), chosen = []; [[1, 5], [3, 1], [5, 4], [2, 3], [4, 6], [0, 2]].forEach(([rw, col]) => { if (chosen.length >= want) return; const k = rw * 7 + col - first + 1; if (k >= 1 && k <= days && free.includes(k) && rw < rows) chosen.push(k); });
    for (const k of free) { if (chosen.length >= want) break; if (!chosen.some(q => Math.abs(q - k) < 4)) chosen.push(k); }
    const pins = (o.works || []).slice(0, chosen.length).map((x, j) => { const k = chosen[j]; const i = first + k - 1; return fdPol(x, {x: Math.min(860, Math.max(220, 90 + (i % 7) * cw + cw / 2)), y: Math.min(1040, top + Math.floor(i / 7) * rh + 60), w: 200, h: 210, r: [-5, 4, -2, 6][j], slot: 'fdcal' + j, fs: 13}); });
    return {bg: HL.pink, html: `${fdBrand()}
      <div class="a" style="left:60px;right:60px;top:120px;bottom:120px;background:${HL.white};border-radius:30px;box-shadow:0 24px 60px rgba(106,6,32,.14)"></div>
      <p class="a" style="left:100px;top:160px;${T_REG};font-size:30px;color:${HL.burg}">&lsaquo; ${esc(o.kicker || String(y))}</p>
      <p class="a" style="left:100px;top:220px;${T_MED};font-size:104px;line-height:1;letter-spacing:-.04em;color:${HL.ink}">${esc(o.title || MONTHS_FULL[m])}</p>
      ${o.sub ? `<p class="a" style="left:100px;right:100px;top:336px;${T_MED};font-size:34px;line-height:1.22;letter-spacing:-.01em;color:${HL.ink}">${fdEm(o.sub, HL.burg)}</p>` : ''}
      ${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((t, i) => `<p class="a c" style="left:${90 + i * cw}px;width:${cw}px;top:452px;${T_MED};font-size:22px;color:${i > 4 ? 'rgba(28,19,16,.4)' : HL.ink}">${t}</p>`).join('')}
      <div class="a" style="left:60px;right:60px;top:494px;border-top:1px solid rgba(28,19,16,.14)"></div>
      ${Array.from({length: rows - 1}, (_, r2) => `<div class="a" style="left:60px;right:60px;top:${top + (r2 + 1) * rh - 6}px;border-top:1px solid rgba(28,19,16,.08)"></div>`).join('')}
      ${cells.join('')}${pins.join('')}
      ${fdFoot()}`}; },
  /* the recap circle: the work around a title, labelled like files; folders for what is still to come */
  ring(o){ const items = o.items.slice(0, 6); const pos = [[290, 300], [790, 290], [860, 700], [780, 1070], [290, 1080], [210, 700]];
    const folderIc = (x, y, label) => `<div class="a" style="left:${x - 70}px;top:${y - 50}px;width:140px;display:flex;flex-direction:column;align-items:center;gap:10px"><div style="position:relative;width:132px;height:96px"><div style="position:absolute;left:0;top:0;width:58px;height:22px;border-radius:8px 8px 0 0;background:#E98AAE"></div><div style="position:absolute;left:0;top:14px;width:132px;height:82px;border-radius:0 10px 10px 10px;background:${HL.rose}"></div></div><p style="${T_REG};font-size:20px;color:${HL.ink};white-space:nowrap">${esc(label)}</p></div>`;
    return {bg: HL.white, html: `${fdBrand()}${ivMono('burgundy', 'right:52px;top:36px;width:112px;height:63px')}
      ${items.map((x, i) => { const [px, py] = pos[i]; if (x.folder) return folderIc(px, py, x.folder); const u = bkPic('fdring' + i, x.art); const n = fdNat(u); const b = bkFitBox(n, i % 3 === 2 ? 230 : 300, 270); const W = n ? b.w : 240, H = n ? b.h : 270;
        return `<div class="a" style="left:${px - W / 2}px;top:${py - H / 2 - 20}px;width:${W}px">${u ? `<div class="img" data-slot="fdring${i}" style="width:${W}px;height:${H}px;background-image:url(${u});background-size:contain;background-repeat:no-repeat;background-position:center;box-shadow:0 10px 24px rgba(28,19,16,.16)"></div>` : `<div class="ph" data-slot="fdring${i}" style="width:${W}px;height:${H}px;background:${HL.pink};color:${HL.burg};font-size:16px">Artwork</div>`}
          <p style="${T_REG};font-size:18px;line-height:1.25;color:${HL.ink};text-align:center;margin-top:12px">${esc(x.label || fdCred(x))}</p>${x.sub ? `<p style="${T_REG};font-size:16px;line-height:1.25;color:${HL.burg};text-align:center;margin-top:2px">${esc(x.sub)}</p>` : ''}</div>`; }).join('')}
      <div class="a" style="left:330px;right:330px;top:${o.pill ? 500 : 590}px;display:flex;flex-direction:column;align-items:center;text-align:center">${o.pill ? `<div style="margin-bottom:34px">${fdPill(30)}</div>` : ''}
        <p style="${T_MED};font-size:${o.fs || 84}px;line-height:.98;letter-spacing:-.045em;color:${HL.ink};white-space:nowrap">${esc(o.title[0])}</p>
        <p style="${T_MED};font-size:${o.fs || 84}px;line-height:.98;letter-spacing:-.045em;color:${HL.ink};white-space:nowrap;outline:2px solid ${HL.burg};outline-offset:8px;position:relative">${esc(o.title[1] || '')}<svg style="position:absolute;right:-48px;bottom:-56px" width="40" height="52" viewBox="0 0 20 26"><path d="M2 1 L2 20 L7 15 L10.5 23 L13.5 21.6 L10 14 L17 14 Z" fill="${HL.white}" stroke="${HL.ink}" stroke-width="1.6" stroke-linejoin="round"/></svg></p>
        ${o.sub ? `<p style="${BASK};font-size:28px;line-height:1.35;color:${HL.ink};opacity:.75;margin-top:44px">${fdEm(o.sub, HL.burg)}</p>` : ''}</div>`}; },
};
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/* every recipient up to this cycle, and the pool of work we may show (recipients and the work that stayed with us; shared with credit, as the grant terms allow) */
function fdRecips(r){ return fdRounds().filter(x => x.id <= r.id && x.winner && x.winner.name).map(x => ({r: x, w: x.winner})); }
function fdPool(r){ const out = [], seen = new Set(); const add = x => { if (x && x.art && !seen.has(x.art)) { seen.add(x.art); out.push(x); } };
  fdRecips(r).reverse().forEach(({w}) => { add(w); if (w.art2) add({...w, art: w.art2, title: w.title2 || ''}); });
  fdRounds().filter(x => x.id <= r.id).reverse().forEach(x => (x.found || []).forEach(add)); return out; }

function fundGroups(){
  const v = FUNDVIEW; const r = v && FUND && FUND[v.round]; if (!r) return [];
  const KW = (r.keyword || 'FUND').toUpperCase(), amt = r.amount || '$500', w = r.winner || {}, first = fdFirst(w.name), nx = fdNextR(r);
  const o = fdDate(r.opens), c = fdDate(r.closes), a = fdDate(r.announce), cl = fdDay(c), an = fdDay(a), cy = fdName(r), ncl = fdDay(fdDate(nx.closes)); const SC = !!r.showCycle; const G = x => SC ? fdName(x) : (d => MONTHS_FULL[d.getMonth()] + ' ' + d.getFullYear())(fdDate(x.announce) || new Date()); const cyG = SC ? ' · ' + cy : '';
  const P = fdPool(r), pick = (k, n) => Array.from({length: n}, (_, i) => P[(k + i) % Math.max(1, P.length)]).filter(Boolean);
  const credits = {}; P.forEach(x => credits[x.art] = {text: fdCred(x), artist: x.name, title: x.title});
  const end = (head, foot) => BKT.keyEnd({head, key: KW, offer: `Comment ${KW} and we'll send you the link to apply.`, foot});
  const ask = `Comment ${KW} and we'll send you the link to apply.`;
  const T3 = ['What it is', "Who it's for", 'How to apply'];
  const calCycle = (sub, works) => FDT.cal({month: c, kicker: 'ATH Creative Fund', title: MONTHS_FULL[c.getMonth()], sub, marks: {[c.getDate()]: 'Deadline', [a.getDate()]: 'Announced'}, works});
  const tags = '#ATHCreativeFund #artstoheartsproject #artistgrant #supportartists #artistsoninstagram';
  let S = [], cap = '', head = '';
  if (v.id === 'launch') { head = 'The fund is open'; const cov = P[0];
    S = [FDT.cut({lines: [amt], img: cov && cov.art, slot: 'fdcut', top: 380, label: 'ATH Creative Fund' + cyG, sub: 'To one artist, every month. **No receipts. No reports.**', credit: cov && fdCred(cov)}),
      FDT.folder({tabs: T3, tab: 'What it is', kicker: 'A monthly artist grant', head: ['An unrestricted', `**${amt}** grant.`], body: 'Awarded to one artist every month. Use it for whatever your practice needs.'}),
      FDT.wall({words: 'Paint & canvas. Paper & ink. Film. Camera gear. Studio rent. Courses. Framing. **Time to create.**', works: pick(1, 3)}),
      FDT.folder({tabs: T3, tab: "Who it's for", rows: [['Visual art', 'Painting, drawing, illustration, digital art, mixed media, collage and printmaking.'], ['Photography', 'Any subject, any style, any camera, including your phone.'], ['Creative writing', 'Poetry, short stories, flash fiction and personal essays.']], rowW: 250, foot: '18 or older, anywhere in the world, at any career stage. **Free to apply.**'}),
      FDT.folder({tabs: T3, tab: 'How to apply', rows: [['Your work', 'Choose one piece that you made, new or already shared.'], ['Your post', 'Share it publicly on Instagram. Tag **@artstoheartsproject** on the image and add **#ATHCreativeFund**.'], ['The form', 'Your post link, your work sample and a few lines about your practice.']], rowW: 200, foot: 'Three steps. About ten minutes.'}),
      calCycle(`Applications close **${cl}** at 11:59 PM. We announce the recipient on **${an}**.`, pick(4, 3)),
      end(`One artist. ${amt}. Every month.`)];
    cap = `$500 to one artist. No receipts, no reports.\n\nThe ATH Creative Fund is open: an unrestricted ${amt} grant, awarded to one artist every month. Paint, film, studio rent, a course, framing, or simply time to create. It's yours to spend on whatever your practice needs.\n\nFor visual artists, photographers and writers, 18 or older, anywhere in the world. Free to apply.\n\nHow to apply:\n1. Choose one piece you made.\n2. Post it publicly on Instagram, tag @artstoheartsproject on the image and add #ATHCreativeFund.\n3. Fill in the form with your post link.\n\nApplications close ${cl}, 11:59 PM. We announce the recipient on ${an}.\n\n${ask}`; }
  else if (v.id === 'why') { head = 'Why we started the fund';
    S = [FDT.wall({words: `We're investing in artists. **One every month.**`, works: pick(0, 3)}),
      FDT.folder({tabs: ['Why', 'What', 'For whom'], tab: 'Why', head: ['Artists built', 'this community.'], body: 'For years, artists have trusted us with their work. Their paintings, photographs and poems have filled our books, our magazine and our Instagram. **This is us giving back.**'}),
      FDT.folder({tabs: ['Why', 'What', 'For whom'], tab: 'What', kicker: 'The fund in numbers', rows: [[amt, 'to one artist, every month'], ['12', 'artists funded every year'], ['$6,000', 'given directly to artists each year'], ['$0', 'to apply, and no reports to file']], rowSz: 64, rowW: 260, rowTx: 34}),
      FDT.wall({words: 'Judged on the work alone. **Not followers, not degrees, not where you live.**', works: pick(3, 2), spots: [{x: 790, y: 860, r: 3}, {x: 300, y: 1040, r: -4}]}),
      FDT.folder({tabs: ['Why', 'What', 'For whom'], tab: 'What', kicker: "What the fund isn't", rows: [['A competition', 'No theme, no brief, no public voting.'], ['A commission', "We won't ask you to make anything for us."], ['A loan', 'Nothing to pay back, no reports.'], ['Tied to us', 'No call entry, book purchase or past work with ATH needed.']], rowW: 230}),
      FDT.folder({tabs: ['Why', 'What', 'For whom'], tab: 'For whom', kicker: 'What the recipient receives', rows: [[amt, 'paid directly, unrestricted.'], ['A feature', 'A full interview about your work and process, published on artstoheartsproject.com.'], ['A title', "ATH Creative Fund recipient, yours to use in your bio and CV."]], rowW: 200}),
      end(`Applications close ${cl}.`, 'Reviewed by people, not an algorithm.')];
    cap = `We're investing in artists, one every month.\n\nArtists built this community. For years, they have trusted us with their paintings, photographs and poems. The ATH Creative Fund is how we give some of that back: ${amt} every month, straight to one artist, to spend on their practice.\n\nNot a competition. Not a commission. Not a loan. Judged on the work alone: not followers, not degrees, not where you live.\n\nThe recipient gets ${amt}, a full feature on our website, and a title that's theirs to keep.\n\nApplications close ${cl}. ${ask}`; }
  else if (v.id === 'guide') { head = 'Before you apply'; const G = ['Your work', 'Your post', 'Your words'];
    S = [FDT.folder({tabs: G, tab: 'Your work', photo: (P[2] || P[0] || {}).art, slot: 'fdgp', mono: true, center: true, head: ['Before you', 'apply'], foot: 'How we read every application, and how to make yours count.', credit: fdCred(P[2] || P[0])}),
      FDT.wall({words: 'A personal voice. Care and intention. **Lasting impact.**', works: pick(0, 3)}),
      FDT.folder({tabs: G, tab: 'Your work', kicker: 'What we look for', rows: [['A personal voice', 'Work that feels unmistakably yours.'], ['Care and intention', 'Work made with thought, at any skill level.'], ['Lasting impact', "Work we keep thinking about after we've seen it."]], rowW: 300, foot: 'Pick the one piece that best represents your practice. New or already shared, as long as you made it.'}),
      FDT.folder({tabs: G, tab: 'Your post', head: ['Tag us on', 'the image itself.'], body: 'Post it publicly with **#ATHCreativeFund**, and follow us so you don\'t miss our message if you\'re selected. Writers: a photo of the page or a simple text graphic works.'}),
      FDT.folder({tabs: G, tab: 'Your words', head: ['No artist', 'statement needed.'], body: 'A few lines about your practice, in your own words. Tell us what you make and why. **Honest beats polished.**'}),
      FDT.folder({tabs: G, tab: 'Your words', kicker: 'Before you press send', head: ['Both, not one.'], body: 'An application is only complete with **the Instagram post and the form**. One without the other can\'t be considered.'}),
      end(`Applications close ${cl}, 11:59 PM.`)];
    cap = `Before you apply for the ATH Creative Fund, here is how we read every application.\n\nWe look for three things: a personal voice, care and intention, and lasting impact. Follower counts, likes and formal training play no part.\n\nYour work: one piece that best represents your practice.\nYour post: public, @artstoheartsproject tagged on the image, #ATHCreativeFund.\nYour words: a few honest lines about your practice. No artist statement needed.\n\nAnd remember: both the post and the form, not one.\n\nApplications close ${cl}. ${ask}`; }
  else if (v.id === 'record') { const R = fdRecips(r).filter(x => x.r.id !== r.id); head = 'The fund so far';
    const RI = R.slice(-5).map(x => ({...x.w, label: x.w.name, sub: `${x.w.title} · ${G(x.r)}`})); const FI = fdRounds().filter(x => x.id < r.id).flatMap(x => (x.found || []).filter(y => y.art).map(y => ({...y, label: y.name, sub: y.title}))); const ringI = [...RI, ...FI].slice(0, 5); ringI.splice(Math.min(3, ringI.length), 0, {folder: fdName(r).toLowerCase().replace(' ', '-')});
    S = [FDT.ring({title: ['The fund', 'so far'], items: ringI, sub: `${R.length === 1 ? 'One artist' : R.length + ' artists'} funded. ${amt} each, no receipts, no reports.`}),
      ...R.slice(-4).flatMap(x => [BKT.feature({w: fdW(x.w, 'fdrw' + x.r.id), slot: 'fdrw' + x.r.id, line: ''}),
        FDT.folder({tabs: R.slice(-3).map(y => G(y.r)), tab: G(x.r), kicker: x.w.name, head: x.w.q3 || x.w.plan ? null : ['Funded in', G(x.r) + '.'], body: x.w.q3 || x.w.plan ? `“${bkCut(x.w.q3 || x.w.plan, 260)}”` : (x.w.about || ''), foot: 'What the grant makes possible, in their words.'})]),
      calCycle(`Applications close **${cl}**. The next name on this list could be yours.`, pick(0, 3)),
      end('Every month, one more artist.')];
    cap = `The ATH Creative Fund, so far.\n\n${R.map(x => `${fdName(x.r)}: ${x.w.name}${x.w.handle ? ' ' + x.w.handle : ''}`).join('\n')}\n\nEvery month, one more artist gets ${amt} for their practice. No receipts, no reports.\n\n${cy} closes ${cl}. ${ask}`; }
  else if (v.id === 'week') { head = 'One week left';
    S = [calCycle(`**One week left.** Applications close ${cl} at 11:59 PM.`, pick(0, 4)),
      FDT.folder({tabs: ['Eligible?'], tab: 'Eligible?', kicker: 'Five ticks and you can apply', rows: [['✓', "I'm 18 or older."], ['✓', 'I make visual art, photography or creative writing.'], ['✓', 'I have one original work sample that I made myself.'], ['✓', "My work isn't fan art, a logo or a licensed character."], ['✓', 'I can share it on a public Instagram account.']], rowSz: 34, rowW: 40}),
      FDT.wall({words: `About ten minutes could mean **${amt}** for your practice.`, works: pick(4, 3)}),
      end(`Applications close ${cl}.`, 'Both the post and the form.')];
    cap = `One week left to apply for the ATH Creative Fund.\n\nFive ticks and you're eligible: 18 or older, visual art, photography or writing, one original work sample, no fan art or logos, and a public Instagram account.\n\nAbout ten minutes could mean ${amt} for your practice. Applications close ${cl}, 11:59 PM. ${ask}`; }
  else if (v.id === 'winner') { const R = fdRecips(r); const isFirst = R.length && R[0].r.id === r.id; const W3 = ['The artist', 'The work', 'The grant'];
    head = w.name ? (isFirst ? `Our first Creative Fund artist: ${w.name}` : `Meet ${w.name}`) : 'Meet the recipient';
    const F = fdRounds().filter(x => x.id <= r.id).flatMap(x => (x.found || []).filter(y => y.art)); const who = w.who || (w.country ? `an artist from ${w.country}` : 'an artist');
    if (!w.name) S = [FDT.folder({tabs: W3, tab: 'The artist', head: ['Add the', 'recipient first'], body: 'Open the Recipient tab: name, handle, work, photo, why we chose them, their own words.'})];
    else { const nxo = fdDay(fdDate(nx.opens)); const aboutLine = bkFirst(w.about || '');
      const ck = ['cut', 'ring', 'wall'].includes(v.cover || r.cover) ? (v.cover || r.cover) : 'cut';
      const cover = ck === 'ring' ? FDT.ring({title: isFirst ? ['Our first', 'fund artist'] : ['This month\'s', 'fund artist'], items: [{...w, label: w.name, sub: w.title}, ...F.slice(0, 3).map(x => ({...x, label: x.name, sub: x.title})), {folder: 'creative-fund'}, {folder: 'applications'}], sub: `**${w.name}**, ${who}, receives our **${amt}** grant for their practice.`, pill: true, fs: 72})
        : ck === 'wall' ? FDT.wall({mono: true, pill: true, words: isFirst ? `Our first ${amt} grant goes to **${w.name}**, ${who}.` : `This month's ${amt} grant goes to **${w.name}**, ${who}.`, works: [F[0], w, F[1]].filter(Boolean), pw: 300, ph: 360})
        : FDT.cut({white: true, lines: isFirst ? ['The', 'first'] : ['Meet', first], img: w.art, slot: 'fdcut', fs: isFirst ? 400 : 330, top: 120, pill: true, sub: `${isFirst ? 'Our first' : 'This month\'s'} Creative Fund artist: **${w.name}**, ${who}. ${amt} for their practice, no receipts, no reports.`, credit: fdCred(w)});
      const plateTalk = (x, i) => FDT.plate({x, slot: 'fdlv' + i, label: x.line ? `**${x.name}.** ${x.line}` : i ? `And **${x.name}'s** ${x.title || 'work'}, which none of us could stop talking about.` : `We kept coming back to **${x.name}'s** ${x.title || 'work'}.`});
      S = [cover,
        FDT.folder({tabs: ['The fund', 'The artist', "What's next"], tab: 'The fund', kicker: 'Why we started this fund', head: ['Because artists', '**built us.**'], headSz: 80, body: `Everything Arts to Hearts is today, artists made possible. The Creative Fund is how we invest back: every month, **${amt}** goes straight into one artist's practice. Paint, film, studio rent, a course, or simply time to create. No receipts, no reports.`}),
        F.length >= 2 ? FDT.wall({words: isFirst ? 'In October we asked what $500 would change for your practice. **Hundreds of you answered.**' : 'We asked again. **Hundreds of you answered.**', works: F.slice(0, 3), pw: 320, ph: 370}) : null,
        BKT.htext({text: 'Behind every submission is someone making work around everything else. Early mornings, borrowed corners, paint bought a little at a time. We wanted to give one of those months a little more room.'}),
        FDT.plate({x: w, slot: 'fdpl1', label: isFirst ? 'One piece stayed with us longer than any other.' : 'One piece stayed with us.'}),
        w.face && FDT.hero({img: w.face, slot: 'fdpor', mono: false, label: 'Meet the artist', name: w.name, sub: aboutLine}),
        w.why && FDT.folder({tabs: W3, tab: 'The work', kicker: `Why we chose ${first}`, body: w.why}),
        (w.plan || w.q3) && BKT.say({slot: 'fdws', face: w.face || w.art, q: w.plan || w.q3, name: w.name, handle: w.handle}),
        FDT.folder({tabs: W3, tab: 'The grant', kicker: `What ${first} receives`, rows: [[amt, 'unrestricted. No receipts, no reports.'], ['A feature', 'a full interview on artstoheartsproject.com, coming soon.'], ['A title', 'ATH Creative Fund artist, theirs to keep in their bio and CV.']], rowW: 200}),
        F.length >= 2 ? FDT.ring({title: ['Work we', 'loved'], items: F.slice(0, 5).map(x => ({...x, label: x.name, sub: x.title})).concat([{folder: 'next-cycle'}]), sub: 'Choosing one was the hardest part. **These stayed with us too.**'}) : null,
        ...F.slice(0, 2).map(plateTalk),
        isFirst ? FDT.folder({tabs: W3, tab: 'The grant', head: ['The first name.', '**Not the last.**'], body: `Every month, one more artist. The next round opened on ${nxo}, and the next name could be yours.`})
          : R.length > 1 ? FDT.ring({title: ['The fund', 'so far'], items: R.slice(-6).map(x => ({...x.w, label: x.w.name, sub: `${x.w.title} · ${G(x.r)}`})), fs: 84}) : null,
        FDT.cal({month: fdDate(nx.closes), kicker: 'ATH Creative Fund', title: MONTHS_FULL[fdDate(nx.closes).getMonth()], sub: `**The fund is open again.** Applications close ${ncl} at 11:59 PM.`, marks: {[fdDate(nx.closes).getDate()]: 'Deadline', [fdDate(nx.announce).getDate()]: 'Announced'}, works: [w, ...F.slice(2)].filter(Boolean).slice(0, 3)}),
        end(`Congratulations, ${first}. The next one could be you.`, `Go and say hello to ${w.handle || first}.`)]; }
    cap = w.name ? (isFirst ? `Our first ATH Creative Fund artist is here: ${w.name}${w.handle ? ' ' + w.handle : ''}, ${who}.\n\nArtists built Arts to Hearts. The Creative Fund is how we invest back: every month, ${amt} goes straight into one artist's practice. No receipts, no reports. Behind every submission is someone making work around everything else, and we wanted to give one of those months a little more room.\n\nIn October we asked what ${amt} would change for your practice. Hundreds of you answered. One piece stayed with us longer than any other.` : `This month's ATH Creative Fund artist: ${w.name}${w.handle ? ' ' + w.handle : ''}, ${who}.`)
      + `${w.why ? '\n\n' + w.why : ''}${w.plan || w.q3 ? `\n\nIn ${first}'s words: "${w.plan || w.q3}"` : ''}\n\nChoosing one was the hardest part. These stayed with us too: ${F.slice(0, 5).map(x => `${x.name}${x.handle ? ' ' + x.handle : ''}`).join(', ')}. Go and follow them.\n\n${isFirst ? 'The first name. Not the last. ' : ''}${fdName(nx)} is open now and closes ${ncl}. ${ask}\n\nCongratulations, ${first}. Say hello to ${w.handle || first} in the comments.` : ''; }
  else if (v.id === 'recap') { const F = (r.found || []).filter(x => x.name && x.art); head = cy + ' recap'; const RT = ['The recipient', 'Work we loved', "What's next"];
    S = [FDT.folder({tabs: RT, tab: 'Work we loved', photo: (F[0] || w).art, slot: 'fdrc', mono: true, center: true, head: [SC ? `The ${cy}` : `The ${MONTHS_FULL[(fdDate(r.closes) || new Date()).getMonth()]}`, 'Recap'], headSz: 104, credit: fdCred(F[0] || w)}),
      w.name && FDT.folder({tabs: RT, tab: 'The recipient', kicker: 'Our ' + G(r) + ' artist', head: [w.name + '.'], body: `${amt}, unrestricted, for whatever the practice needs.${w.plan ? ` In ${first}'s words: “${bkCut(w.plan, 160)}”` : ''}`}),
      F.length && FDT.ring({title: ['Work we', 'loved'], items: F.slice(0, 6).map(x => ({...x, label: x.name, sub: x.title}))}),
      r.stood && FDT.folder({tabs: RT, tab: 'Work we loved', kicker: 'What stood out this cycle', body: r.stood}),
      ...F.slice(0, 4).map((x, i) => BKT.feature({w: fdW(x, 'fdrf' + i), slot: 'fdrf' + i, line: bkCut(x.line || '', 120)})),
      FDT.cal({month: fdDate(nx.closes), kicker: 'ATH Creative Fund', title: MONTHS_FULL[fdDate(nx.closes).getMonth()], sub: `**The fund is open again.** Applications close ${ncl}.`, marks: {[fdDate(nx.closes).getDate()]: 'Deadline', [fdDate(nx.announce).getDate()]: 'Announced'}, works: pick(1, 3)}),
      end('Go and follow them. Then apply.')];
    cap = `${cy} of the ATH Creative Fund, in one folder.\n\n${w.name ? `The recipient: ${w.name}${w.handle ? ' ' + w.handle : ''}.\n\n` : ''}${r.stood ? r.stood + '\n\n' : ''}Work we loved this cycle:\n${F.map(x => `${x.title ? x.title + ' by ' : ''}${x.name}${x.handle ? ' ' + x.handle : ''}`).join('\n')}\n\nGo and follow them. ${fdName(nx)} is open now and closes ${ncl}. ${ask}`; }
  else if (v.id === 'feature') { head = 'In conversation'; const QA = [['Their work', w.q1], ['Their process', w.q2], ['What the grant makes possible', w.q3]].filter(x => x[1]); const I3 = ['Work', 'Process', 'The grant'];
    S = [FDT.cut({lines: ['In', 'conversation'], img: w.art2 || w.art, slot: 'fdfcut', fs: 190, top: 220, label: 'ATH Creative Fund' + cyG, sub: `With **${w.name || 'our recipient'}**.`, credit: fdCred(w.art2 ? {...w, title: w.title2 || ''} : w)}),
      ...QA.flatMap((x, i) => [FDT.folder({tabs: I3, tab: I3[i], kicker: x[0], body: `“${bkCut(x[1], 420)}”`, foot: w.name}), i === 0 && w.art ? BKT.feature({w: fdW(w, 'fdfw'), slot: 'fdfw', line: ''}) : i === 1 && w.face ? BKT.say({slot: 'fdfs', face: w.face, q: bkCut(QA[2] ? QA[2][1] : x[1], 160), name: w.name, handle: w.handle}) : null]).filter((s, i, A) => !(QA[2] && i === A.length - 2 && false)),
      !QA.length && FDT.folder({tabs: I3, tab: 'Work', head: ['Their answers', 'go here'], body: 'Add the interview answers in the Recipient tab.'}),
      end(`Read ${first ? first + "'s" : 'the'} full feature on artstoheartsproject.com.`, `The next cycle closes ${ncl}.`)];
    cap = `In conversation with ${w.name || ''}${w.handle ? ' ' + w.handle : ''}, the ATH Creative Fund recipient for ${cy}.${w.q3 ? `\n\n"${bkCut(w.q3, 260)}"` : ''}\n\nRead the full feature on artstoheartsproject.com (link in bio).\n\nThe fund reopens every month. The next cycle closes ${ncl}. ${ask}`; }
  S = S.filter(Boolean);
  const extra = [];
  if (v.id === 'winner' && w.name && w.art) { const isFirst = fdRecips(r)[0] && fdRecips(r)[0].r.id === r.id;
    extra.push({book: true, story: true, credits, title: `${cy} · Story frames for the announcement`, meta: `Post "Ours" on announcement day with a link sticker to the apply page and a mention sticker for ${w.handle || first}. Send "${first}'s" to ${first} to share and tag @artstoheartsproject. Post the carousel as an Instagram Collab with ${w.handle || 'the artist'} so it appears on both profiles.`,
      cap: `Message to ${first}: Hi ${first}, the announcement is live on our page today. Here is a story frame made for you: share it, tag @artstoheartsproject and we'll reshare. We have also sent a Collab invite on the post, so it appears on your profile too. Congratulations again.`, pin: '',
      slides: [{...FDT.kit({kind: 'artist', x: w, slot: 'fdk1', kicker: isFirst ? 'The first' : 'This month\'s', head: 'ATH Creative Fund artist', sub: `${w.name} · ${amt} grant from Arts to Hearts Project`, zone: 'Mention sticker: @artstoheartsproject'}), title: 'fund-story-artist', label: `${first}'s story`},
        {...FDT.kit({kind: 'ours', x: w, slot: 'fdk2', kicker: isFirst ? 'Our first Creative Fund artist' : 'This month\'s Creative Fund artist', head: w.name, sub: `The fund is open again. Applications close ${ncl}.`, zone: 'Link sticker: apply for the fund'}), title: 'fund-story-ours', label: 'Our story'}]}); }
  const VK = (FUNDDEMO ? 'demo:' : '') + 'fund:' + r.id + ':' + v.id;
  return [...[{book: true, credits, ...(v.id === 'winner' && w.name ? {covers: [['cut', 'The first'], ['ring', 'Circle'], ['wall', 'Statement']], cover: ['cut', 'ring', 'wall'].includes(v.cover || r.cover) ? (v.cover || r.cover) : 'cut'} : {}), title: `${cy} · ${head}`, meta: `ATH Creative Fund · ${S.length} slides · keyword ${KW} (set it in ManyChat to send ${r.link || FD_LINK})`, cap: cap + '\n\n' + tags, pin: `Comment ${KW} and we'll send you the link to apply.`, slides: S.map((s, j) => ({...s, title: 'fund-' + v.id + '-' + (j + 1)}))}], ...extra].map((g, k) => ({...g, view: VK, ekey: VK + (k ? ':stories' : '')}));
}
function fdW(x, slot){ return {artist: x.name || '', handle: x.handle || '', title: x.title || '', medium: x.medium || '', img: bkPic(slot, x.art || ''), face: x.face || ''}; }

/* ---------- emails: the funnel after someone applies ---------- */
function fdEmails(r){ const w = r.winner || {}, amt = r.amount || '$500', an = fdDay(fdDate(r.announce)), cy = fdName(r), nx = fdNextR(r), ncl = fdDay(fdDate(nx.closes)), fn = fdFirst(w.name) || '{first name}';
  return [
    ['Thank you for applying', 'Automatic reply when the form is sent', `Subject: We have your application for the ATH Creative Fund\n\nHi {first name},\n\nThank you for applying for the ATH Creative Fund, ${cy}. Every application is read by our team, and we announce the recipient on ${an} on Instagram, @artstoheartsproject.\n\nA quick check: your application is complete only with both the form and your public Instagram post tagging @artstoheartsproject with #ATHCreativeFund.\n\nWhile you wait, our open calls are running all the time: books and magazines where your work can be in print beside artists from all over the world. See what is open at artstoheartsproject.com.\n\nWith love,\nThe Arts To Hearts team`],
    ['To the recipient', 'Send before the announcement on ' + an + ' (they have 7 days to reply)', `Subject: You are the ATH Creative Fund recipient for ${cy}\n\nHi ${fn},\n\nWe are so happy to tell you that you are the ATH Creative Fund recipient for ${cy}. The ${amt} grant is yours, for whatever your practice needs. No receipts, no reports.\n\nPlease reply within 7 days with:\n1. How you would like to receive the grant (paid in USD; any transfer fees are covered by the recipient).\n2. A photo of you and one or two more pieces of your work, with titles.\n3. A line or two on what the grant makes possible for you, in your own words.\n\nWe will announce you on ${an} on Instagram. After that, we would love to interview you about your work, your process and what the grant makes possible, for your feature on artstoheartsproject.com. We will send the questions separately.\n\nCongratulations. You can call yourself an ATH Creative Fund recipient in your bio and CV.\n\nWith love,\nThe Arts To Hearts team`],
    ['Feature interview questions', 'To the recipient, after the announcement', `Subject: Your ATH Creative Fund feature\n\nHi ${fn},\n\nAs promised, here are the questions for your feature on artstoheartsproject.com. Answer in your own words, as long or short as you like.\n\n1. Tell us about your work. What do you make, and what keeps you coming back to it?\n2. Walk us through your process. Where do you start, and how do you know when a piece is finished?\n3. What does this grant make possible for you?\n\nIf you have photos of your studio, your desk or work in progress, we would love those too.\n\nWith love,\nThe Arts To Hearts team`],
    ['Work that stayed with us', 'To applicants you will share in the "Work that stayed with us" post', `Subject: Your work stayed with us\n\nHi {first name},\n\nThank you for applying for the ATH Creative Fund, ${cy}. We chose one recipient this cycle, and it was not easy. Your work is one we keep thinking about, and we would love to share it on our Instagram, always with credit.\n\nIf there is anything you would like us to know first (the title, how to credit you), just reply.\n\nThe fund reopens every month and there is no limit on how many cycles you can apply to. The next one closes ${ncl}.\n\nWith love,\nThe Arts To Hearts team`],
    ['To everyone who applied', 'Send on ' + an + ', after the announcement', `Subject: The ATH Creative Fund, ${cy}\n\nHi {first name},\n\nThank you for applying for the ATH Creative Fund. This cycle the grant went to ${w.name || '{recipient}'}, and you can meet them on our Instagram, @artstoheartsproject.\n\nIt was not you this time, but please apply again: the fund reopens every month with a new grant and a new recipient, and there is no limit on how many cycles you can apply to. The next cycle closes ${ncl}.\n\nIf you would like to see your work in print in the meantime, our open calls for books and magazines are at artstoheartsproject.com.\n\nWith love,\nThe Arts To Hearts team`]]; }

/* ---------- the website: the recipients, for the artstoheartsproject.com section ---------- */
function fdWeb(r){ const amt = r.amount || '$500', past = fdRounds().filter(x => x.winner && x.winner.name && x.id <= r.id);
  return `ATH Creative Fund\n\nAn unrestricted ${amt} grant, awarded to one artist every month. Use it for whatever your practice needs. No receipts, no reports.\n\nArtists built this community. This is us giving back. For years, artists have trusted us with their work. The Creative Fund is how we give some of that back: ${amt} every month, straight to one artist, to spend on their practice.\n\nOpen to visual artists, photographers and writers, at every stage, anywhere in the world. Free to apply.\n\nApply: ${r.link || FD_LINK}\n${past.length ? `\nOur recipients\n${past.map(x => `${fdName(x)}: ${x.winner.name}${x.winner.handle ? ' ' + x.winner.handle : ''}${x.winner.country ? ', ' + x.winner.country : ''}`).join('\n')}\n` : ''}`; }


/* ---------- the example: three full cycles with sample art and made-up artists, to review every post, email and tab. Never saved. ---------- */
let FUNDDEMO = false, FUNDREAL = null;
function fdDemo(){ const A = 'art/', E = 'art/examples/pqhaus/', H = 'art/examples/heartlist/';
  const base = id => ({...fdNew(id), done: {}});
  const c1 = {...base('2026-10'), winner: {name: 'Amara Okafor', handle: '@amara.paints', country: 'Nigeria', who: 'a painter from Lagos', title: 'Night Bloom', medium: 'Oil on canvas', art: A + 'night-bloom.jpg', art2: A + 'ref-palms.jpg', title2: 'Palms After Rain', face: E + 'studio-1.jpg',
      why: 'Her paintings feel unmistakably hers: patient, strange and full of care. We kept coming back to them long after the first look.',
      about: 'Amara paints at night in a small studio in Lagos, after her day job. Her flowers bloom in the dark.',
      plan: 'I will finally buy proper linen and stretch the big canvases I have been sketching for two years.',
      q1: 'I paint gardens after dark. The colours change completely at night, and I want to hold on to that feeling before it goes.',
      q2: 'I start with a thin wash and build slowly over weeks. Most of the painting is waiting for the right moment to stop.',
      q3: 'Time. This grant means a month where I can paint instead of taking extra shifts. That is everything.'},
    found: [{name: 'Lena Reid', handle: '@lenareid', title: 'Garden Call', art: A + 'call-garden.jpg', line: 'Collage built from old seed catalogues.'}, {name: 'Sora Kim', handle: '@sorakim.art', title: 'Dahlias', art: A + 'ref-dahlias.jpg', line: 'Small studies of the same flower over one summer.'}, {name: 'Jonah Pierce', handle: '@jonahpierce', title: '2903 Miles', art: E + 'art-2903-miles.jpg'}, {name: 'Ines Duarte', handle: '@inesduarte', title: 'Weave', art: H + 'weave.jpg'}],
    stood: 'So many of you wrote about time: the hours you steal before work, the weekends you keep for the studio. That is exactly what this fund is for.'};
  const c2 = {...base('2026-11'), winner: {name: 'Theo Marsh', handle: '@theo.marsh', country: 'United Kingdom', who: 'a self-taught painter from Leeds', title: 'I Was the Elephant in the Room', medium: 'Acrylic on panel', art: E + 'art-i-was-the-elephant-in-the-room.jpg', art2: E + 'art-31-years-old.jpg', title2: '31 Years Old', face: E + 'studio-2.jpg',
      why: 'Theo paints the things people do not say out loud, with humour and honesty. The work stays with you, and it is entirely his own.',
      about: 'Theo is a self-taught painter from Leeds. He started painting at 29, on the kitchen table, and has not stopped since.',
      plan: 'A proper easel and a month of studio rent, so I can work bigger than my kitchen table allows.',
      q1: 'My paintings are about the small, awkward moments that stay with you for years.', q2: 'I write the title first. Then I paint until the picture deserves it.', q3: 'Space. For the first time I can step back from my work and see it whole.'},
    found: [{name: 'Mira Holt', handle: '@mira.holt', title: 'No Help Is Coming', art: E + 'art-no-help-is-coming.jpg'}, {name: 'Priya Nair', handle: '@priyanair.studio', title: 'Peace', art: H + 'peace.jpg', line: 'Embroidery on found linen.'}, {name: 'Elena Voss', handle: '@elenavoss', title: 'Learning', art: H + 'learning.jpg'}, {name: 'Sam Okoye', handle: '@samokoye', title: 'I Am Not a Bad Person', art: E + 'art-i-am-not-a-bad-person.jpg'}, {name: 'Rosa Lind', handle: '@rosalind.art', title: 'Flower Portrait', art: A + 'flower-portrait.jpg'}],
    stood: 'This cycle brought more writers than ever: poems photographed on kitchen tables, stories typed on phones. A poem has the same chance as a painting, and you showed us why.'};
  const c3 = base('2026-12'); c3.done = {'post:launch': true, 'post:why': true, manychat: true, dates: true};
  c1.done = Object.fromEntries(['launch', 'why', 'guide', 'week', 'winner', 'recap', 'feature'].map(k => ['post:' + k, true]).concat([['mail:0', true], ['mail:1', true], ['mail:2', true], ['mail:3', true], ['mail:4', true], ['reply', true], ['paid', true], ['feature', true], ['web', true], ['manychat', true], ['dates', true]]));
  c2.done = {'post:launch': true, 'post:why': true, 'post:guide': true, 'post:record': true, 'post:week': true, 'post:winner': true, 'mail:0': true, 'mail:1': true, reply: true, paid: true, manychat: true, dates: true};
  return {'2026-10': c1, '2026-11': c2, '2026-12': c3}; }
function fdToggleDemo(){ fdClosePost(); if (FUNDDEMO) { FUND = FUNDREAL; FUNDDEMO = false; FUNDSEL = (fdRounds().pop() || {}).id || null; }
  else { FUNDREAL = FUND; FUND = fdDemo(); FUNDDEMO = true; FUNDSEL = '2026-11'; } FUNDTAB = 'plan'; try { FUNDDEMO ? localStorage.setItem('athFundDemo', '1') : localStorage.removeItem('athFundDemo'); } catch {} fundRender(); render(); }

/* ---------- the page ---------- */
const fdIn = (k, label, val, o = {}) => `<label class="fd-f"><span>${label}</span>${o.area ? `<textarea data-fd="${k}" rows="${o.rows || 3}" placeholder="${fdE(o.ph || '')}">${fdE(val || '')}</textarea>` : `<input data-fd="${k}" type="${o.type || 'text'}" value="${fdE(val || '')}" placeholder="${fdE(o.ph || '')}">`}${o.note ? `<i>${o.note}</i>` : ''}</label>`;
const fdPic = (k, label, url) => `<div class="fd-pic"><span>${label}</span>${url ? `<img src="${fdE(url)}" alt="">` : '<div class="fd-none">No picture</div>'}<span><button type="button" class="btn ghost" data-fdpic="${k}">${url ? 'Change' : 'Add'}</button>${url ? ` <button type="button" class="btn ghost" data-fdpicx="${k}">Remove</button>` : ''}</span></div>`;
function fdTabPlan(r){ const P = fdPlan(r), today = Date.now() - 864e5;
  return `<p class="meta">Every post for ${fdE(fdMonth(r.id))}, in order. Each one ends on the keyword <b>${fdE(r.keyword || 'FUND')}</b>: set it in ManyChat to send the apply link, so every comment becomes a lead.</p><div class="bk-plan">${P.map(p => `<div class="bk-row${p.t && p.t < today ? ' past' : ''}${FUNDVIEW && FUNDVIEW.id === p.id ? ' on' : ''}"><span class="bk-when">${p.when ? fdE(bkFmt(p.when)) : '—'}</span><div><b>${fdE(p.title)}</b>${(r.done || {})['post:' + p.id] ? ' <span class="bk-tag">Posted</span>' : ''}<p class="meta">${fdE(p.what)}</p></div><button type="button" class="btn ghost" data-fdopen="${p.id}">Open</button></div>`).join('')}</div>`; }
function fdTabSetup(r){ return `<div class="fd-grid">${fdIn('opens', 'Opens', r.opens, {type: 'date'})}${fdIn('closes', 'Closes', r.closes, {type: 'date'})}${fdIn('announce', 'Announce the artist', r.announce, {type: 'date'})}
  ${fdIn('amount', 'Amount', r.amount)}${fdIn('keyword', 'Keyword (ManyChat)', r.keyword)}${fdIn('link', 'Apply link', r.link)}</div>
  ${fdIn('who', 'Who can apply (shown in the posts and on the website)', r.who, {area: true, rows: 2})}
  <label class="fd-chk"><input type="checkbox" data-fdchk="free"${r.free ? ' checked' : ''}> Free to apply (the posts say "Applying is free.")</label
  <label class="fd-chk"><input type="checkbox" data-fdchk="showCycle"${r.showCycle ? ' checked' : ''}> Show the cycle number in the graphics (off: months are used instead)</label>`; }
function fdTabWinner(r){ const w = r.winner || {};
  return `<p class="meta">The recipient. Their words are quoted exactly as they wrote them (the fund page promises no check-ins, so everything comes from their reply and the feature interview).</p>
  <div class="fd-grid">${fdIn('w.name', 'Name', w.name)}${fdIn('w.who', 'Who they are, in a few words', w.who, {ph: 'a self-taught painter from Lagos'})}${fdIn('w.handle', 'Instagram', w.handle, {ph: '@handle'})}${fdIn('w.country', 'Where they live', w.country)}
  ${fdIn('w.title', 'Artwork title', w.title)}${fdIn('w.medium', 'Medium', w.medium)}${fdIn('w.title2', 'Second artwork title', w.title2)}</div>
  <div class="fd-pics">${fdPic('w.art', 'Artwork', w.art)}${fdPic('w.art2', 'Second artwork', w.art2)}${fdPic('w.face', 'Their photo', w.face)}</div>
  ${fdIn('w.plan', 'What the grant makes possible, in a line or two (their words)', w.plan, {area: true})}${fdIn('w.why', 'Why we chose them (the team, a few lines: the work, the voice)', w.why, {area: true})}${fdIn('w.about', 'About the artist (a few lines)', w.about, {area: true})}
  <h3>Feature interview (their answers, word for word)</h3>${fdIn('w.q1', 'Their work', w.q1, {area: true, rows: 4})}${fdIn('w.q2', 'Their process', w.q2, {area: true, rows: 4})}${fdIn('w.q3', 'What the grant makes possible', w.q3, {area: true, rows: 4})}`; }
function fdTabFound(r){ const F = r.found || [];
  return `<p class="meta">Applicants whose work you keep thinking about (up to 8). The grant terms let us share work samples with credit; the "Work that stayed with us" email tells them first.</p>
  ${F.map((x, i) => `<div class="fd-found"><div class="fd-grid">${fdIn(`f.${i}.name`, 'Name', x.name)}${fdIn(`f.${i}.handle`, 'Instagram', x.handle)}${fdIn(`f.${i}.title`, 'Artwork title', x.title)}</div>${fdIn(`f.${i}.line`, 'One line about them (optional)', x.line)}<div class="fd-pics">${fdPic(`f.${i}.art`, 'Artwork', x.art)}${fdPic(`f.${i}.face`, 'Their photo (optional)', x.face)}</div><button type="button" class="btn ghost" data-fdrm="${i}">Remove this artist</button></div>`).join('')}
  ${fdIn('stood', 'What stood out this cycle (the team, a few lines for the recap; no exact numbers)', r.stood, {area: true})}
  ${F.length < 8 ? '<button type="button" class="btn" id="fdadd">Add an artist</button>' : ''}`; }
function fdTabEmails(r){ return `<p class="meta">The emails around each cycle. {first name} is filled in by your email tool. The automatic reply and "To everyone who applied" keep every applicant close: they point to the open calls, so each cycle feeds the bigger funnel.</p>
  ${fdEmails(r).map(([t, when, body], i) => `<div class="fd-mail"><div class="fd-mh"><div><b>${fdE(t)}</b><p class="meta">${fdE(when)}</p></div><span><label class="fd-chk"><input type="checkbox" data-fdchk="done.mail:${i}"${(r.done || {})['mail:' + i] ? ' checked' : ''}> Sent</label> <button type="button" class="btn ghost" data-fdcopy="m${i}">Copy</button></span></div><pre id="fdm${i}">${fdE(body)}</pre></div>`).join('')}`; }
function fdTabWeb(r){ return `<p class="meta">A short section for artstoheartsproject.com, in the fund page's own words, pointing to the apply page. Recipients are added every cycle.</p><div class="fd-mail"><div class="fd-mh"><b>Website section</b><button type="button" class="btn ghost" data-fdcopy="web">Copy</button></div><pre id="fdweb">${fdE(fdWeb(r))}</pre></div>`; }
function fdTabTrack(r){ const d = r.done || {}; const P = fdPlan(r); const M = fdEmails(r);
  const steps = [['manychat', `Keyword ${r.keyword || 'FUND'} set in ManyChat with the apply link`], ['dates', 'Dates on the fund page updated for this cycle'], ['reply', 'Recipient replied within 7 days'], ['paid', 'Grant paid'], ['feature', 'Feature interview published on artstoheartsproject.com'], ['web', 'Recipient added to the website list']];
  const row = (k, l) => `<label class="fd-chk"><input type="checkbox" data-fdchk="done.${k}"${d[k] ? ' checked' : ''}> ${fdE(l)}</label>`;
  const n = P.filter(p => d['post:' + p.id]).length + M.filter((m, i) => d['mail:' + i]).length + steps.filter(s => d[s[0]]).length, all = P.length + M.length + steps.length;
  return `<p class="meta">${n} of ${all} done for ${fdE(fdMonth(r.id))}. Ticks are shared with the team.</p><div class="fd-cols"><div><h3>Posts</h3>${P.map(p => row('post:' + p.id, (p.when ? bkFmt(p.when) + ' · ' : '') + p.title)).join('')}</div><div><h3>Emails</h3>${M.map((m, i) => row('mail:' + i, m[0])).join('')}<h3>The recipient</h3>${steps.map(s => row(s[0], s[1])).join('')}</div></div>`; }

function fundRender(){
  const el = document.getElementById('fund'); if (!el) return;
  if (!FUND) { el.innerHTML = '<p class="meta">Loading the fund…</p>'; if (!FUNDBUSY) fundLoad(); return; }
  const R = fdRounds(), r = FUNDSEL && FUND[FUNDSEL];
  const nowD = new Date(); const now = fdIso(nowD.getDate() >= 15 ? nowD : new Date(nowD.getFullYear(), nowD.getMonth() - 1, 1)).slice(0, 7);
  let nextId = '2026-10'; while (FUND[nextId] && nextId <= now) nextId = fdNext({id: nextId}).id;   /* the first cycle not started yet, from Cycle 01 */
  const tabsHtml = r ? `<div class="bk-tabs">${FD_TABS.map(([k, l]) => `<button type="button" class="${FUNDTAB === k ? 'on' : ''}" data-fdtab="${k}">${l}</button>`).join('')}</div>` : '';
  const body = !r ? '' : FUNDTAB === 'setup' ? fdTabSetup(r) : FUNDTAB === 'winner' ? fdTabWinner(r) : FUNDTAB === 'found' ? fdTabFound(r) : FUNDTAB === 'emails' ? fdTabEmails(r) : FUNDTAB === 'web' ? fdTabWeb(r) : FUNDTAB === 'track' ? fdTabTrack(r) : fdTabPlan(r);
  const w = r && r.winner || {};
  el.innerHTML = `<div class="bk-top"><div><h1>ATH Creative Fund</h1><p class="meta">${fdE((r && r.amount) || '$500')} to one artist, every month, no questions asked. A new cycle every month: the posts, the recipient, the emails, the checklist.${FUNDLOCAL ? ' <span class="bk-warn">Saving in this browser only: the shared store could not be reached.</span>' : ''}</p></div>
    <div class="bk-act"><select id="fdsel">${R.map(x => `<option value="${x.id}"${x.id === FUNDSEL ? ' selected' : ''}>${fdE(fdMonth(x.id))}${x.winner && x.winner.name ? ' · ' + fdE(x.winner.name) : ''}</option>`).join('')}</select>${FUNDDEMO ? '' : `<button type="button" class="btn" id="fdnew">Start ${fdE(fdName({id: nextId}))}</button>`}<button type="button" class="btn ghost" id="fddemo">${FUNDDEMO ? 'Leave the example' : 'See an example'}</button></div></div>
    ${FUNDDEMO ? '<p class="bk-warn" style="margin:0 0 14px">Example only: three made-up cycles with sample art and made-up artists, so you can review every post, email and tab. Nothing here is saved or shared. Open any cycle, any tab, any post.</p>' : ''}
    ${r ? `<section class="bk-detail"><h2>${fdE(fdMonth(r.id))}</h2><p class="bk-dates"><span>Opens <b>${fdE(bkFmt(fdDate(r.opens)))}</b></span><span>Closes <b>${fdE(bkFmt(fdDate(r.closes)))}</b></span><span>Recipient announced <b>${fdE(bkFmt(fdDate(r.announce)))}</b></span>${w.name ? `<span>Recipient <b>${fdE(w.name)}</b></span>` : ''}</p>
      <p class="meta">Apply link: <a href="${fdE(r.link || FD_LINK)}" target="_blank" rel="noopener">${fdE(r.link || FD_LINK)}</a></p>${tabsHtml}<div class="bk-body">${body}</div>${FUNDVIEW ? '<p class="meta bk-close"><button type="button" class="btn ghost" id="fdclose">Close the post</button></p>' : ''}</section>`
      : '<section class="bk-detail"><p>No cycles yet. Start one to get the posts, emails and checklist.</p></section>'}`;
  el.querySelector('#fddemo').onclick = fdToggleDemo;
  if (!FUNDDEMO) el.querySelector('#fdnew').onclick = () => { const id = nextId; if (!FUND[id]) FUND[id] = fdNew(id); FUNDSEL = id; FUNDTAB = 'setup'; fdClosePost(); fundSave(id); fundRender(); };
  const sel = el.querySelector('#fdsel'); if (sel) sel.onchange = () => { FUNDSEL = sel.value; fdClosePost(); fundRender(); };
  if (!r) return;
  el.querySelectorAll('[data-fdtab]').forEach(x => x.onclick = () => { FUNDTAB = x.dataset.fdtab; if (FUNDTAB !== 'plan') fdClosePost(); fundRender(); });
  el.querySelectorAll('[data-fdopen]').forEach(x => x.onclick = () => { FUNDVIEW = {round: r.id, id: x.dataset.fdopen}; document.body.classList.add('fdposts'); fundRender(); render(); const o = document.getElementById('out'); if (o) o.scrollIntoView({behavior: 'smooth'}); });
  const c = el.querySelector('#fdclose'); if (c) c.onclick = () => { fdClosePost(); fundRender(); };
  const setK = (k, v) => { const p = k.split('.'); if (p[0] === 'w') { r.winner = r.winner || {}; r.winner[p[1]] = v; } else if (p[0] === 'f') { r.found[+p[1]][p[2]] = v; } else if (p[0] === 'done') { r.done = r.done || {}; r.done[p.slice(1).join('.')] = v; } else r[k] = v; fundSave(r.id); if (FUNDVIEW) render(); };
  el.querySelectorAll('[data-fd]').forEach(x => x.onchange = () => { let v = x.value.trim(); if (x.dataset.fd === 'keyword') v = v.toUpperCase().replace(/[^A-Z0-9]/g, ''); setK(x.dataset.fd, v); if (/^(opens|closes|announce|keyword)$/.test(x.dataset.fd)) fundRender(); });
  el.querySelectorAll('[data-fdchk]').forEach(x => x.onchange = () => { setK(x.dataset.fdchk, x.checked); if (FUNDTAB === 'track') fundRender(); });
  el.querySelectorAll('[data-fdpic]').forEach(x => x.onclick = () => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = async () => { const f = inp.files[0]; if (!f) return; status('Uploading the picture…'); setK(x.dataset.fdpic, await fdUpload(f)); fundRender(); }; inp.click(); });
  el.querySelectorAll('[data-fdpicx]').forEach(x => x.onclick = () => { setK(x.dataset.fdpicx, ''); fundRender(); });
  el.querySelectorAll('[data-fdrm]').forEach(x => x.onclick = () => { r.found.splice(+x.dataset.fdrm, 1); fundSave(r.id); fundRender(); if (FUNDVIEW) render(); });
  const add = el.querySelector('#fdadd'); if (add) add.onclick = () => { r.found = r.found || []; r.found.push({}); fundSave(r.id); fundRender(); };
  el.querySelectorAll('[data-fdcopy]').forEach(x => x.onclick = () => { const t = document.getElementById('fd' + x.dataset.fdcopy).textContent; navigator.clipboard.writeText(t).then(() => status('Copied.'), () => status('Select the text and copy it.')); });
}
function fdClosePost(){ if (FUNDVIEW) { FUNDVIEW = null; document.body.classList.remove('fdposts'); } }
