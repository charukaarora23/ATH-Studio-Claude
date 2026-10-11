const { C, F, paperBg } = require('./lib.cjs');
const { studioHome, header, desk, mono, at, BIO_DOCS } = require('./frames.cjs');
const { spread, btn, chip, fieldLabel, hint, ruled, pageHead, pageFoot, exampleNote, leftTitle } = require('./spread.cjs');

const slipsFrom = (docs) => docs.slice().reverse().map((d) => ({ title: d.title, meta: `${d.words} words · ${d.date}` }));

const notesHead = (t, sub) => `<div style="${mono(11, C.hotRose)}">${t}</div>${sub ? `<div style="margin-top:10px;width:430px;font:400 16px/1.45 ${F.soft};color:${C.peony}">${sub}</div>` : ''}`;
const noteLine = (k, v) => `<div style="display:flex;gap:16px;padding:9px 0;border-bottom:1px solid rgba(250,210,225,.16)"><span style="width:118px;flex:none;${mono(10, C.hotRose)};padding-top:3px">${k}</span><span style="font:400 16px/1.35 ${F.soft};color:${C.peony}">${v}</span></div>`;
const cardLine = (k, v, fresh) => `<div style="display:flex;gap:14px;padding:9px 0;border-bottom:1px solid rgba(76,66,64,.14)"><span style="width:96px;flex:none;${mono(10, fresh ? C.chilli : C.cocoa)};padding-top:3px">${k}</span><span style="font:400 16px/1.35 ${F.soft};color:${C.ink}">${v}</span></div>`;
const cardHead = (t, r) => `<div style="display:flex;justify-content:space-between;${mono(10, C.chilli)};margin-bottom:6px"><span>${t}</span><span style="color:${C.cocoa}">${r || ''}</span></div>`;

// 02 Folder open: saved versions in the pocket, a fresh title sheet on top.
function folderOpen() {
  const page = `${pageHead(0, 4, 'New document · Artist bio', 'Start a new bio.').replace('Page 0 of 4', 'About 5 minutes')}
    <div style="margin-top:22px;width:420px;font:400 18px/1.5 ${F.soft};color:${C.cocoa}">Four short pages of notes, then a draft you can edit. Fragments are fine. The draft uses only what you write here, so nothing is invented.</div>
    <div style="margin-top:34px;border-top:1px solid rgba(76,66,64,.18)">
      ${['Purpose · what it is for and how long', 'Practice · name, medium, place', 'The work · subjects, materials, one detail', 'Background · only what belongs in this version'].map((t, i) => `<div style="display:flex;gap:18px;padding:13px 0;border-bottom:1px solid rgba(76,66,64,.18)"><span style="${mono(11, C.chilli)};padding-top:4px">0${i + 1}</span><span style="font:400 17px/1.35 ${F.soft};color:${C.ink}">${t}</span></div>`).join('')}
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:14px">${btn('Begin →')}${btn('Start from a filed version', 'secondary')}</div>`;
  return header() + spread({
    active: -1,
    left: leftTitle('01 · Artist bio · 3 versions filed', 'Artist bio', 'Who you are, where you work and what you make. Keep a version for each occasion.'),
    slips: slipsFrom(BIO_DOCS), pocketH: 250,
    pocket: `<div style="display:flex;justify-content:space-between;${mono(10.5, C.peony)}"><span>In this folder</span><span>Search · Sort by date</span></div>`,
    page,
  });
}

// 03 Page 1: purpose and length.
function page1() {
  const page = `${pageHead(1, 4, '01 · Purpose', 'What are you preparing this bio for?')}
    <div style="margin-top:26px">${fieldLabel('Where will it be used?')}${hint('This sets tone and what to leave out. It is kept with this version.')}
      <div style="display:flex;flex-wrap:wrap;gap:8px">${chip('Website')}${chip('Gallery or exhibition', true)}${chip('Application')}${chip('Press')}${chip('Social profile')}${chip('Other')}</div></div>
    <div style="margin-top:28px;display:grid;grid-template-columns:1fr 1fr;gap:28px">
      <div>${fieldLabel('Word maximum', true)}${ruled('150', true)}<div style="margin-top:8px;${mono(10, C.cocoa)}">Common: 50 · 100 · 150 · 250</div></div>
      <div>${fieldLabel('Written in')}<div style="display:flex;border-radius:999px;box-shadow:inset 0 0 0 1px rgba(106,6,32,.28);padding:3px;height:44px">
        <div style="flex:1;border-radius:999px;background:${C.burgundy};color:${C.peony};display:flex;align-items:center;justify-content:center;font:600 14px/1 ${F.ui}">Third person</div>
        <div style="flex:1;display:flex;align-items:center;justify-content:center;font:500 14px/1 ${F.ui};color:${C.burgundy}">First person</div></div></div>
    </div>
    <div style="margin-top:26px">${fieldLabel('Pronouns')}<div style="display:flex;flex-wrap:wrap;gap:8px">${chip('she/her', true)}${chip('he/him')}${chip('they/them')}${chip('Name only')}${chip('Custom')}</div></div>
    ${pageFoot(false, 'Next page', false)}`;
  return header() + spread({
    active: 0, done: 0,
    left: leftTitle('01 · Artist bio · New version', 'Your notes', 'Each page adds to these notes. Nothing is drafted until you reach the last page.'),
    pocketH: 150, card: { h: 230, html: `${cardHead('Notes · page 1', 'Saved as you type')}${cardLine('For', 'Gallery application', true)}${cardLine('Length', 'Up to 150 words', true)}${cardLine('Voice', 'Third person, she/her', true)}` },
    pocket: `<div style="${mono(10.5, C.peony)}">Notes are kept with this version, not your profile</div>`,
    page,
  });
}

// 04 Page 2: practice, with a clearly fictional example.
function page2() {
  const page = `${pageHead(2, 4, '02 · Practice', 'How would you describe what you make?')}
    <div style="margin-top:24px">${fieldLabel('Name as it should appear')}${ruled('Sana Iqbal')}</div>
    <div style="margin-top:22px">${fieldLabel('Medium or practice')}${hint('Plain words are best. Notes and fragments are fine.')}${ruled('textiles, natural dye, large hangings', true)}
      ${exampleNote('“Painter working in oil and found wood.”')}</div>
    <div style="margin-top:22px">${fieldLabel('Where you live or work', true)}${ruled('', false, 'City, region or country')}</div>
    <div style="margin-top:22px">${fieldLabel('Subjects or questions you return to')}${ruled('salt, coastlines, my grandmother’s kitchen')}</div>
    ${pageFoot(true, 'Next page', true)}`;
  return header() + spread({
    active: 1, done: 1,
    left: leftTitle('01 · Artist bio · New version', 'Your notes', 'Gathered from your pages, in your words.'),
    pocketH: 150, card: { h: 320, html: `${cardHead('Notes · pages 1–2', 'Saved as you type')}${cardLine('For', 'Gallery application, up to 150 words')}${cardLine('Voice', 'Third person, she/her')}${cardLine('Name', 'Sana Iqbal', true)}${cardLine('Practice', 'textiles, natural dye, large hangings', true)}${cardLine('Subjects', 'salt, coastlines, my grandmother’s kitchen', true)}` },
    pocket: `<div style="${mono(10.5, C.peony)}">Select a note to return to its page</div>`,
    page,
  });
}

const DRAFT = `Sana Iqbal is a textile artist who works with natural dye and large woven hangings. Her work returns to salt, coastlines and the kitchen of her grandmother’s house, <span style="background:rgba(255,243,178,.9);box-shadow:0 0 0 2px rgba(255,243,178,.9)">where she first learned to dye cloth with onion skins and rust</span>. She dyes each length by hand and leaves the uneven edges of the dye bath visible, so the colour records time spent in the water. Self-taught, she has developed her process through years of daily practice. Her current series, Salt Rooms, is a set of hangings dyed in seawater collected along one stretch of coast.`;

// 05 Review: edit the draft directly; facts and length beside it.
function review(dim) {
  const page = `<div style="display:flex;justify-content:space-between;${mono(11, C.chilli)}"><span>Draft · Artist bio · Third person</span><span style="color:${C.cocoa}">Edited by you</span></div>
    <div style="margin-top:22px;font:400 19.5px/1.58 ${F.soft};color:${C.ink}">${DRAFT}<span style="display:inline-block;width:1.5px;height:22px;background:${C.ink};vertical-align:-4px;margin-left:2px"></span></div>
    <div style="margin-top:24px">
      <div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font:600 15px/1 ${F.ui};color:${C.ink}">104 of 150 words</span><span style="${mono(10, C.petrol)}">Fits your limit</span></div>
      <div style="margin-top:10px;height:4px;border-radius:4px;background:rgba(76,66,64,.14)"><div style="width:69%;height:4px;border-radius:4px;background:${C.petrol}"></div></div>
    </div>
    <div style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:6px">${btn('Copy', 'secondary', 'padding:0 18px;')}${btn('Download .txt', 'secondary', 'padding:0 18px;')}</div>${btn('File this version →')}</div>`;
  const used = [
    ['Name', 'Sana Iqbal'], ['Practice', 'textiles, natural dye, large hangings'], ['Subjects', 'salt, coastlines, grandmother’s kitchen'],
    ['Detail', 'onion skins and rust'], ['Training', 'self-taught (you said so)'], ['Series', 'Salt Rooms'],
  ];
  return header() + spread({
    active: 4, done: 4,
    left: `${leftTitle('01 · Artist bio · Draft', 'Review', '')}
      <div style="margin-top:16px;width:450px;font:400 17px/1.45 ${F.soft};color:${C.peony}">Edit the page directly. Every fact comes from your notes.</div>`,
    pocketH: 250, card: { h: 310, html: `${cardHead('Facts used', '6 of 6 notes')}${used.map(([k, v]) => cardLine(k, v)).join('')}<div style="margin-top:10px;font:italic 400 14.5px/1.4 ${F.soft};color:${C.cocoa}">Location was left blank, so no place is mentioned.</div>` },
    pocket: `<div style="${mono(10.5, C.hotRose)}">Draft options</div>
      <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap">${btn('Switch to first person', 'onDark', 'height:38px;padding:0 16px;font-size:14px;')}${btn('Shorter version', 'onDark', 'height:38px;padding:0 16px;font-size:14px;')}</div>
      <div style="margin-top:14px;font:400 14.5px/1.45 ${F.soft};color:${C.peony}">New drafts open beside yours. Your edits are never replaced.</div>`,
    page,
    overlay: dim ? dim : '',
  });
}

// 06 Filing slip slides up over the review page.
function filing() {
  const slip = `<div data-group="Filing slip" style="position:absolute;left:660px;top:392px;width:532px;height:352px;${paperBg}border-radius:4px;box-shadow:0 0 0 1px rgba(76,66,64,.18),0 -10px 30px -12px rgba(42,10,18,.35),0 30px 50px -24px rgba(42,10,18,.45);padding:32px 40px;transform:rotate(-.6deg)">
    <div style="${mono(11, C.chilli)}">File this version</div>
    <div style="margin-top:12px;font:300 34px/1.05 ${F.soft};letter-spacing:-.02em;color:${C.burgundy}">Name it so you can find it again.</div>
    <div style="margin-top:20px">${fieldLabel('Version name')}${ruled('Gallery application, short', true)}</div>
    <div style="margin-top:20px;display:flex;gap:24px;${mono(10.5, C.cocoa)}"><span>Folder · Artist bio</span><span>Becomes V4</span><span>104 words</span></div>
    <div style="position:absolute;left:38px;right:38px;bottom:32px;display:flex;justify-content:space-between;align-items:center">${btn('Keep editing', 'secondary')}${btn('File in Artist bio →')}</div>
  </div>`;
  return review(slip);
}

// 07 Filed: the new slip sits on top of the pocket with its date mark.
function filed() {
  const docs = [...BIO_DOCS, { title: 'Gallery application, short', words: 104, date: '11.10.2026' }];
  const slips = slipsFrom(docs); slips[0].fresh = true; slips[0].meta = 'Filed today · V4';
  const page = `<div style="display:flex;justify-content:space-between;${mono(11, C.chilli)}"><span>V4 · Gallery application, short</span><span style="color:${C.cocoa}">104 words</span></div>
    <div style="margin-top:22px;font:400 19.5px/1.58 ${F.soft};color:${C.ink}">${DRAFT.replace(/<span[^>]*>|<\/span>/g, '')}</div>
    <div style="position:absolute;right:-6px;top:440px;transform:rotate(-4deg);padding:10px 14px;border-radius:6px;box-shadow:inset 0 0 0 1.5px rgba(2,80,84,.7);${mono(10.5, C.petrol)};line-height:1.6">Filed 11.10.2026 · 14:32<br>Saved on this device</div>
    <div style="position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between">
      <div style="display:flex;gap:6px">${btn('Copy', 'secondary', 'padding:0 18px;')}${btn('.txt', 'secondary', 'padding:0 18px;')}${btn('Print', 'secondary', 'padding:0 18px;')}</div>${btn('Edit as new version')}</div>`;
  return header() + spread({
    active: -1, done: 5,
    left: leftTitle('01 · Artist bio · 4 versions filed', 'Artist bio', 'Filed. Open any version to copy, export or adapt it for another occasion.'),
    slips, pocketH: 250,
    pocket: `<div style="display:flex;justify-content:space-between;${mono(10.5, C.peony)}"><span>In this folder</span><span>Search · Sort by date</span></div>`,
    page,
  }) + `<div data-group="Toast / Filed" style="position:absolute;left:50%;transform:translateX(-50%);bottom:16px;display:flex;align-items:center;gap:12px;height:44px;padding:0 20px;border-radius:999px;background:${C.petrol};color:${C.pistachio};font:500 14px/1 ${F.ui}">Filed in Artist bio as V4 · Saved on this device<span style="text-decoration:underline;text-underline-offset:3px">Undo</span></div>`;
}

const list = [
  { name: '01 Studio · Desktop', w: 1440, h: 1000, bg: desk(), html: studioHome() },
  { name: '02 Folder open · Desktop', w: 1440, h: 940, bg: desk(), html: folderOpen() },
  { name: '03 Page 1 Purpose · Desktop', w: 1440, h: 940, bg: desk(), html: page1() },
  { name: '04 Page 2 Practice · Desktop', w: 1440, h: 940, bg: desk(), html: page2() },
  { name: '05 Review draft · Desktop', w: 1440, h: 940, bg: desk(), html: review() },
  { name: '06 File this version · Desktop', w: 1440, h: 940, bg: desk(), html: filing() },
  { name: '07 Filed · Desktop', w: 1440, h: 972, bg: desk(), html: filed() },
];
const X = require('./extra.cjs');
list.push(
  { name: '08 Studio · Mobile', w: 390, h: 844, bg: desk(), html: X.mStudio() },
  { name: '09 Page 2 Practice · Mobile', w: 390, h: 844, bg: desk(), html: X.mPage2() },
  { name: '10 Review draft · Mobile', w: 390, h: 844, bg: desk(), html: X.mReview() },
  { name: '11 Foundations', w: 1440, h: 1640, bg: desk(C.paper), html: X.foundations() },
  { name: '12 Folder anatomy and states', w: 1440, h: 1040, bg: desk(), html: X.anatomy() },
  { name: '13 Motion and sound', w: 1440, h: 1480, bg: desk(C.paper), html: X.motion() },
);
module.exports = { list };
