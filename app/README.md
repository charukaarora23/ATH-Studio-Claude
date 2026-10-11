# My Studio prototype (v5)

Buildless HTML, CSS and JavaScript. Serve this folder with any static server (for example `python3 -m http.server`) and open `index.html`.

## How it works

- **Home:** three paper folders: Bio (Chilli), Statement (Petrol) and My files (Peony).
  - They lean toward the pointer, and the front cover opens on hover.
  - Below them are "On the wall" (the artist's images) and "Recently filed".
- **Writing:** one question per screen, following the founder's earlier ATH Bio Poster.
  - Each screen has a big poster word, a ribbon line and a calm question panel.
  - A tilted paper sheet shows the text building up, and the newest sentence is set in italic.
  - Screens alternate between the section's light and dark colours.
  - The panel fits without scrolling at 1440×900 and at 1280×720.
  - Bio has 9 questions; Statement has 7. The last question in each is "Show the work", where the artist adds up to 8 images with their own captions.
- **Final page:** a spacious poster.
  - It shows the name set large, the practice and place, and the lead image or an "Add your work" drop target.
  - The text can be edited in place.
  - Controls: Copy, Length (Full, Short, Brief, One line) and Voice (She, He, They, I).
  - Links: File this version, Square post, Download .txt and Edit answers.
  - Each length can be edited separately.
- **Filing:** a paper copy of the text flies into the section's tab, and the message that appears has Undo. My files lists every version, with its lead image.
- **Settings:** the Desk menu has Paper and Ink themes, Motion and 3D, and Sounds.

## Rules kept

- The writer only uses what the artist typed.
- Fictional examples are marked "e.g.", and sample images are labelled Sample.
- Image titles start from the file names, and the artist is asked to check them.
- Generation is a template writer, labelled Demo writer. Production generation must run on the server; never put secrets in the frontend.

## Files

| Path | What it does |
| --- | --- |
| `js/logic.js` | The writing rules: `compose()` (sentence parts, word limits) and `variants()`. Tested in `tests/`. |
| `js/service.js` | The mock service. Documents and drafts are kept in `localStorage`, and images in IndexedDB. Replace it with real API calls that use the same method shapes. |
| `js/app.js` | Views and interactions. |
| `js/sound.js` | Optional paper sounds. These are placeholders. |
| `tools/bundle.cjs` | Builds a single HTML file for hosted previews. |

Run the tests with `node --test app/tests/logic.test.cjs`.

## Not built yet

- Saving the poster or the square post as an image.
- Tone options (Warm, Formal, Bold): these need server-side generation.
