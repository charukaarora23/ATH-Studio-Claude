# Button

Buttons start an action. Verb first, sentence case, 2 to 4 words: "Submit your work", "Get the book", "Pay $35".

## Variants
| Class | Use | Tokens |
|---|---|---|
| `ath-btn--primary` | The one action the view exists for. Max one per view. | `action` fill, `on-action` text, `action-hover`, `action-pressed` |
| `ath-btn--secondary` | Second choice beside a primary. | `accent` text and 2px border (`border-rule`), `burgundy-50` hover |
| `ath-link` | Tertiary and inline actions. Arrow nudges 3px on hover. | `accent`, underline 2px, offset 5px, hover underline `pop` |
| `ath-btn--inverse` | On burgundy or painted fields. | `cream-100` fill, `burgundy-500` text |
| `ath-btn--pop` | Posters, ads, IG covers only. Archivo Black 20px, `control-lg`. Never in product UI. | `pop` fill, `on-pop` text (3.9:1, allowed because text is 20px display) |

## Specs
- Height `control-md` (44px), `control-sm` 36px, `control-lg` 56px. Padding x `space-5`; sm `space-4`; lg `space-8`.
- Radius `radius-md` (12px). **Never pill-shaped**, never square.
- Label: `button` style (Inter 15/20, 600).
- Focus: `shadow-focus` (2px cream gap + 2px burgundy). Pressed: translateY(1px) over `duration-instant`.
- Disabled: `opacity-disabled`, label says why ("Submissions closed"), never just greyed out.

## Do / don't
- Do pair primary + secondary or primary + link. Don't put two primaries side by side.
- Do say the price on payment buttons ("Pay $35"). Don't write "Click here", "Submit", "Learn more".
- Don't use red (`pop`) buttons inside the dashboard or forms: red reads as error there.

Consumer provides: the label, `href` or handler, `disabled` with an honest label.
