/* StudioService: the only place the UI touches persistence or generation.
   This file is the browser-local MOCK. ATH replaces it with an implementation that calls
   the account, document/version, generation and entitlement APIs with the same method shapes.
   Never put API secrets in frontend code; generation must run server-side. */
(function (root) {
  'use strict';
  const KEY = 'ath-studio-v2';
  const now = () => new Date().toISOString();
  const uid = () => Math.random().toString(36).slice(2, 10);

  const SAMPLE = [
    { type: 'bio', title: 'Website, long', words: 212, date: '2026-09-02', purpose: 'Website', sample: true, text: 'Sample document for design review.' },
    { type: 'bio', title: 'Open call, 100 words', words: 97, date: '2026-09-21', purpose: 'Application', sample: true, text: 'Sample document for design review.' },
    { type: 'bio', title: 'Gallery application', words: 148, date: '2026-10-08', purpose: 'Gallery or exhibition', sample: true, text: 'Sample document for design review.' },
    { type: 'statement', title: 'Salt Rooms series', words: 286, date: '2026-09-30', purpose: 'Application', sample: true, text: 'Sample document for design review.' },
  ];

  function read() {
    try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.docs) return s; } catch (e) { /* storage blocked */ }
    return { docs: SAMPLE.map((d) => ({ id: uid(), ...d })), drafts: {}, prefs: {} };
  }
  let state = read();
  function write() { try { localStorage.setItem(KEY, JSON.stringify(state)); return true; } catch (e) { return false; } }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const Service = {
    mode: 'local-demo',
    // Documents (filed versions), newest last
    async listDocuments(type) { return state.docs.filter((d) => !type || d.type === type).sort((a, b) => a.date.localeCompare(b.date)); },
    async getDocument(id) { return state.docs.find((d) => d.id === id) || null; },
    async fileVersion({ type, title, text, words, purpose, answers }) {
      await wait(260); // simulate the network so the UI waits for a real success
      const doc = { id: uid(), type, title, text, words, purpose, answers, date: now().slice(0, 10), filedAt: now() };
      state.docs.push(doc);
      if (!write()) { state.docs.pop(); throw new Error('Could not save on this device.'); }
      return doc;
    },
    async removeDocument(id) { state.docs = state.docs.filter((d) => d.id !== id); write(); },
    async removeSamples() { state.docs = state.docs.filter((d) => !d.sample); write(); },
    // Work in progress (autosave), one per document type
    loadDraft(type) { return state.drafts[type] || null; },
    saveDraft(type, draft) { state.drafts[type] = { ...draft, savedAt: now() }; write(); },
    clearDraft(type) { delete state.drafts[type]; write(); },
    // Preferences
    prefs() { return { theme: null, sound: false, volume: 0.6, motion: true, ...state.prefs }; },
    setPref(k, v) { state.prefs[k] = v; write(); },
    // Generation: template writer in the prototype. Production: POST to the server.
    async generate(type, answers) { await wait(120); return root.StudioLogic.compose(answers, type); },
  };
  root.StudioService = Service;
})(window);
