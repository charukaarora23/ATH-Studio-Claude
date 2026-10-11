# My Studio prototype (v4)

Buildless HTML, CSS and JavaScript. Serve this folder with any static server (for example `python3 -m http.server`) and open `index.html`.

v4 keeps the v2 paper folder experience and builds on it.

## What v4 adds

- **More space.** Wider margins, larger gaps between sections, roomier pages and notes, and one Desk menu in the header for theme, sound and motion.
- **3D paper.**
  - Folders on the shelf lean toward the pointer, and their front cover opens on its hinge when you hover.
  - The draft, the press page and the filed outcome tilt slightly toward the pointer.
  - Filing sends the page into the pocket in 3D.
  - Turning off "Motion and 3D" in the Desk menu stops all of this.
- **Images of the work.**
  - A new Images page, before the outcome, takes up to 8 photos by drag and drop or file picker.
  - Each photo is downscaled on the device and taped to a card with a title, year and medium. Captions are only what the artist writes.
  - The first photo is the lead image. Images are pinned on the inside cover, shown on the "On the wall" section of the home page, and appear on file sleeves.
  - "Try sample images" adds generated placeholders that are labelled Sample.
- **Outcome variations.** The final page offers four lengths: Full, Short, Brief and One line. Each length uses the same facts and drops whole optional sentences. Each length can be edited separately.
- **Outcome layouts.** Each length can be seen as Text, as a Press page (lead image, name, practice, text, captions and an image strip) or as a 1:1 Square post.
- **Filing.** Filing keeps the chosen length, its layout and the images.
- **Colour per section.** Bio is Chilli, Statement is Petrol and My files is Peony. Each colour is carried through the index tab, the folder, the cover, the buttons and the dialog.

## Files

| Path | What it does |
| --- | --- |
| `js/logic.js` | The writing rules: `compose()` and `variants()`. Tested in `tests/`. |
| `js/service.js` | The mock service. Documents and drafts are kept in `localStorage`, and images in IndexedDB. Replace it with real API calls that use the same method shapes. Never put secrets in the frontend. |
| `js/app.js` | Views and interactions. |
| `js/sound.js` | Optional paper sounds. These are placeholders. |
| `tools/bundle.cjs` | Builds a single HTML file for hosted previews. |

Run the tests with `node --test app/tests/logic.test.cjs`.
