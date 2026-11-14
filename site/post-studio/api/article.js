// Import an interview from its article link.
// POST { url } -> { url, title, text, images: [{ url, alt, cap }], ai: {...} | null, aiError? }
// 1. Fetch the page and pull the article text and images in reading order.
// 2. Copy the images into Blob storage so slides can use and export them.
// 3. If ANTHROPIC_API_KEY is set, ask Claude to structure the carousel copy. Otherwise the browser does it with rules.
import { put } from '@vercel/blob';
import Anthropic from '@anthropic-ai/sdk';

const UA = 'Mozilla/5.0 (compatible; ATH-Studio/1.0)';
const ent = s => String(s || '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16))).replace(/&[rl]squo;/g, '’').replace(/&[rl]dquo;/g, '"').replace(/&hellip;/g, '…').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–');
const strip = s => ent(String(s || '').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '')).replace(/[ \t]+/g, ' ').replace(/\s*\n\s*/g, '\n').trim();
const attr = (tag, name) => { const m = new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(tag); return m ? ent(m[2] ?? m[3]) : ''; };
const SKIP = /logo|icon|avatar|gravatar|emoji|sprite|pixel|badge|placeholder|spinner|blank\.gif|data:image|\.svg(\?|$)/i;

function bestSrc(tag, base){
  const set = attr(tag, 'srcset') || attr(tag, 'data-srcset');
  let src = '';
  if (set) { const c = set.split(',').map(x => x.trim().split(/\s+/)).map(([u, w]) => ({u, w: parseInt(w) || 0})).sort((a, b) => b.w - a.w); src = c[0] && c[0].u; }
  src = src || attr(tag, 'data-src') || attr(tag, 'data-image') || attr(tag, 'data-lazy-src') || attr(tag, 'data-orig-file') || attr(tag, 'src');
  if (!src || SKIP.test(src)) return '';
  try { return new URL(src, base).href; } catch { return ''; }
}

// Pure extraction, exported for tests.
export function extract(html, base){
  const meta = n => { const m = new RegExp(`<meta[^>]+(?:property|name)=["']${n}["'][^>]*>`, 'i').exec(html); return m ? attr(m[0], 'content') : ''; };
  const title = strip(meta('og:title') || (/<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html) || [])[1] || (/<title[^>]*>([\s\S]*?)<\/title>/i.exec(html) || [])[1] || '');
  let body = html.replace(/<(script|style|noscript|svg|iframe|form)[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const pick = [/<article[\s\S]*?<\/article>/i, /<div[^>]+class=["'][^"']*(entry-content|post-content|article-content|sqs-layout|blog-item-content|rich-text|post-body)[^"']*["'][\s\S]*/i, /<main[\s\S]*?<\/main>/i];
  for (const re of pick) { const m = re.exec(body); if (m && m[0].length > 2000) { body = m[0]; break; } }
  body = body.replace(/<(header|footer|nav|aside)[\s\S]*?<\/\1>/gi, '');
  const blocks = []; const re = /<img\b[^>]*>|<(p|h[1-6]|li|figcaption|blockquote)\b[^>]*>([\s\S]*?)<\/\1>/gi; let m;
  while ((m = re.exec(body))) {
    if (m[0].toLowerCase().startsWith('<img')) { const u = bestSrc(m[0], base); if (u) blocks.push({type: 'img', url: u, alt: attr(m[0], 'alt')}); continue; }
    const t = strip(m[2]); if (t) blocks.push({type: m[1].toLowerCase() === 'figcaption' ? 'cap' : 'p', text: t});
  }
  const images = []; const seen = new Set();
  blocks.forEach((b, i) => { if (b.type !== 'img' || seen.has(b.url)) return; seen.add(b.url);
    const next = blocks.slice(i + 1, i + 3).find(x => x.type !== 'img'); const cap = next && (next.type === 'cap' || / \/ (19|20)\d{2} \/ /.test(next.text) || next.text.length < 140) ? next.text : '';
    images.push({url: b.url, alt: b.alt, cap}); });
  const og = meta('og:image'); if (og && !seen.has(og) && !SKIP.test(og)) images.unshift({url: og, alt: 'cover', cap: ''});
  const text = [title, ...blocks.filter(b => b.type !== 'img').map(b => b.text)].join('\n\n');
  return {title, text, images};
}

async function rehost(images){
  const out = [];
  for (const im of images.slice(0, 16)) {
    try { const r = await fetch(im.url, {headers: {'User-Agent': UA}}); if (!r.ok) continue;
      const type = (r.headers.get('content-type') || '').split(';')[0]; if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(type)) continue;
      const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 12000) continue;   // icons and spacers
      const ext = type.split('/')[1].replace('jpeg', 'jpg');
      const saved = await put('interviews/img-' + Date.now() + '.' + ext, buf, {access: 'public', addRandomSuffix: true, contentType: type});
      out.push({...im, url: saved.url, src: im.url});
    } catch { /* skip images that fail */ }
  }
  return out;
}

const SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['name', 'handle', 'based', 'medium', 'headline', 'lines', 'standfirst', 'quotes', 'picks', 'kicks', 'inside', 'ctahead', 'hook', 'roles'],
  properties: {
    name: {type: 'string'}, handle: {type: 'string', description: 'Instagram handle with @ if the article gives one, else empty'},
    based: {type: 'string'}, medium: {type: 'string'},
    headline: {type: 'string', description: 'Cover headline, max 60 characters'},
    lines: {type: 'array', items: {type: 'string'}, description: 'Exactly 3 cover lines, max 34 characters each'},
    standfirst: {type: 'string', description: 'Two sentences, max 250 characters'},
    quotes: {type: 'array', items: {type: 'string'}, description: 'Exactly 3 quotes, copied word for word from the answers, 60 to 150 characters each'},
    picks: {type: 'array', items: {type: 'integer'}, description: 'Exactly 2 question numbers whose answers open with a story'},
    kicks: {type: 'array', items: {type: 'string'}, description: 'One label per pick, max 44 characters'},
    inside: {type: 'array', items: {type: 'string'}, description: 'Exactly 3 questions from the interview that are not among the picks, copied word for word but trimmed to the actual question sentence, each under 110 characters'},
    ctahead: {type: 'string', description: 'End card line, one sentence pointing to the full interview on our website, max 70 characters'},
    hook: {type: 'string', description: 'First line of the Instagram caption, max 120 characters'},
    roles: {type: 'array', items: {type: 'string', enum: ['art', 'portrait', 'skip']}, description: 'One role per image, in the order given'},
  },
};

const SYSTEM = `You are the senior editor at Arts to Hearts Project, an art magazine and publisher for artists. You turn one artist interview from our website into the copy for an Instagram carousel whose job is to make people curious about the artist and click through to read the full interview.

Voice: plain, warm, specific. No hype, no exclamation marks, no emoji, no clichés such as "dive into", "journey", "unleash", "vibrant", "captivating". Short words. Every line must be true to the article; never invent facts, places or details.

Rules:
- Quotes are the artist's exact words from their answers, copied character for character.
- Cover lines and the reasons to read point at real stories in the interview, phrased so the reader wants the rest (a person, a moment, a decision), not summaries.
- Teaser picks are answers whose opening sentences tell a story and stop before the point.
- Use the pronouns the article uses for the artist. If it uses none, use their name.
- Write like a person, not a list: no labels such as "Why X matters", no noun-phrase fragments, no colons in hooks. Sentences someone would say out loud.
- Images: "art" for the artist's artworks, "portrait" for photos of the artist or their studio, "skip" for anything else (logos, ads, unrelated photos).`;

async function structure(text, images, qaCount){
  const client = new Anthropic();
  const list = images.map((im, i) => `${i + 1}. alt: ${im.alt || '-'} | caption: ${im.cap || '-'}`).join('\n');
  const response = await client.beta.messages.create({
    model: 'claude-opus-5-5', max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default',
    output_config: {effort: 'medium', format: {type: 'json_schema', schema: SCHEMA}},
    system: SYSTEM,
    messages: [{role: 'user', content: `The article (questions are numbered Q1 to Q${qaCount || 'n'} in the order they appear):\n\n${text}\n\nImages on the page, in order:\n${list || '(none)'}`}],
  });
  if (response.stop_reason === 'refusal') throw new Error('Claude declined this article');
  const t = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  return JSON.parse(t);
}

export default async function handler(req, res){
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({error: 'method not allowed'}); }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    let url; try { url = new URL(String(body.url || '').trim()); if (!/^https?:$/.test(url.protocol)) throw 0; } catch { return res.status(400).json({error: 'That does not look like a web link.'}); }
    const r = await fetch(url.href, {headers: {'User-Agent': UA, 'Accept': 'text/html'}, redirect: 'follow'});
    if (!r.ok) return res.status(502).json({error: `The page answered ${r.status}.`});
    const page = extract(await r.text(), r.url || url.href);
    if (page.text.length < 800) return res.status(422).json({error: 'Could not find the article text on that page.'});
    const images = await rehost(page.images);
    let ai = null, aiError = '';
    if (process.env.ANTHROPIC_API_KEY) {
      try { ai = await structure(page.text, images, (page.text.match(/(^|\n)\s*Q\d+\./g) || []).length); }
      catch (e) {
        aiError = e instanceof Anthropic.AuthenticationError ? 'The Anthropic key was rejected.' : e instanceof Anthropic.RateLimitError ? 'Claude is busy, try again in a minute.' : e instanceof Anthropic.APIError ? `Claude error ${e.status}.` : String(e && e.message || e);
      }
    }
    return res.status(200).json({url: url.href, title: page.title, text: page.text, images, ai, aiError, aiAvailable: !!process.env.ANTHROPIC_API_KEY});
  } catch (e) { return res.status(500).json({error: String(e && e.message || e)}); }
}
