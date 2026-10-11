/* Writing logic: pure functions, shared by the app and the tests.
   Template writer for the prototype. It only uses what the artist typed; it never adds facts.
   Production replaces compose() with a server generation call that follows the same contract. */
(function (root) {
  'use strict';

  const clean = (v) => String(v || '').trim().replace(/\s+/g, ' ');
  const count = (t) => clean(t).split(/\s+/u).filter(Boolean).length;
  const cap = (t) => (t ? t[0].toUpperCase() + t.slice(1) : '');
  const sentence = (t) => { const s = clean(t); return s ? cap(s).replace(/[.!?]+$/, '') + (/[!?]$/.test(s) ? s.slice(-1) : '.') : ''; };
  const article = (t) => (/^(?:[aeio]|u(?!ni|se|sa))/i.test(clean(t)) ? 'an' : 'a');
  // "salt, coastlines, my kitchen" -> "salt, coastlines and my kitchen"
  const list = (t) => { const parts = clean(t).split(/\s*,\s*/).filter(Boolean); if (parts.length < 2) return parts[0] || ''; if (/\band\b/.test(parts[parts.length - 1])) return parts.join(', '); return parts.slice(0, -1).join(', ') + ' and ' + parts[parts.length - 1]; };

  const PRONOUNS = {
    she: { subj: 'she', poss: 'her', s: true },
    he: { subj: 'he', poss: 'his', s: true },
    they: { subj: 'they', poss: 'their', s: false },
  };

  // Voice: who the sentences are about.
  function voice(a) {
    const name = clean(a.name) || 'The artist';
    if (a.person === 'first') return { first: true, subj: 'I', poss: 'my', name, verb: (base) => base, be: 'am' };
    const p = PRONOUNS[a.pronouns];
    if (!p) return { first: false, subj: name, poss: name + '’s', name, verb: thirdS, be: 'is' };
    return { first: false, subj: p.subj, poss: p.poss, name, verb: p.s ? thirdS : (b) => b, be: p.s ? 'is' : 'are' };
  }
  function thirdS(base) { if (/(s|sh|ch|x|z|o)$/.test(base)) return base + 'es'; if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + 'ies'; return base + 's'; }

  /* Each part: {key, text, keep}. keep=true parts are identity and are never dropped.
     Optional parts are dropped whole, lowest priority first, to fit a word maximum. */
  function bioParts(a) {
    const v = voice(a);
    const parts = [];
    const role = clean(a.role);
    const loc = clean(a.location);
    if (role) {
      const lead = v.first ? 'I am' : `${v.name} is`;
      parts.push({ key: 'role', keep: true, prio: 0, text: `${lead} ${article(role)} ${role}${loc ? ' based in ' + loc : ''}.` });
    } else if (v.first || clean(a.name)) {
      parts.push({ key: 'role', keep: true, prio: 0, text: v.first ? `I am an artist${loc ? ' based in ' + loc : ''}.` : `${v.name} is an artist${loc ? ' based in ' + loc : ''}.` });
    }
    if (clean(a.subjects)) parts.push({ key: 'subjects', prio: 1, text: sentence(`${cap(v.poss)} work returns to ${list(a.subjects)}`) });
    if (clean(a.materials)) parts.push({ key: 'materials', prio: 2, text: sentence(`${cap(v.first ? 'I' : v.subj)} ${v.first ? 'work' : v.verb('work')} with ${list(a.materials)}`) });
    if (clean(a.detail)) parts.push({ key: 'detail', prio: 3, text: sentence(a.detail) });
    if (clean(a.series)) parts.push({ key: 'series', prio: 4, text: sentence(`${cap(v.poss)} current series is ${clean(a.series)}${clean(a.seriesLine) ? ': ' + clean(a.seriesLine).replace(/[.!?]+$/, '') : ''}`) });
    if (clean(a.background)) parts.push({ key: 'background', prio: 5, text: sentence(a.background) });
    return parts;
  }

  function statementParts(a) {
    const v = voice({ ...a, person: a.person || 'first' });
    const parts = [];
    if (clean(a.subjects)) parts.push({ key: 'subjects', keep: true, prio: 0, text: sentence(`${cap(v.poss)} work explores ${list(a.subjects)}`) });
    if (clean(a.question)) parts.push({ key: 'question', prio: 1, text: sentence(a.question) });
    if (clean(a.materials)) parts.push({ key: 'materials', prio: 2, text: sentence(`${cap(v.first ? 'I' : v.subj)} ${v.first ? 'work' : v.verb('work')} with ${list(a.materials)}`) });
    if (clean(a.detail)) parts.push({ key: 'detail', prio: 3, text: sentence(a.detail) });
    if (clean(a.motivation)) parts.push({ key: 'motivation', prio: 1, text: sentence(a.motivation) });
    if (clean(a.series)) parts.push({ key: 'series', prio: 4, text: sentence(`${cap(v.poss)} current series is ${clean(a.series)}${clean(a.seriesLine) ? ': ' + clean(a.seriesLine).replace(/[.!?]+$/, '') : ''}`) });
    return parts;
  }

  /* compose -> {text, words, omitted:[keys], over:boolean, used:[keys]} */
  function compose(answers, type) {
    const a = answers || {};
    const parts = type === 'statement' ? statementParts(a) : bioParts(a);
    const max = Number(a.limit) || 0;
    const join = (ps) => ps.map((p) => p.text).join(' ');
    let chosen = parts.slice();
    const omitted = [];
    if (max) {
      const optional = parts.filter((p) => !p.keep).sort((x, y) => y.prio - x.prio);
      for (const p of optional) {
        if (count(join(chosen)) <= max) break;
        chosen = chosen.filter((c) => c !== p);
        omitted.push(p.key);
      }
    }
    const text = join(chosen);
    const words = count(text);
    return { text, words, omitted, over: !!max && words > max, used: chosen.map((p) => p.key) };
  }


  // Outcome variations: the same facts at different lengths. Whole optional sentences are dropped, never rewritten.
  const VARIANTS = {
    bio: [['full', 'Full', 0], ['short', 'Short', 100], ['brief', 'Brief', 50], ['line', 'One line', 1]],
    statement: [['full', 'Full', 0], ['short', 'Short', 150], ['brief', 'Brief', 75], ['line', 'One line', 1]],
  };
  function variants(answers, type) {
    const a = answers || {}; const list = VARIANTS[type === 'statement' ? 'statement' : 'bio'];
    const out = []; let prev = null;
    for (const [key, label, lim] of list) {
      const limit = key === 'full' ? (Number(a.limit) || 0) : lim;
      const r = compose({ ...a, limit }, type);
      out.push({ key, label, limit: key === 'line' ? 0 : limit, ...r, over: key === 'line' ? false : r.over, same: !!prev && prev.text === r.text });
      prev = r;
    }
    return out;
  }

  const api = { clean, count, sentence, list, compose, thirdS, variants };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.StudioLogic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
