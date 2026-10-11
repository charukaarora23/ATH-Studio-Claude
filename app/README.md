# My Studio prototype (v8)

Buildless HTML, CSS and JavaScript. Serve this folder with any static server (for example `python3 -m http.server`) and open `index.html`.

## How it works

- **Home:** three paper folders: Bio (Burgundy), Statement (Chilli) and My files (Peony).
  - They lean toward the pointer, and the front cover opens on hover.
  - Below them are "On the wall" (the artist's images) and "Recently filed".
- **Writing:** our open folder, one question per page.
  - The coloured inside cover holds a clipped paper sheet where the bio or statement is written as you answer. The sentence you are working on is shown in italic and highlighted.
  - The right-hand page asks one question, with one answer field, optional chips and "How to answer?", and Back and Next.
  - Five chapter tabs on the folder edge show progress.
  - Pages turn in 3D, and the folder opens from the home shelf.
  - The folder fits the screen without scrolling at 1440×900 and at 1280×720.
- **Finished bio:** a paper record sheet.
  - A section-colour header and clip, the lead image (or an "Add an image" target), the name, practice and place, and editable text.
  - Record cells show the length, words, voice and images.
  - Below the sheet: Copy, Length (Full, Short, Brief, One line), Voice (She, He, They, I), File this version, Square post and Download .txt.
  - Filing stamps the sheet and flies a copy into the section's tab.
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

## v8: motion and delight

- **Torchlight:** a soft pink glow follows the pointer and drifts on its own when the pointer is still.
- **Cursor:** a ring that grows over controls and shows a label over folders and tabs (mouse only).
- **Parallax:** light parallax on the home page, the folder and the finished page.
- **Writing:**
  - The header shrinks while writing so the folder has more room.
  - Binder rings sit on the spine.
  - Questions are smaller, with a lined writing area.
  - The "Tip" sticker opens a note.
  - The folded corner turns the page in 3D.
  - Stickers ("Hi, Maya!", Halfway, Lovely work, Nearly there) are earned along the way, and the work prints are pinned beside the bio.
- **Finished page:**
  - Opens with "Your bio is ready, Maya." and a chime.
  - Confetti, and a Done! sticker.
  - "What next?" offers three paths: file it, write the other document, or make a square post.
- **Sounds:** flip, pop, peel, stick, stamp, a soft scratch while typing, and a chime. Turning off Motion stops all movement; sounds stay off until the artist turns them on.
