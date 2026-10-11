# My Studio prototype (v3)

Buildless HTML, CSS and JavaScript. Serve this folder with any static server, for example `python3 -m http.server`, and open `index.html`.

## Design rules in this version

- **Space.** One focal object per screen (a 3D folder) and one column of questions. Spacing follows an 8px scale, with 64 to 128px between sections.
- **Two typefaces.** Hanken Grotesk for the interface (it stands in for Nord and Proxima Nova until the licensed files arrive). Newsreader only for the artist's own words: answers, drafts and filed text.
- **One colour per section.** The same colour is used for the section's nav dot, its 3D folder, its buttons and its file cards.
  - Bio: Chilli `#AA0003`, with Ballet sheets.
  - Statement: Petrol `#025054`, with Pistachio sheets.
  - My files: Peony pink `#F7C3D6` with Burgundy text, and Lemon sheets.
- **Light and dark.** The choice is in Settings. It starts from the system setting.

## Files

| Path | What it does |
| --- | --- |
| `js/logic.js` | The writing rules: compose, word count, fitting a limit. Tested in `tests/`. |
| `js/service.js` | A mock service that stores data on this device. Replace it with real API calls that use the same method shapes. No secrets belong in the frontend. |
| `js/scene3d.js` | The 3D folders, built with Three.js. They are decorative: every action also exists as a normal button, and the canvas is hidden from screen readers. If WebGL is not available, flat CSS folders are shown instead. |
| `js/app.js` | Views and interactions. |
| `js/sound.js` | Optional paper sounds, synthesised in the browser. They are placeholders. |
| `vendor/three.min.js` | Three.js r149 (MIT licence, see `three-LICENSE`). |
| `tools/bundle.cjs` | Builds one self-contained HTML file for hosted previews. |

## 3D interactions

- **Home:** the folders lean toward the pointer. Hovering over a folder, or focusing its label, lifts it and opens its cover. Clicking opens the cover fully and the camera moves in.
- **Writing view:** drag the folder to turn it. More sheets appear as you answer. When you file, the page flies into the folder, the cover closes and the folder hops.
- **Reduced motion:** turning motion off in Settings, or a reduced-motion setting on the device, stops the idle movement and the camera moves.

Run the tests with `node --test app/tests/logic.test.cjs`.
