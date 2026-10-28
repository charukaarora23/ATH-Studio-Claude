# Artwork Price Calculator

The working web app built from the approved prototype (`Main-v3.dc.html`). It is buildless HTML, CSS and JavaScript, set up the same way as My Studio in `app/`.

To run it, serve this folder (for example `python3 -m http.server`) and open `index.html`. You can also open `build/price-calculator.html`, which is the same app as one file.

Run the tests with `node --test price-calculator/tests/logic.test.cjs`.

## Screens

| Address | Screen |
| --- | --- |
| `#/` | Artist Tools listing with two tool cards |
| `#/calculator` | Overview: the calculator stage, a quick Length/Width/Unit form and the My Calculations slips |
| `#/calculator/price` | Calculate a Price: the calculator, the live paper slip and the form |
| `#/calculator/result` | Result: the price counts up, then Save, Email Result, Calculate Again and Edit Inputs |
| `#/calculator/saved` | My Calculations: Wall view and Index view, or the empty state |
| `#/calculator/saved/<id>` | A saved calculation, read-only: Use as Starting Point, Email Result and Delete |

It also has the email dialog, the unsaved-result dialog, the delete confirmation, toasts and the error states.

## Files

| Path | What it does |
| --- | --- |
| `js/pricing.js` | **The only place a price comes from.** `ATHPricing.estimate(inputs)` returns `{ price, currency, source }`. It runs the prototype's placeholder formula for now. |
| `js/store.js` | Saved calculations, kept per user in `localStorage`. Each record holds `{ id, mode, inputs, price, priceSource, title, createdAt }`. |
| `js/mail.js` | Email Result. There is no mail service yet, so it returns `{ delivered: false }` and nothing is sent. |
| `js/logic.js` | Pure functions: labels, validation, the keypad, the display expression, the preview geometry and the receipt rows. These are tested. |
| `js/app.js` | Views, routing and interactions. |
| `css/calculator.css` | The prototype's CSS, copied unchanged, with a short list of additions at the end. |
| `tools/bundle.cjs` | Builds `build/price-calculator.html`. |

## Connecting the real services

- **Pricing:** replace the body of `estimate()` in `js/pricing.js` with the call to ATH's pricing engine and return `source: 'ath-engine'`. The "Prototype figure" label on the result and saved screens shows only while `source` is `'prototype'`. Remove `standIn()` at the same time. It is a placeholder from the design and must not ship as a real price.
- **Saved calculations:** keep the method shapes in `js/store.js` (`list`, `save`, `remove`) and swap their bodies for API calls. Call `ATHStore.setUser(accountId)` once the ATH session is known.
- **Email:** send the message from the server in `js/mail.js` and return `{ delivered: true }`. The dialog then shows "Sent to ...". Until then it shows the "nothing was delivered" state.

## Testing failure states

- `?simulate=calc-fail`: the pricing call fails, and the form shows "We couldn't calculate this price".
- `?simulate=email-fail`: sending the email fails.
- `?start=workspace`: opens on the Overview.

## Changes from the prototype

- Missing values on the display show an en dash (`$ –`) instead of an em dash, so the copy has no em dashes.
- The My Calculations line now reads "Saved on this device for now", because records last between visits in `localStorage`.
- In the prototype, the mobile Calculate bar could not stick to the screen because `.device` clipped it with `overflow: hidden`. Below 1080px it now uses `overflow: clip`, so the bar stays at the bottom while you scroll.
- Accessibility additions:
  - A skip link.
  - Focus moves to each new screen, and to the first action when a dialog opens.
  - Focus stays inside open dialogs, and Escape closes them.
  - Arrow keys move between options in a group.
  - Enter in a number field works like `=`.
  - Screen readers hear the final price once, not every step of the count-up.
