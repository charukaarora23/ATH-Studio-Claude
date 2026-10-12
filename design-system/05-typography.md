# Typography

## The five families
| Role | Family | Token | Licence | Fallback |
|---|---|---|---|---|
| Display | **Archivo Black** | `font-display` | OFL, file in `fonts/` | Helvetica Neue Bold, Arial Black |
| Headings | **Helvetica Now Display Bold** | `font-heading` | Commercial (Monotype); install per seat | Helvetica Neue Bold, Inter 700 |
| Editorial | **Instrument Serif** (regular + italic) | `font-serif` | OFL, files in `fonts/` | Times New Roman, Georgia |
| Body | **Proxima Nova** | `font-sans` | Commercial (Adobe Fonts) | Inter |
| UI | **Inter** (variable) | `font-ui` | OFL, files in `fonts/` | system-ui |

## Pairing rules
1. **Max two families per piece**: one loud + one soft.
   - Loud: Archivo Black **or** Helvetica Now Display Bold. Never both.
   - Soft: Instrument Serif **or** Proxima Nova / Inter.
2. **The ATH signature:** Archivo Black uppercase headline + Instrument Serif italic finish, at about 0.9× the headline size, on the next line.
3. Inter is for interfaces, labels and small facts. Proxima Nova is for reading.
4. Instrument Serif italic always for: quotes, artist names, book titles in designed pieces.

## Hierarchy (web px; see Typography tab for every style)
| Style | Font | Size / line | Case | Use |
|---|---|---|---|---|
| `poster-xxl` | Archivo Black | 120 / 108 | UPPER | Posters, 1 to 3 words |
| `poster-xl` | Archivo Black | 88 / 84 | UPPER | Web heroes |
| `poster-lg` | Archivo Black | 64 / 64 | Sentence | Social headlines |
| `h1` to `h5` | Helvetica Now Display Bold | 48 to 18 | Sentence | Web and doc headings |
| `editorial-xl` | Instrument Serif | 64 / 64 | Sentence | Editorial headlines |
| `quote` | Instrument Serif italic | 32 / 40 | Sentence | Testimonials |
| `lead` | Proxima Nova | 20 / 32 | Sentence | Intro paragraph |
| `body` | Proxima Nova | 16 / 26 | Sentence | Default body |
| `caption` | Proxima Nova | 12 / 18 | Sentence | Artwork credits |
| `button` | Inter 600 | 15 / 20 | Sentence | Buttons |
| `label` | Inter 600 | 12 / 16, +0.12em | UPPER | Tags, tape, form labels |
| `overline` | Inter 700 | 11 / 16, +0.16em | UPPER | Eyebrows |

## Sizes by channel
| Channel | Headline | Accent | Body | Small |
|---|---|---|---|---|
| Instagram 1080 × 1350 | Archivo Black 132px | Instrument Serif it. 120px | Inter 32px | Inter 24px |
| Story 1080 × 1920 | Archivo Black 160px | Instrument Serif it. 120px | Inter 36px | Inter 28px |
| Meta ad 1080 × 1080 | Archivo Black 114px | Instrument Serif it. 90px | Inter 36px | n/a |
| Email (600px) | Archivo Black 44px (image) | Instrument Serif it. 38px | 16 / 26 | 12px |
| Web desktop | 72 to 88px | 64px | 16 to 18px | 13px |
| Web mobile | 44 to 52px | 40px | 16px | 13px |
| Book cover 8.5 in | Archivo Black 72 to 96pt | Instrument Serif it. 48pt | Proxima 11pt | Inter 9pt |
| Poster A3 | Archivo Black 180pt | Instrument Serif it. 140pt | Inter 18pt | Inter 14pt |

## Tracking and leading
- Archivo Black: −0.02em at 88px+, −0.01em at 44 to 64px. Leading 0.9 to 1.0.
- Helvetica Now Display Bold: −0.02em at 48px, −0.01em at 28px, 0 below 20px.
- Instrument Serif: −0.02em above 64px, 0 at text sizes. Never letter-space the italic.
- Body: 0 tracking, leading 1.6. Measure 45 to 75 characters (`measure` 68ch).
- Uppercase labels: always +0.12em or more.

## Don't
- Don't set body copy in Archivo Black or Instrument Serif.
- Don't use Archivo Black below 20px.
- Don't fake bold or italic; Archivo Black has one weight.
- Don't add a sixth font. Script and handwriting fonts (Caveat etc.) are not part of ATH.
