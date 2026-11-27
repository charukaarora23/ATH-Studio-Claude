// Text of every page of a PDF (no AI): one string per page, a new line wherever the PDF ends a line.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as worker from 'pdfjs-dist/legacy/build/pdf.worker.mjs';
globalThis.pdfjsWorker = worker;   // run in this process, no separate worker file
export async function pdfPages(bytes){
  const doc = await pdfjs.getDocument({data: new Uint8Array(bytes), isEvalSupported: false, useSystemFonts: false, disableFontFace: true, verbosity: 0}).promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) { const pg = await doc.getPage(i); const tc = await pg.getTextContent();
    let s = '', lastY = null; for (const it of tc.items) { if (!('str' in it)) continue; const y = it.transform ? Math.round(it.transform[5]) : null;
      if (lastY !== null && y !== null && Math.abs(y - lastY) > 2 && !s.endsWith('\n')) s += '\n'; s += it.str; if (it.hasEOL) s += '\n'; lastY = y; }
    pages.push(s); pg.cleanup(); }
  await doc.destroy(); return pages;
}
