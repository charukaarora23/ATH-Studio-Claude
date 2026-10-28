// Run with: node --test price-calculator/tests/logic.test.cjs
const test = require('node:test');
const assert = require('node:assert');
require('../js/logic.js');
require('../js/pricing.js');
require('../js/store.js');
const P = globalThis.PriceLogic;

const std = (o) => Object.assign(P.defaults('in', 'standard'), o);

test('validation: standard needs size, medium and experience', () => {
  assert.deepStrictEqual(Object.keys(P.errs(std({}))).sort(), ['experience', 'length', 'medium', 'width']);
  assert.deepStrictEqual(P.errs(std({ length: '20', width: '16', medium: 'painting', experience: 'hobby' })), {});
  assert.match(P.errs(std({ length: '0', width: '16' })).length, /above 0/);
  assert.match(P.errs(std({ height: '-1' })).height, /leave it empty/);
});

test('validation: size-based needs materials (0 allowed), time-based needs rate, hours, materials', () => {
  const size = Object.assign(P.defaults('cm', 'size'), { length: '30', width: '40', experience: 'amateur', materials: '0' });
  assert.deepStrictEqual(P.errs(size), {});
  const time = P.defaults('in', 'time');
  assert.deepStrictEqual(Object.keys(P.errs(time)).sort(), ['hours', 'materials', 'rate']);
});

test('keypad edits text like a calculator', () => {
  assert.strictEqual(P.kpApply('', '.'), '0.');
  assert.strictEqual(P.kpApply('0', '5'), '5');
  assert.strictEqual(P.kpApply('1.5', '.'), '1.5');
  assert.strictEqual(P.kpApply('12', 'del'), '1');
  assert.strictEqual(P.kpApply('12', 'clr'), '');
  assert.strictEqual(P.kpApply('12345678', '9'), null);
  assert.deepStrictEqual(P.kpFields('workspace', 'time'), ['length', 'width']);
  assert.deepStrictEqual(P.kpFields('form', 'size'), ['length', 'width', 'height', 'materials']);
});

test('expression and receipt', () => {
  const f = std({ length: '20', width: '16', medium: 'painting', experience: 'emerging' });
  assert.strictEqual(P.tokens(f).map((t) => t.v).join(''), '20 × 16 in · Painting · New Emerging Artist');
  assert.strictEqual(P.what(f), 'Painting, 20 × 16 in');
  assert.strictEqual(P.rows(f).length, 9);
  assert.strictEqual(P.rows(Object.assign(P.defaults('in', 'time'), { rate: '20', hours: '3', materials: '5' })).length, 4);
});

test('inputsFor keeps only the fields of the chosen mode', () => {
  const t = P.inputsFor(Object.assign(P.defaults('in', 'time'), { rate: '20', hours: '3', materials: '5', length: '9' }));
  assert.deepStrictEqual(t, { mode: 'time', rate: '20', hours: '3', materials: '5' });
});

test('no em dashes in user-facing copy', () => {
  const fs = require('fs'), path = require('path');
  for (const f of ['index.html', 'js/app.js', 'js/logic.js']) assert.ok(!fs.readFileSync(path.join(__dirname, '..', f), 'utf8').includes('—'), f);
});

test('pricing goes through ATHPricing.estimate and is marked as prototype', async () => {
  const out = await globalThis.ATHPricing.estimate(P.inputsFor(std({ length: '20', width: '16', medium: 'painting', experience: 'hobby' })));
  assert.strictEqual(out.source, 'prototype');
  assert.ok(out.price > 0);
});

test('store saves per user, newest first', async () => {
  const S = globalThis.ATHStore; // no localStorage in node: falls back to memory
  S.setUser('a');
  await S.save({ mode: 'time', inputs: { mode: 'time', rate: '1', hours: '1', materials: '0' }, price: 1, title: ' One ', createdAt: '2026-01-01T00:00:00Z' });
  const b = await S.save({ mode: 'time', inputs: { mode: 'time', rate: '1', hours: '1', materials: '0' }, price: 2, title: '', createdAt: '2026-02-01T00:00:00Z' });
  const list = await S.list();
  assert.deepStrictEqual(list.map((r) => r.price), [2, 1]);
  assert.strictEqual(list[1].title, 'One');
  await S.remove(b.id);
  assert.strictEqual((await S.list()).length, 1);
});
