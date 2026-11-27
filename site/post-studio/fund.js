/* ATH Creative Fund: one artist a month gets $500, no questions asked. A signature programme and a lead engine:
   every round brings new artists in (the apply form collects their email), and every post points to the link.
   A round = one month: the window, the dated posts, the winner, the artists we found, the emails, the check-ins. */
let FUND = null, FUNDSEL = null, FUNDTAB = 'plan', FUNDVIEW = null, FUNDBUSY = false, FUNDLOCAL = false;
const FD_LINK = 'https://submit.artstoheartsproject.com/ath-creative-fund';
const FD_TABS = [['plan', 'Posts'], ['setup', 'Setup'], ['winner', 'Recipient'], ['found', 'Work that stayed with us'], ['emails', 'Emails'], ['web', 'Website'], ['track', 'Checklist']];
const FD_CH = ['The fund', 'How it works', 'Apply'];
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
  FUNDBUSY = false; if (FUNDSEL === null) { const now = fdIso(new Date()).slice(0, 7); const t = new Date(); const cur = fdIso(t.getDate() >= 15 ? t : new Date(t.getFullYear(), t.getMonth() - 1, 1)).slice(0, 7); FUNDSEL = FUND[cur] ? cur : (fdRounds().pop() || {}).id || null; }
  fundRender(); if (FUNDVIEW) render(); }
let fdSaveT = null;
function fundSave(id){ clearTimeout(fdSaveT); fdSaveT = setTimeout(async () => {
  if (!FUNDLOCAL) { try { const r = await fetch('api/fund', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({id, round: FUND[id] || null})}); if (!r.ok) throw 0; status('Saved for the team.'); return; } catch { FUNDLOCAL = true; } }
  try { localStorage.setItem('athFund', JSON.stringify(FUND)); status('Saved in this browser (the shared store could not be reached).'); } catch {} }, 600); }
async function fdUpload(file){ const url = await shrink(file);
  try { const r = await fetch('api/upload', {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({data: url})}); if (!r.ok) throw 0; return (await r.json()).url; } catch { return url; } }

/* ---------- the cycle: every post, with its date ---------- */
function fdPlan(r){ const o = fdDate(r.opens), c = fdDate(r.closes), a = fdDate(r.announce), prev = fdPrev(r), w = r.winner || {};
  const L = [
    {id: 'launch', when: o, title: 'The fund is open', what: 'An unrestricted $500 grant, the dates, the link. The cycle starts here.'},
    {id: 'why', when: fdAdd(o, 4), title: 'Artists built this community', what: 'Why the fund exists, in the words of the fund page: this is us giving back.'},
    {id: 'what', when: fdAdd(o, 8), title: 'What would your practice do with $500?', what: 'A question for the comments. Paint, film, studio rent, a course, time to create.'},
    prev && {id: 'last', when: fdAdd(o, 12), title: `Last cycle's recipient: ${prev.winner.name}`, what: 'Proof the fund is real: the last recipient and their work.'},
    {id: 'how', when: fdAdd(o, prev ? 16 : 13), title: 'How to apply', what: 'The three steps: one work sample, the tagged Instagram post with #ATHCreativeFund, the form.'},
    {id: 'isnt', when: fdAdd(o, 21), title: "What the fund isn't", what: 'Not a competition, not a loan, not a commission, not tied to anything else.'},
    {id: 'week', when: fdAdd(c, -6), title: 'One week left', what: 'A calm reminder, the closing date and time.'},
    {id: 'close', when: c, title: 'Closes tonight', what: 'Last day, 11:59 PM. One action.'},
    {id: 'winner', when: a, title: w.name ? `Meet ${w.name}` : 'The recipient', what: w.name ? 'The announcement: their work, their words, the feature to come.' : 'Fill in the Recipient tab first.'},
    {id: 'found', when: fdAdd(a, 3), title: 'Work that stayed with us', what: (r.found || []).length ? `${r.found.length} applicants whose work we keep thinking about. Shared with credit, as the grant terms allow.` : 'Add them in the Work that stayed with us tab.'},
    {id: 'feature', when: fdAdd(a, 10), title: w.name ? `The feature: ${w.name}` : 'The recipient feature', what: w.q1 ? 'Their interview, as published on artstoheartsproject.com.' : 'Add their interview answers in the Recipient tab.'}];
  return L.filter(Boolean).map(p => ({...p, t: p.when ? +p.when : 0})); }

/* ---------- the posts (house templates: tabbed cards, words in Baskerville, the work whole, one keyword) ---------- */
function fdW(x, slot){ return {artist: x.name || '', handle: x.handle || '', title: x.title || '', medium: x.medium || '', img: bkPic(slot, x.art || ''), face: x.face || ''}; }
function fundGroups(){
  const v = FUNDVIEW; const r = v && FUND && FUND[v.round]; if (!r) return [];
  const KW = (r.keyword || 'FUND').toUpperCase(), amt = r.amount || '$500', w = r.winner || {}, first = fdFirst(w.name), nx = fdNextR(r), prev = fdPrev(r);
  const cl = fdDay(fdDate(r.closes)), an = fdDay(fdDate(r.announce)), cy = fdName(r), ncl = fdDay(fdDate(nx.closes));
  const tabs = FD_CH, card = o => BKT.tabcard({tabs, ...o}), end = (head, foot) => BKT.keyEnd({head, key: KW, offer: `Comment ${KW} and we'll send you the link to apply.`, foot});
  const cover = (title, o = {}) => BKT.bcover({label: 'ATH Creative Fund', title, ...o});
  const credits = {}; const cred = x => { if (x && x.art) credits[x.art] = {text: `${x.title ? x.title + ' by ' : ''}${x.name}${x.handle ? ' ' + x.handle : ''}`, artist: x.name, title: x.title}; };
  cred(w); (r.found || []).forEach(cred); if (prev) cred(prev.winner);
  const tags = '#ATHCreativeFund #artstoheartsproject #artistgrant #artistsupport #emergingartists';
  const ask = `Comment ${KW} and we'll send you the link to apply.`;
  let S = [], cap = '', head = '';
  if (v.id === 'launch') { head = 'The fund is open';
    S = [cover([amt, 'to one artist,', 'every month.'], {sub: 'No receipts, no reports.'}),
      card({tab: 'The fund', kicker: 'A monthly artist grant', head: ['ATH', 'Creative Fund'], sub: `An unrestricted **${amt} grant**, awarded to one artist every month. Use it for whatever your practice needs.`}),
      BKT.htext({text: 'Supplies, equipment, studio space, a course, or time to make. No receipts. No reports. Nothing to pay back.'}),
      card({tab: 'Apply', head: ['Applications', 'close ' + cl], sub: `${r.who}${r.free ? ' **Free to apply.**' : ''}`, foot: `We announce the recipient on ${an}. The link is in our bio.`}),
      end(`The ATH Creative Fund is open.`)];
    cap = `The ATH Creative Fund is open.\n\nAn unrestricted ${amt} grant, awarded to one artist every month. Use it for whatever your practice needs. No receipts, no reports.\n\n${r.who}${r.free ? ' Free to apply.' : ''}\n\nApplications close ${cl}, 11:59 PM. We announce the recipient on ${an}.\n\n${ask} Or find it in our bio.`; }
  else if (v.id === 'why') { head = 'Artists built this community';
    S = [card({tab: 'The fund', kicker: 'ATH Creative Fund', head: ['Artists built', 'this community.'], sub: 'This is us giving back.'}),
      BKT.htext({text: 'For years, artists have trusted us with their work. Their paintings, photographs and poems have filled our books, our magazine and our Instagram.'}),
      BKT.htext({text: `Everything Arts To Hearts Project is today, artists made possible. The Creative Fund is how we give some of that back: ${amt} every month, straight to one artist, to spend on their practice.`}),
      card({tab: 'How it works', body: 'It stands completely on its own. You don\'t need to have entered one of our calls, bought a book, or worked with us before. Just apply with your work.'}),
      end(`Applications close ${cl}.`)];
    cap = `Artists built this community. This is us giving back.\n\nFor years, artists have trusted us with their work. The ATH Creative Fund is how we give some of that back: ${amt} every month, straight to one artist, to spend on their practice.\n\nIt stands on its own: no call entry, no book purchase, no past work with us needed. Just apply with your work.\n\nApplications close ${cl}. ${ask}`; }
  else if (v.id === 'what') { head = 'What would your practice do with $500?';
    S = [cover(['What would', 'your practice', 'do with ' + amt + '?']),
      BKT.htext({text: 'Paint and canvas. Paper and ink. Film. Camera gear. Studio rent. A course. Framing. Time to create.'}),
      card({tab: 'The fund', sub: `Every month, one artist gets ${amt} to spend on exactly that. **No receipts, no reports.**`}),
      card({tab: 'Apply', head: ['Applications', 'close ' + cl], sub: 'The link is in our bio.'}),
      end('Tell us in the comments too. We read every one.')];
    cap = `What would your practice do with ${amt}?\n\nPaint and canvas, film, studio rent, a course, framing, or simply time to create. Tell us in the comments.\n\nThen apply: the ATH Creative Fund gives one artist ${amt} every month, no receipts, no reports. Applications close ${cl}. ${ask}`; }
  else if (v.id === 'last' && prev) { const p = prev.winner, pf = fdFirst(p.name); head = `Last cycle's recipient`;
    S = [BKT.acover({img: p.art, slot: 'fdlc', serif: 'The last ATH Creative Fund went to', big: p.name, sub: fdName(prev)}),
      p.art && BKT.feature({w: fdW(p, 'fdlw'), slot: 'fdlw', line: ''}),
      (p.plan || p.q3) && BKT.say({slot: 'fdls', face: p.face, q: p.q3 || p.plan, name: p.name, handle: p.handle}),
      card({tab: 'Apply', head: ['This cycle,', 'it could be you.'], sub: `Applications close ${cl}.`}),
      end(`Thank you, ${pf}.`)];
    cap = `The last ATH Creative Fund went to ${p.name}${p.handle ? ' ' + p.handle : ''}.${p.q3 || p.plan ? `\n\nIn ${pf}'s words: "${p.q3 || p.plan}"` : ''}\n\nThis cycle it could be you. Applications close ${cl}. ${ask}`; }
  else if (v.id === 'how') { head = 'How to apply';
    S = [card({tab: 'How it works', kicker: 'ATH Creative Fund', head: ['Three steps.', 'About ten', 'minutes.']}),
      card({tab: 'How it works', prose: ['**Choose your work sample.** One piece you made, new or already shared.', '**Share it on Instagram.** Post it publicly, tag @artstoheartsproject on the image, add #ATHCreativeFund and follow us.', '**Submit the form.** Your post link, your work and a few lines about your practice.'], lineSz: 34}),
      BKT.htext({text: 'Writers, this is for you too. Post a photo of the page or a simple text graphic. A poem has the same chance as a painting.'}),
      end(`Applications close ${cl}, 11:59 PM.`, 'An application needs both the post and the form.')];
    cap = `How to apply for the ATH Creative Fund. Three steps, about ten minutes.\n\n1. Choose one work sample that you made.\n2. Post it publicly on Instagram, tag @artstoheartsproject on the image, add #ATHCreativeFund, and follow us.\n3. Fill in the form with your post link, your work and a few lines about your practice.\n\nWriters can post a photo of the page or a simple text graphic.\n\nApplications close ${cl}, 11:59 PM. ${ask}`; }
  else if (v.id === 'isnt') { head = "What the fund isn't";
    S = [card({tab: 'The fund', kicker: 'ATH Creative Fund', head: ["What the fund", "isn't"]}),
      card({tab: 'The fund', prose: ['**Not a competition.** No theme, no brief and no public voting.', '**Not tied to anything else.** No call entry, book purchase or past work with ATH needed.', '**Not a commission.** We won\'t ask you to make anything for us in return.', '**Not a loan.** Nothing to pay back, and no reports on how you spent it.']}),
      BKT.htext({text: 'Judged on the work alone. Not followers, not degrees, not where you live. Reviewed by people, not an algorithm.'}),
      card({tab: 'Apply', head: ['Applications', 'close ' + cl], sub: 'It is free to apply.'}),
      end(`${amt}, to one artist, every month.`)];
    cap = `What the ATH Creative Fund isn't.\n\nNot a competition: no theme, no brief, no public voting. Not tied to anything else. Not a commission. Not a loan: nothing to pay back, no reports.\n\nJudged on the work alone, by people, not an algorithm.\n\nApplications close ${cl}. ${ask}`; }
  else if (v.id === 'week') { head = 'One week left';
    S = [cover(['One week', 'left.'], {sub: `Applications close ${cl}, 11:59 PM.`}),
      card({tab: 'The fund', sub: `An unrestricted **${amt} grant** for one artist. No receipts, no reports.`}),
      BKT.htext({text: 'If you have been meaning to apply, this is your week. One work sample, one Instagram post, one short form. About ten minutes.'}),
      end(`Applications close ${cl}.`)];
    cap = `One week left to apply for the ATH Creative Fund.\n\nAn unrestricted ${amt} grant for one artist. One work sample, one Instagram post tagged #ATHCreativeFund, one short form.\n\nApplications close ${cl}, 11:59 PM. ${ask}`; }
  else if (v.id === 'close') { head = 'Closes tonight';
    S = [cover(['Closes', 'tonight.'], {sub: `11:59 PM · ${cy}`}),
      card({tab: 'Apply', sub: `Remember: your application needs **both** the Instagram post with #ATHCreativeFund and the form. We announce the recipient on ${an}.`}),
      BKT.htext({text: 'Not ready this time? The fund reopens every month, with a new grant and a new recipient.'}),
      end('Last day to apply.')];
    cap = `Last day to apply for the ATH Creative Fund. Applications close tonight at 11:59 PM.\n\nYour application needs both the Instagram post with #ATHCreativeFund and the form. We announce the recipient on ${an}.\n\n${ask}`; }
  else if (v.id === 'winner') { head = w.name ? `Meet ${w.name}` : 'The recipient';
    if (!w.name) S = [card({tab: 'The fund', head: ['Add the', 'recipient first'], sub: 'Open the Recipient tab: their name, handle, work, photo and their own words.'})];
    else S = [BKT.acover({img: w.art, slot: 'fdwc', serif: 'The ATH Creative Fund goes to', big: w.name, sub: [cy, w.country].filter(Boolean).join(' · ')}),
      card({tab: 'The fund', head: ['Congratulations,', first], sub: `You are the ATH Creative Fund recipient for ${cy}. ${amt} is yours, for whatever your practice needs.`}),
      w.art && BKT.feature({w: fdW(w, 'fdww'), slot: 'fdww', line: ''}),
      (w.plan || w.q1) && BKT.say({slot: 'fdws', face: w.face, q: w.plan || w.q1, name: w.name, handle: w.handle}),
      w.about && card({tab: 'How it works', label: 'About the artist', body: w.about}),
      w.art2 && BKT.feature({w: {...fdW(w, 'fdw2'), img: bkPic('fdw2', w.art2), title: w.title2 || ''}, slot: 'fdw2', line: ''}),
      end(`Congratulations, ${first}. Thank you to every artist who applied.`, `Not selected? The fund reopens every month. The next cycle closes ${ncl}.`)];
    cap = w.name ? `Meet ${w.name}${w.handle ? ' ' + w.handle : ''}, the ATH Creative Fund recipient for ${cy}.${w.plan || w.q1 ? `\n\nIn ${first}'s words: "${w.plan || w.q1}"` : ''}\n\nCongratulations, ${first}. ${amt} is yours, no receipts, no reports. Your full feature interview is coming soon on artstoheartsproject.com.\n\nThank you to every artist who applied. Not selected this cycle? Apply again: the fund reopens every month, and the next cycle closes ${ncl}. ${ask}` : ''; }
  else if (v.id === 'found') { const F = (r.found || []).filter(x => x.name); head = 'Work that stayed with us';
    S = [card({tab: 'The fund', kicker: 'ATH Creative Fund', head: ['Work that', 'stayed with us'], sub: `One recipient, and so much work we keep thinking about. A few of the artists who applied in ${cy}.`}),
      ...F.slice(0, 8).map((x, i) => x.art ? BKT.feature({w: fdW(x, 'fdf' + i), slot: 'fdf' + i, line: bkCut(x.line || '', 120)}) : null),
      card({tab: 'Apply', head: ['The fund', 'is open again'], sub: `The next cycle closes ${ncl}.`}),
      end('Go and follow them. Then apply.')];
    cap = `Work that stayed with us from the ATH Creative Fund, ${cy}.\n\nOne recipient, and so much work we keep thinking about. Go and follow:\n${F.map(x => `${x.name}${x.handle ? ' ' + x.handle : ''}`).join('\n')}\n\nThe fund reopens every month. The next cycle closes ${ncl}. ${ask}`; }
  else if (v.id === 'feature') { head = 'The recipient feature';
    const QA = [['Your work', w.q1], ['Your process', w.q2], ['What the grant makes possible', w.q3]].filter(x => x[1]);
    S = [BKT.acover({img: w.art2 || w.art, slot: 'fdfc', serif: 'In conversation with', big: w.name || 'Our recipient', sub: 'ATH Creative Fund · ' + cy}),
      ...QA.flatMap((x, i) => [i === 1 && w.face ? BKT.say({slot: 'fdfs', face: w.face, q: bkCut(x[1], 220), name: w.name, handle: w.handle}) : card({tab: 'How it works', label: x[0], body: bkCut(x[1], 420)}), i === 0 && w.art ? BKT.feature({w: fdW(w, 'fdfw'), slot: 'fdfw', line: ''}) : null]),
      !QA.length && card({tab: 'How it works', head: ['Their answers', 'go here'], sub: 'Add the interview answers in the Recipient tab.'}),
      end(`Read ${first ? first + "'s" : 'the'} full feature on artstoheartsproject.com.`, `The next cycle of the fund closes ${ncl}.`)];
    cap = `In conversation with ${w.name || ''}${w.handle ? ' ' + w.handle : ''}, the ATH Creative Fund recipient for ${cy}.${w.q3 ? `\n\n"${bkCut(w.q3, 260)}"` : ''}\n\nRead the full feature on artstoheartsproject.com (link in bio).\n\nThe fund reopens every month. The next cycle closes ${ncl}. ${ask}`; }
  S = S.filter(Boolean);
  return [{book: true, credits, title: `${cy} · ${head}`, meta: `ATH Creative Fund · ${S.length} slides · keyword ${KW} (set it in ManyChat to send ${r.link || FD_LINK})`, cap: cap + '\n\n' + tags, pin: `Comment ${KW} and we'll send you the link to apply.`, slides: S.map((s, j) => ({...s, title: 'fund-' + v.id + '-' + (j + 1)}))}];
}

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

/* ---------- the page ---------- */
const fdIn = (k, label, val, o = {}) => `<label class="fd-f"><span>${label}</span>${o.area ? `<textarea data-fd="${k}" rows="${o.rows || 3}" placeholder="${fdE(o.ph || '')}">${fdE(val || '')}</textarea>` : `<input data-fd="${k}" type="${o.type || 'text'}" value="${fdE(val || '')}" placeholder="${fdE(o.ph || '')}">`}${o.note ? `<i>${o.note}</i>` : ''}</label>`;
const fdPic = (k, label, url) => `<div class="fd-pic"><span>${label}</span>${url ? `<img src="${fdE(url)}" alt="">` : '<div class="fd-none">No picture</div>'}<span><button type="button" class="btn ghost" data-fdpic="${k}">${url ? 'Change' : 'Add'}</button>${url ? ` <button type="button" class="btn ghost" data-fdpicx="${k}">Remove</button>` : ''}</span></div>`;
function fdTabPlan(r){ const P = fdPlan(r), today = Date.now() - 864e5;
  return `<p class="meta">Every post for ${fdE(fdMonth(r.id))}, in order. Each one ends on the keyword <b>${fdE(r.keyword || 'FUND')}</b>: set it in ManyChat to send the apply link, so every comment becomes a lead.</p><div class="bk-plan">${P.map(p => `<div class="bk-row${p.t && p.t < today ? ' past' : ''}${FUNDVIEW && FUNDVIEW.id === p.id ? ' on' : ''}"><span class="bk-when">${p.when ? fdE(bkFmt(p.when)) : '—'}</span><div><b>${fdE(p.title)}</b>${(r.done || {})['post:' + p.id] ? ' <span class="bk-tag">Posted</span>' : ''}<p class="meta">${fdE(p.what)}</p></div><button type="button" class="btn ghost" data-fdopen="${p.id}">Open</button></div>`).join('')}</div>`; }
function fdTabSetup(r){ return `<div class="fd-grid">${fdIn('opens', 'Opens', r.opens, {type: 'date'})}${fdIn('closes', 'Closes', r.closes, {type: 'date'})}${fdIn('announce', 'Announce the artist', r.announce, {type: 'date'})}
  ${fdIn('amount', 'Amount', r.amount)}${fdIn('keyword', 'Keyword (ManyChat)', r.keyword)}${fdIn('link', 'Apply link', r.link)}</div>
  ${fdIn('who', 'Who can apply (shown in the posts and on the website)', r.who, {area: true, rows: 2})}
  <label class="fd-chk"><input type="checkbox" data-fdchk="free"${r.free ? ' checked' : ''}> Free to apply (the posts say "Applying is free.")</label>`; }
function fdTabWinner(r){ const w = r.winner || {};
  return `<p class="meta">The recipient. Their words are quoted exactly as they wrote them (the fund page promises no check-ins, so everything comes from their reply and the feature interview).</p>
  <div class="fd-grid">${fdIn('w.name', 'Name', w.name)}${fdIn('w.handle', 'Instagram', w.handle, {ph: '@handle'})}${fdIn('w.country', 'Where they live', w.country)}
  ${fdIn('w.title', 'Artwork title', w.title)}${fdIn('w.medium', 'Medium', w.medium)}${fdIn('w.title2', 'Second artwork title', w.title2)}</div>
  <div class="fd-pics">${fdPic('w.art', 'Artwork', w.art)}${fdPic('w.art2', 'Second artwork', w.art2)}${fdPic('w.face', 'Their photo', w.face)}</div>
  ${fdIn('w.plan', 'What the grant makes possible, in a line or two (their words)', w.plan, {area: true})}${fdIn('w.about', 'About the artist (a few lines)', w.about, {area: true})}
  <h3>Feature interview (their answers, word for word)</h3>${fdIn('w.q1', 'Their work', w.q1, {area: true, rows: 4})}${fdIn('w.q2', 'Their process', w.q2, {area: true, rows: 4})}${fdIn('w.q3', 'What the grant makes possible', w.q3, {area: true, rows: 4})}`; }
function fdTabFound(r){ const F = r.found || [];
  return `<p class="meta">Applicants whose work you keep thinking about (up to 8). The grant terms let us share work samples with credit; the "Work that stayed with us" email tells them first.</p>
  ${F.map((x, i) => `<div class="fd-found"><div class="fd-grid">${fdIn(`f.${i}.name`, 'Name', x.name)}${fdIn(`f.${i}.handle`, 'Instagram', x.handle)}${fdIn(`f.${i}.title`, 'Artwork title', x.title)}</div>${fdIn(`f.${i}.line`, 'One line about them (optional)', x.line)}<div class="fd-pics">${fdPic(`f.${i}.art`, 'Artwork', x.art)}${fdPic(`f.${i}.face`, 'Their photo (optional)', x.face)}</div><button type="button" class="btn ghost" data-fdrm="${i}">Remove this artist</button></div>`).join('')}
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
    <div class="bk-act"><select id="fdsel">${R.map(x => `<option value="${x.id}"${x.id === FUNDSEL ? ' selected' : ''}>${fdE(fdMonth(x.id))}${x.winner && x.winner.name ? ' · ' + fdE(x.winner.name) : ''}</option>`).join('')}</select><button type="button" class="btn" id="fdnew">Start ${fdE(fdName({id: nextId}))}</button></div></div>
    ${r ? `<section class="bk-detail"><h2>${fdE(fdMonth(r.id))}</h2><p class="bk-dates"><span>Opens <b>${fdE(bkFmt(fdDate(r.opens)))}</b></span><span>Closes <b>${fdE(bkFmt(fdDate(r.closes)))}</b></span><span>Recipient announced <b>${fdE(bkFmt(fdDate(r.announce)))}</b></span>${w.name ? `<span>Recipient <b>${fdE(w.name)}</b></span>` : ''}</p>
      <p class="meta">Apply link: <a href="${fdE(r.link || FD_LINK)}" target="_blank" rel="noopener">${fdE(r.link || FD_LINK)}</a></p>${tabsHtml}<div class="bk-body">${body}</div>${FUNDVIEW ? '<p class="meta bk-close"><button type="button" class="btn ghost" id="fdclose">Close the post</button></p>' : ''}</section>`
      : '<section class="bk-detail"><p>No cycles yet. Start one to get the posts, emails and checklist.</p></section>'}`;
  el.querySelector('#fdnew').onclick = () => { const id = nextId; if (!FUND[id]) FUND[id] = fdNew(id); FUNDSEL = id; FUNDTAB = 'setup'; fdClosePost(); fundSave(id); fundRender(); };
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
