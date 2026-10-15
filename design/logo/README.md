# ATH logo files

Built as outlines from the real fonts, so the letters and spacing are identical everywhere:
- "arts" and "hearts": Faculty Glyphic Regular
- "to": Libre Baskerville Italic, at 1.18× the name size, with an equal gap on either side
- "PROJECT": Nord Regular, tracked capitals, centred under the name

| Folder | What it holds |
| --- | --- |
| `svg/` | Vector files. Use these wherever possible. |
| `svg/master/` | **Recommended master:** the name alone, without PROJECT. |
| `svg/descriptor/` | The name with a room underneath: BOOKSHOP, STUDIO, GALLERY, OPEN CALLS, MAGAZINE, PODCAST. Nord has no É, so CAFÉ waits for a font with the accent. |
| `svg/one-colour/` | Ink (#1C1310) and white versions for print, embossing, foil and partner pages. |
| `svg/avatar/` | AtH inside a square that survives a circular crop (Instagram, WhatsApp). |
| `svg-to-108/` | Test: the same master and descriptors with "to" at 1.08× instead of 1.18×. |
| `pdf/` | Vector PDFs for printers (logo 120 mm wide, monogram 40 mm). |
| `favicon/` | favicon.ico (16, 32, 48) and PNGs at 16, 32, 180 (Apple touch), 192 and 512. |
| `png/` | The same files as PNG (2400 px wide logos, 1024 px monograms, 512 px favicons). Transparent where the file name has no ground colour. |

File names: `logo_*` (with PROJECT), `logo-no-project_*` (for small sizes), `logo-stacked_*`, `monogram_*` (AtH), `favicon_*` (the italic t).
Colour pairs: burgundy on cream (primary), peony on burgundy, ballet on chilli, burgundy on peony, plus single colours on transparent.

To rebuild: `python3 build_logo.py <fonts folder> svg`, then `ATH_FONTS=<fonts folder> python3 build_variants.py` with FacultyGlyphic-Regular.ttf, LibreBaskerville-Italic.ttf and Nord-Regular.otf in the fonts folder. The fonts are not stored here; Nord is a licensed font.

## Print colours

CMYK values are starting points from the brand guide; proof them before a print run. Pantone matches still need a press check.

| Colour | HEX | RGB | CMYK |
| --- | --- | --- | --- |
| Burgundy | #6A0620 | 106 6 32 | 0 94 70 58 |
| Chilli | #AA0003 | 170 0 3 | 0 100 98 33 |
| Peony | #FAD2E1 | 250 210 225 | 0 16 10 2 |
| Ballet | #FFD6DE | 255 214 222 | 0 16 13 0 |
| Cream | #F9EEE5 | 249 238 229 | 0 4 8 2 |
| Ink | #1C1310 | 28 19 16 | 0 32 43 89 |
