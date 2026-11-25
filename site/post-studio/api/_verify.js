// Checks every artist in a book's sheet against the final PDF text: in print or not, their own page, artwork title as printed.
// No AI, works for any layout: it only looks for the words.
export const fold = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
export function verifyArtists(artists, normPages){
  const P = normPages.map(p => ' ' + p + ' '); const has = (p, w) => p.includes(' ' + w + ' ');
  const list = (artists || []).map(a => { const words = fold(a.name).split(' ').filter(w => w.length > 1); return {a, words, first: words[0], last: words[words.length - 1]}; }).filter(x => x.words.length);
  const pagesOf = x => { let pg = P.map((p, i) => x.words.every(w => has(p, w)) ? i : -1).filter(i => i >= 0); if (!pg.length) pg = P.map((p, i) => has(p, x.first) && has(p, x.last) ? i : -1).filter(i => i >= 0); return pg; };
  list.forEach(x => { x.pages = pagesOf(x); });
  // how many selected artists each page names: contents, index and "editor's pick" pages name many; an artist's own page names one
  const crowd = P.map(() => 0); list.forEach(x => x.pages.forEach(i => { crowd[i]++; }));
  let inPrint = 0; const missing = [], titleCheck = [];
  list.forEach(x => {
    if (!x.pages.length) { x.a.print = {page: 0}; missing.push(x.a.name); return; }
    const own = [...x.pages].sort((i, j) => crowd[i] - crowd[j] || j - i)[0];
    const title = fold(String(((x.a.works || [])[0] || {}).details || '').split(/,\s*/)[0]);
    const near = [own - 1, own, own + 1, own + 2, own + 3].filter(i => i >= 0 && i < P.length);
    const titleOk = title.length > 2 ? near.some(i => P[i].includes(' ' + title + ' ')) : null;
    x.a.print = {page: own + 1, title: titleOk}; inPrint++; if (titleOk === false) titleCheck.push(x.a.name);
  });
  return {total: list.length, inPrint, missing, titleCheck};
}
