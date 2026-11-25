// Stream a Dropbox folder zip and hand back each image as it arrives, without holding the whole zip.
// Dropbox zips can be gigabytes, can't be fetched by byte range, and often omit file sizes in the
// local headers (data descriptors). PNG and JPEG files mark their own end, so we split on that.
import zlib from 'node:zlib';
const LOC = 0x04034b50, CEN = 0x02014b50;
const IEND = Buffer.from('IEND'), EOI = Buffer.from([0xff, 0xd9]);

function imageEnd(buf, name, from){
  if (/\.png$/i.test(name)) { const i = buf.indexOf(IEND, from); return i < 0 ? -1 : i + 8; }
  if (/\.jpe?g$/i.test(name)) { // the end marker followed by the next zip record (descriptor or header)
    let i = from; for (;;) { i = buf.indexOf(EOI, i); if (i < 0) return -1; const k = i + 2;
      if (k + 4 > buf.length) return -1; const s = buf.readUInt32LE(k); if (s === 0x08074b50 || s === LOC || s === CEN) return k; i = k; } }
  return -2;   // not an image we can split: skip to the next header
}

// onImage(name, bytes) may return a promise; it is awaited so memory stays small. Stops early when shouldStop() is true.
export async function streamZipImages(url, onImage, {shouldStop = () => false, want = () => true} = {}){
  const r = await fetch(url, {redirect: 'follow'}); if (!r.ok) throw new Error('Dropbox folder could not be downloaded (' + r.status + ')');
  const rd = r.body.getReader(); let buf = Buffer.alloc(0), done = false, files = 0;
  const more = async () => { if (done) return false; const {done: d, value} = await rd.read(); if (d) { done = true; return false; } buf = buf.length ? Buffer.concat([buf, Buffer.from(value)]) : Buffer.from(value); return true; };
  const need = async n => { while (buf.length < n) if (!await more()) return false; return true; };
  const seekHeader = async () => { for (;;) { const i = buf.indexOf('PK', 0); if (i >= 0 && buf.length >= i + 4) { const s = buf.readUInt32LE(i);
        if (s === LOC || s === CEN) { buf = buf.subarray(i); return s; } buf = buf.subarray(i + 2); continue; }
      if (i < 0 && buf.length > 1) buf = buf.subarray(buf.length - 1); if (!await more()) return 0; } };
  try {
    for (;;) {
      if (shouldStop()) break;
      const sig = await seekHeader(); if (sig !== LOC) break;
      if (!await need(30)) break;
      const flag = buf.readUInt16LE(6), method = buf.readUInt16LE(8); let csize = buf.readUInt32LE(18); const nl = buf.readUInt16LE(26), xl = buf.readUInt16LE(28);
      if (!await need(30 + nl + xl)) break;
      const name = buf.subarray(30, 30 + nl).toString('utf8'); const extra = buf.subarray(30 + nl, 30 + nl + xl);
      if (csize === 0xffffffff) { for (let p = 0; p + 4 <= extra.length;) { const id = extra.readUInt16LE(p), sz = extra.readUInt16LE(p + 2); if (id === 1 && sz >= 16) csize = Number(extra.readBigUInt64LE(p + 12)); p += 4 + sz; } }
      buf = buf.subarray(30 + nl + xl);
      const isImg = /\.(png|jpe?g)$/i.test(name) && !/(^|\/)(__MACOSX|\.)/.test(name); const keep = isImg && want(name);
      let data = null;
      if (!(flag & 8) || csize) {   // size known
        if (keep) { if (!await need(csize)) break; data = buf.subarray(0, csize); }
        else { let left = csize; while (left > 0) { if (!buf.length && !await more()) break; const k = Math.min(left, buf.length); buf = buf.subarray(k); left -= k; } }
        if (keep) buf = buf.subarray(csize);
      } else if (method === 0) {   // stored, size unknown: find where the image ends
        let end; for (;;) { end = imageEnd(buf, name, 0); if (end !== -1) break; if (!await more()) { end = buf.length; break; } }
        if (end === -2) continue;   // not splittable: resync on the next header
        if (keep) data = buf.subarray(0, end); buf = buf.subarray(end);
      } else if (method === 8) {   // deflated, size unknown: inflate until the stream ends
        for (;;) { try { const out = zlib.inflateRawSync(buf, {info: true}); const used = out.engine.bytesWritten; if (keep) data = out.buffer; buf = buf.subarray(used); break; }
          catch (e) { if (!await more()) throw e; } }
        if (keep) { files++; await onImage(name, data); } continue;
      } else continue;
      if (keep && data) { files++; await onImage(name, method === 8 ? zlib.inflateRawSync(data) : Buffer.from(data)); }
    }
  } finally { try { await rd.cancel(); } catch {} }
  return files;
}
