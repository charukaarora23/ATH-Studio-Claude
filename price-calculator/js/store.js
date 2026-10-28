/* Saved calculations, kept per user. This is the browser-local version (localStorage).
   To move to ATH's backend, keep these method shapes and swap the bodies for API calls:
   list() -> GET, save(rec) -> POST, remove(id) -> DELETE.

   Record: { id, mode, inputs, price, priceSource, title, createdAt } */
(function (root) {
  'use strict';
  const PREFIX = 'ath-price-calculator:v1:';
  let user = 'local'; // set from the ATH session when there is one: ATHStore.setUser(account.id)
  let memory = null; // used when storage is blocked (private windows, previews)

  const key = () => PREFIX + user;
  function read() {
    if (memory) return memory.slice();
    try { const a = JSON.parse(localStorage.getItem(key())); return Array.isArray(a) ? a : []; } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(key(), JSON.stringify(list)); memory = null; } catch (e) { memory = list.slice(); }
  }
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  root.ATHStore = {
    setUser(id) { user = String(id || 'local'); memory = null; },
    // Newest first.
    async list() { return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt)); },
    async save({ mode, inputs, price, priceSource, title, createdAt }) {
      const rec = { id: uid(), mode, inputs: Object.assign({}, inputs), price, priceSource: priceSource || 'prototype', title: (title || '').trim(), createdAt: createdAt || new Date().toISOString() };
      write([rec].concat(read()));
      return rec;
    },
    async remove(id) { write(read().filter((r) => r.id !== id)); },
  };
})(typeof window !== 'undefined' ? window : globalThis);
