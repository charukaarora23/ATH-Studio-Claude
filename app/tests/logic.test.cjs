const { test } = require('node:test');
const assert = require('node:assert/strict');
const { compose, count, list } = require('../js/logic.js');

const sana = {
  name: 'Sana Iqbal', role: 'textile artist', pronouns: 'she', person: 'third',
  subjects: 'salt, coastlines, my grandmother’s kitchen', materials: 'natural dye, large woven hangings',
  detail: 'She dyes each length by hand and leaves the uneven edges of the dye bath visible.',
  series: 'Salt Rooms', seriesLine: 'hangings dyed in seawater from one stretch of coast',
  background: 'Self-taught, she has developed her process through daily practice.',
};

test('third person with pronouns and correct article', () => {
  const r = compose(sana, 'bio');
  assert.ok(r.text.startsWith('Sana Iqbal is a textile artist.'));
  assert.ok(r.text.includes('Her work returns to salt, coastlines and my grandmother’s kitchen.'));
  assert.ok(r.text.includes('She works with natural dye and large woven hangings.'));
});

test('they/them uses plural verb agreement', () => {
  const r = compose({ ...sana, pronouns: 'they' }, 'bio');
  assert.ok(r.text.includes('They work with'));
  assert.ok(r.text.includes('Their work returns'));
});

test('first person', () => {
  const r = compose({ ...sana, person: 'first', location: 'Leeds' }, 'bio');
  assert.ok(r.text.startsWith('I am a textile artist based in Leeds.'));
  assert.ok(r.text.includes('My work returns'));
  assert.ok(r.text.includes('I work with'));
});

test('name only repeats the name, no pronoun guessed', () => {
  const r = compose({ ...sana, pronouns: 'name' }, 'bio');
  assert.ok(r.text.includes('Sana Iqbal’s work returns'));
  assert.ok(!/\b(She|He|They) work/.test(r.text.replace(sana.detail, '').replace(sana.background, '')));
});

test('no training or exhibitions still gives a useful draft and invents nothing', () => {
  const r = compose({ name: 'Leela', role: 'painter', subjects: 'ordinary rooms', pronouns: 'she' }, 'bio');
  assert.equal(r.text, 'Leela is a painter. Her work returns to ordinary rooms.');
});

test('word limit drops whole optional sentences, lowest priority first', () => {
  const r = compose({ ...sana, limit: 30 }, 'bio');
  assert.ok(r.words <= 30);
  assert.ok(r.text.startsWith('Sana Iqbal is a textile artist.'));
  assert.equal(r.omitted[0], 'background');
  assert.ok(r.text.endsWith('.'));
});

test('impossible limit is flagged and identity is kept', () => {
  const r = compose({ ...sana, limit: 3 }, 'bio');
  assert.equal(r.over, true);
  assert.ok(r.text.includes('Sana Iqbal'));
});

test('statement is about the work, not credentials', () => {
  const r = compose({ ...sana, person: undefined, background: 'Won the Example Award.', motivation: 'I return to salt because it keeps time.' }, 'statement');
  assert.ok(r.text.startsWith('My work explores'));
  assert.ok(!r.text.includes('Example Award'));
  assert.ok(r.text.includes('I return to salt'));
});

test('helpers', () => {
  assert.equal(count(' one  two\nthree '), 3);
  assert.equal(list('a, b, c'), 'a, b and c');
  assert.equal(list('a and b'), 'a and b');
});
