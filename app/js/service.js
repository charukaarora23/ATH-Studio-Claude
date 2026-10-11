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
    async fileVersion({ type, title, text, words, purpose, answers, variant, images }) {
      await wait(260); // simulate the network so the UI waits for a real success
      const doc = { id: uid(), type, title, text, words, purpose, answers, variant, images: images || [], date: now().slice(0, 10), filedAt: now() };
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

  /* Images of the artist's work. Kept in IndexedDB on this device (in memory if that is blocked).
     Production: upload to storage and keep only ids and captions here. */
  const imgCache = new Map(); let dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise((res) => {
      try { const r = indexedDB.open('ath-studio-images', 1); r.onupgradeneeded = () => r.result.createObjectStore('img'); r.onsuccess = () => res(r.result); r.onerror = () => res(null); } catch (e) { res(null); }
    });
    return dbp;
  }
  async function idb(mode, fn) { const d = await db(); if (!d) return null; return new Promise((res) => { try { const tx = d.transaction('img', mode); const q = fn(tx.objectStore('img')); tx.oncomplete = () => res(q && q.result); tx.onerror = () => res(null); } catch (e) { res(null); } }); }
  // Downscale to 1400px on the long edge so files stay small; keeps the original proportions.
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file); const im = new Image();
      im.onload = () => { const k = Math.min(1, 1400 / Math.max(im.width, im.height)); const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(url); res({ src: c.toDataURL('image/jpeg', 0.84), w: c.width, h: c.height }); };
      im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('That file could not be read as an image.')); };
      im.src = url;
    });
  }
  Service.addImage = async function (fileOrSrc) {
    const img = typeof fileOrSrc === 'string' ? { src: fileOrSrc } : await shrink(fileOrSrc);
    const id = 'img_' + uid(); imgCache.set(id, img.src); await idb('readwrite', (st) => st.put(img.src, id));
    return { id, w: img.w, h: img.h };
  };
  Service.imageSrc = async function (id) { if (imgCache.has(id)) return imgCache.get(id); const v = await idb('readonly', (st) => st.get(id)); if (v) imgCache.set(id, v); return v || null; };
  Service.removeImage = async function (id) { imgCache.delete(id); await idb('readwrite', (st) => st.delete(id)); };
  root.StudioService = Service;
})(window);
