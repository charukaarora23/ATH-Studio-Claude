// One place for the app's shared JSON files in Vercel Blob, written so that reading costs no store operation.
// Each file lives at one fixed path and is overwritten on save; reads fetch its public URL directly
// (no list(), no head()). Only saving counts as an operation. Older builds kept a new file per save
// and listed the store on every page load, which used up the plan's operations (Nov 2026).
import { put, list } from '@vercel/blob';

let BASE = '';   // learned from the first save if the token-derived address ever differs
export function blobUrl(path){
  if (BASE) return BASE + path;
  const id = (String(process.env.BLOB_READ_WRITE_TOKEN || '').split('_')[3] || '').toLowerCase();
  return id ? `https://${id}.public.blob.vercel-storage.com/${path}` : '';
}

// fresh=true skips the CDN copy so a save made a moment ago on another function is seen
export async function readJSON(path, {fresh = true} = {}){
  const u = blobUrl(path); if (!u) throw new Error('Blob storage is not connected (BLOB_READ_WRITE_TOKEN missing).');
  const r = await fetch(fresh ? u + '?v=' + Date.now() : u, {cache: 'no-store'});
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(`Saved data could not be read (storage answered ${r.status}). If Vercel Blob is over its plan limit, the store is paused.`);
  return r.json();
}

export async function writeJSON(path, data){
  const saved = await put(path, JSON.stringify(data), {access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 60});
  if (saved && saved.url && saved.url !== blobUrl(path)) BASE = saved.url.slice(0, saved.url.length - path.length);
  return saved;
}

// first read after the switch: carry over the newest file of the old one-file-per-save layout, once
const tried = new Set();
export async function readOrMigrate(path, oldPrefix, empty){
  const cur = await readJSON(path); if (cur !== null) return cur;
  if (tried.has(path)) return empty; tried.add(path);
  const { blobs } = await list({prefix: oldPrefix, limit: 1000});
  blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  let data = empty; if (blobs.length) { const r = await fetch(blobs[0].url, {cache: 'no-store'}); if (r.ok) data = await r.json(); }
  await writeJSON(path, data); return data;
}

// one dated backup per file per day (per warm function), so an overwrite can always be undone
const backed = {};
export async function backupDaily(path, data){
  const day = new Date().toISOString().slice(0, 10); if (backed[path] === day) return; backed[path] = day;
  await put(path.replace(/\.json$/, '') + '-backup-' + day + '.json', JSON.stringify(data), {access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json'}).catch(() => {});
}
