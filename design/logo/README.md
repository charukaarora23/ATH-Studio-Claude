# ATH logo files

Built as outlines from the real fonts, so the letters and spacing are identical everywhere:
- "arts" and "hearts": Faculty Glyphic Regular
- "to": Libre Baskerville Italic, at 1.18× the name size, with an equal gap on either side
- "PROJECT": Nord Regular, tracked capitals, centred under the name

| Folder | What it holds |
| --- | --- |
| `svg/` | Vector files. Use these wherever possible. |
| `png/` | The same files as PNG (2400 px wide logos, 1024 px monograms, 512 px favicons). Transparent where the file name has no ground colour. |

File names: `logo_*` (with PROJECT), `logo-no-project_*` (for small sizes), `logo-stacked_*`, `monogram_*` (AtH), `favicon_*` (the italic t).
Colour pairs: burgundy on cream (primary), peony on burgundy, ballet on chilli, burgundy on peony, plus single colours on transparent.

To rebuild: `python3 build_logo.py <fonts folder> svg` with FacultyGlyphic-Regular.ttf, LibreBaskerville-Italic.ttf and Nord-Regular.otf in the fonts folder. The fonts are not stored here; Nord is a licensed font.
