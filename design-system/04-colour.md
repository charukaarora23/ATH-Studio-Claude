# Colour

## Architecture
ATH colour has three layers:
1. **Core three:** `burgundy-500` #850020 · `red-500` #FF0000 · `sky-300` #B7D9FF.
2. **Grounds and ink:** `cream-100` #F9EEE5 and the cream scale; `ink-900` #1C1310 and the ink scale.
3. **Supporting:** `peony` #FAD2E1 · `hot-rose` #FFA1C2 · `lemon` #FFF3B2 · `pistachio` #D0D996 · `blood-orange` #DD4E28 · `petrol` #025054.

Product and web use the **semantic** tokens (`surface`, `text`, `accent`, `action`, `success`…) which switch per theme. Marketing and print use the raw scale names.

## Proportions (any layout)
| Share | Colour |
|---|---|
| 60% | Ground: `cream-100` (or a paint field) |
| 25% | Lead core colour: `burgundy-500` or `sky-300` |
| 10% | One supporting colour |
| 5% | The pop: `red-500` (one sticker, one tape, one word) |

## Print values (proof before every print run)
| Token | HEX | RGB | CMYK (approx.) | Pantone (nearest, verify) |
|---|---|---|---|---|
| burgundy-500 | #850020 | 133 0 32 | 0 100 76 48 | 7421 C |
| red-500 | #FF0000 | 255 0 0 | 0 100 100 0 | 485 C / Bright Red C |
| sky-300 | #B7D9FF | 183 217 255 | 28 15 0 0 | 278 C |
| cream-100 | #F9EEE5 | 249 238 229 | 0 4 8 2 | 9224 C |
| ink-900 | #1C1310 | 28 19 16 | 0 32 43 89 | Black 4 C |
| peony | #FAD2E1 | 250 210 225 | 0 16 10 2 | 196 C |
| lemon | #FFF3B2 | 255 243 178 | 0 5 30 0 | 600 C |
| pistachio | #D0D996 | 208 217 150 | 4 0 31 15 | 7485 C |
| blood-orange | #DD4E28 | 221 78 40 | 0 65 82 13 | 7597 C |
| petrol | #025054 | 2 80 84 | 98 5 0 67 | 316 C |

## Approved pairings
| Text / mark | On | Use |
|---|---|---|
| `cream-100` | `burgundy-500` | Hero bands, footer, book covers |
| `burgundy-500` | `sky-300` | Story and post headlines |
| `burgundy-500` | `peony` | Email heroes, tags |
| `ink-900` | `lemon` | Notes, callouts |
| `cream-100` | `petrol` | Collector side, posters |
| `lemon` | `petrol` | Poster accents |
| `peony` | `burgundy-500` | Serif accent lines |
| `red-500` | `cream-100` | 24px+ display words and stickers only |

## Never
- `red-500` small text, or small text on `red-500`.
- `red-500` next to `blood-orange` at equal size.
- `sky-300` or `hot-rose` as text colour.
- Pure black #000000 or pure white #FFFFFF as large fields (use `ink-900`, `cream-50`).
- Gradients between brand colours (the only gradient is the cover scrim).

## Accessibility: measured contrast (WCAG 2.1)
AA = 4.5:1 body text; AA large = 3:1 for text 24px+ or bold 19px+, icons and borders.

### Raw pairs
| Pair | Ratio | Passes |
|---|---|---|
| `ink-900` on `cream-100` | 15.99:1 | AAA |
| `ink-700` on `cream-100` | 8.49:1 | AAA |
| `ink-700` on `cream-200` | 7.66:1 | AAA |
| `burgundy-500` on `cream-100` | 9.11:1 | AAA |
| `cream-100` on `burgundy-500` | 9.11:1 | AAA |
| `red-500` on `cream-100` | 3.5:1 | AA large / UI only |
| `cream-50` on `red-500` | 3.85:1 | AA large / UI only |
| `red-700` on `cream-100` | 6.78:1 | AA |
| `ink-900` on `sky-300` | 12.51:1 | AAA |
| `burgundy-500` on `sky-300` | 7.13:1 | AAA |
| `ink-900` on `peony` | 13.37:1 | AAA |
| `burgundy-500` on `peony` | 7.62:1 | AAA |
| `ink-900` on `lemon` | 16.27:1 | AAA |
| `burgundy-500` on `lemon` | 9.27:1 | AAA |
| `ink-900` on `pistachio` | 12.22:1 | AAA |
| `pistachio-800` on `pistachio` | 5.59:1 | AA |
| `petrol` on `cream-100` | 8.07:1 | AAA |
| `cream-100` on `petrol` | 8.07:1 | AAA |
| `petrol` on `lemon` | 8.22:1 | AAA |
| `blood-orange` on `cream-100` | 3.54:1 | AA large / UI only |
| `ink-900` on `hot-rose` | 9.68:1 | AAA |
| `cream-100` on `sky-900` | 11.71:1 | AAA |
| `sky-300` on `burgundy-500` | 7.13:1 | AAA |
| `peony` on `burgundy-500` | 7.62:1 | AAA |
| `lemon` on `burgundy-500` | 9.27:1 | AAA |
| `ink-500` on `cream-50` | 4.96:1 | AA |
| `ink-500` on `cream-200` | 4.07:1 | AA large / UI only |
| `ink-900` on `blood-orange` | 4.52:1 | AA |
| `cream-100` on `burgundy-800` | 15.09:1 | AAA |

### Semantic pairs, both themes
| Theme | Pair | Ratio | Passes |
|---|---|---|---|
| light | `text` on `surface` | 15.99:1 | AAA |
| light | `text` on `surface-raised` | 17.6:1 | AAA |
| light | `text` on `surface-sunk` | 14.43:1 | AAA |
| light | `text-muted` on `surface` | 8.49:1 | AAA |
| light | `text-muted` on `surface-raised` | 9.35:1 | AAA |
| light | `text-muted` on `surface-sunk` | 7.66:1 | AAA |
| light | `accent` on `surface` | 9.11:1 | AAA |
| light | `accent` on `surface-raised` | 10.03:1 | AAA |
| light | `on-action` on `action` | 10.03:1 | AAA |
| light | `on-action` on `action-hover` | 6.15:1 | AA |
| light | `on-action` on `action-pressed` | 12.07:1 | AAA |
| light | `text-on-inverse` on `surface-inverse` | 9.11:1 | AAA |
| light | `success` on `surface` | 8.07:1 | AAA |
| light | `warning` on `surface` | 5.96:1 | AA |
| light | `danger` on `surface` | 6.78:1 | AA |
| light | `info` on `surface` | 5.73:1 | AA |
| light | `text` on `success-bg` | 12.22:1 | AAA |
| light | `warning` on `warning-bg` | 6.06:1 | AA |
| light | `danger` on `danger-bg` | 6.27:1 | AA |
| light | `info` on `info-bg` | 6.0:1 | AA |
| light | `focus` on `surface` | 9.11:1 | AAA |
| light | `focus` on `surface-raised` | 10.03:1 | AAA |
| light | `on-pop` on `pop` | 3.85:1 | AA large / UI only |
| light | `pop` on `surface` | 3.5:1 | AA large / UI only |
| dark | `text` on `surface` | 17.03:1 | AAA |
| dark | `text` on `surface-raised` | 15.99:1 | AAA |
| dark | `text` on `surface-sunk` | 17.51:1 | AAA |
| dark | `text-muted` on `surface` | 9.93:1 | AAA |
| dark | `text-muted` on `surface-raised` | 9.32:1 | AAA |
| dark | `text-muted` on `surface-sunk` | 10.21:1 | AAA |
| dark | `accent` on `surface` | 5.39:1 | AA |
| dark | `accent` on `surface-raised` | 5.06:1 | AA |
| dark | `on-action` on `action` | 5.39:1 | AA |
| dark | `on-action` on `action-hover` | 7.36:1 | AAA |
| dark | `on-action` on `action-pressed` | 8.95:1 | AAA |
| dark | `text-on-inverse` on `surface-inverse` | 9.11:1 | AAA |
| dark | `success` on `surface` | 10.13:1 | AAA |
| dark | `warning` on `surface` | 12.46:1 | AAA |
| dark | `danger` on `surface` | 8.52:1 | AAA |
| dark | `info` on `surface` | 13.32:1 | AAA |
| dark | `text` on `success-bg` | 11.87:1 | AAA |
| dark | `warning` on `warning-bg` | 8.53:1 | AAA |
| dark | `danger` on `danger-bg` | 7.38:1 | AAA |
| dark | `info` on `info-bg` | 9.16:1 | AAA |
| dark | `focus` on `surface` | 13.32:1 | AAA |
| dark | `focus` on `surface-raised` | 12.51:1 | AAA |
| dark | `on-pop` on `pop` | 5.95:1 | AA |
| dark | `pop` on `surface` | 5.95:1 | AA |

`pop` / `on-pop` sit below 4.5:1 by design: they are used only for display type 20px+ and decoration. The colour-blind rule: status never relies on hue alone. Success is `petrol` (blue-green, off the red-green axis) and every status carries a word and an icon.

## Dark theme ("Night")
For the product and night-mode web only. Ground `ink-950`, raised `ink-900`, text `cream-100`, accent lifts to `burgundy-300`, focus switches to `sky-300`. Marketing and print stay on the light theme.
