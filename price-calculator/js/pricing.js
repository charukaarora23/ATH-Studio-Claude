/* Pricing: the ONE place the calculator gets a price from.

   ATHPricing.estimate(inputs) -> Promise<{ price: number, currency: 'USD', source: 'prototype' | 'ath-engine' }>
   `inputs` is PriceLogic.inputsFor(form): { mode, ...only the fields that mode uses }.
   Reject the promise to show "We couldn't calculate this price".

   To connect ATH's real pricing engine, replace the body of estimate() with the API call
   (for example POST /api/artwork-price with `inputs` as JSON) and return source: 'ath-engine'.
   The "Prototype figure" label on the result shows only while source is 'prototype'.

   standIn() below is a PLACEHOLDER from the design prototype. It is not ATH's pricing and must not ship as real. */
(function (root) {
  'use strict';
  const num = (v) => root.PriceLogic.num(v);

  function standIn(f) {
    const mat = num(f.materials) || 0;
    if (f.mode === 'time') return Math.max(1, Math.round(num(f.rate) * num(f.hours) + mat));
    const k = f.unit === 'cm' ? 1 / 2.54 : 1;
    const Lv = num(f.length) * k, Wv = num(f.width) * k, Hv = num(f.height);
    const base = { hobby: 30, amateur: 50, emerging: 120 }[f.experience] || 30;
    const rate = { hobby: 0.5, amateur: 1, emerging: 2 }[f.experience] || 0.5;
    const med = f.mode === 'standard' ? ({ painting: 1, photography: 0.8, drawing: 0.7 }[f.medium] || 1) : 1;
    let size = Lv * Wv; if (Hv > 0) size = size * 1.5;
    return Math.max(1, Math.round(base + size * rate * med + (f.mode === 'size' ? mat : 0)));
  }

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  root.ATHPricing = {
    async estimate(inputs) {
      await wait(1000); // stands in for the network round trip
      if (root.ATH_SIMULATE === 'calc-fail') throw new Error('Simulated pricing failure');
      return { price: standIn(inputs), currency: 'USD', source: 'prototype' };
    },
  };
})(typeof window !== 'undefined' ? window : globalThis);
