// One read per book with Claude Haiku 5.5: who and what is inside (cover artist, curator, invited voices, interviews, editor's note).
// Runs only when a new or changed PDF is read on Sync, and only if ANTHROPIC_API_KEY is set. Quotes must be word for word from the book.
import Anthropic from '@anthropic-ai/sdk';
const person = {type: 'object', additionalProperties: false, required: ['name', 'handle', 'role', 'title', 'page', 'intro', 'quotes'], properties: {
  name: {type: 'string'}, handle: {type: 'string', description: 'Instagram handle as printed, with @, or empty'},
  role: {type: 'string', enum: ['Cover artist', 'Curator', 'Juror', 'Invited artist', 'Award winner', 'Interview', 'Guest writer']},
  title: {type: 'string', description: 'The headline of their feature as printed, or empty'}, page: {type: 'integer', description: 'The [Page N] where their feature starts'},
  intro: {type: 'string', description: 'One or two sentences from the book introducing them, word for word'},
  quotes: {type: 'array', items: {type: 'string'}, description: 'Up to 3 of their own first-person sentences, word for word, the most striking ones'}}};
const SCHEMA = {type: 'object', additionalProperties: false, required: ['cover', 'theme', 'editor', 'people', 'articles'], properties: {
  cover: {type: 'object', additionalProperties: false, required: ['artist', 'artwork', 'year'], properties: {artist: {type: 'string'}, artwork: {type: 'string'}, year: {type: 'string'}}},
  theme: {type: 'object', additionalProperties: false, required: ['title', 'text'], properties: {title: {type: 'string'}, text: {type: 'string', description: 'The opening lines of the theme text, word for word, up to 300 characters'}}},
  editor: {type: 'object', additionalProperties: false, required: ['by', 'text'], properties: {by: {type: 'string'}, text: {type: 'string', description: 'The editor\'s note opening, word for word, up to 300 characters'}}},
  people: {type: 'array', items: person, description: 'Everyone with their own feature: cover artist, curator or juror, invited artists, award winners, interviews, guest writers. Not the general list of selected artists.'},
  articles: {type: 'array', items: {type: 'object', additionalProperties: false, required: ['title', 'by', 'page'], properties: {title: {type: 'string'}, by: {type: 'string'}, page: {type: 'integer'}}}}}};
const SYSTEM = 'You read the final text of an art book or magazine published by Arts to Hearts Project and list what is inside. Use only what is printed. Copy names, titles and quotes exactly; never invent or reword. If something is not in the text, leave it empty.';
export async function aiInside(pages){
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const text = pages.map((p, i) => `[Page ${i + 1}]\n${p.replace(/\n{2,}/g, '\n')}`).join('\n\n').slice(0, 900000);
  const client = new Anthropic();
  const r = await client.messages.create({model: 'claude-haiku-5-5', max_tokens: 8000, output_config: {effort: 'low', format: {type: 'json_schema', schema: SCHEMA}},
    system: SYSTEM, messages: [{role: 'user', content: `The book:\n\n${text}`}]});
  if (r.stop_reason === 'refusal') return null;
  const j = JSON.parse(r.content.filter(b => b.type === 'text').map(b => b.text).join(''));
  return {cover: j.cover.artist ? {artist: j.cover.artist, title: j.cover.artwork, year: j.cover.year} : null, theme: j.theme.title ? j.theme : null,
    editor: j.editor.text ? {text: j.editor.text, by: j.editor.by} : null, interviews: j.people, articles: j.articles, by: 'ai', usage: r.usage && {in: r.usage.input_tokens, out: r.usage.output_tokens}};
}
