# Arts to Hearts: product and design

This repository holds all the work so far for Arts to Hearts (ATH) products. That covers the code, the design files, the design system and the references.

ATH is being designed as a house for art, with a gallery, an artist's studio, a bookshop, a café, a reading room and open calls. Each product is one room. Every room shares the same menu, side drawers and footer.

## Start here

1. **The design system** in [`design-system/`](design-system/). This holds the colours, type, layout, motion, print and books, brand architecture and product UI. It also has the NavBar, Button and Footer components, and the tokens in `design-system.json`. Open `ATH-brand-guide.html` in a browser for the full brand guide.
2. **The Bookshop brief and prototype** in [`design/bookshop.html`](design/bookshop.html). This is the newest direction. It covers the creative brief, the floating menu, the side drawers, the book-stack footer, the shelves, the flip-through book and the artist voice note.
3. **The Editions Foundations** in [`design/editions-foundations.html`](design/editions-foundations.html). These are the product and design rules for the books pages. The page also audits the old screens and lists six open decisions.
4. **My Studio**, the artist bio and statement writer. The source is in [`app/`](app/), and [`build/my-studio.html`](build/my-studio.html) is the same app as a single file.

To view an HTML file, download it and open it in a browser. GitHub only shows the code.

## Folders

| Folder | What it holds |
| --- | --- |
| [`design-system/`](design-system/) | The master ATH design system and the brand guide. |
| [`design/`](design/) | Bookshop and Editions pages. Also the Figma build scripts (`source/`, `tools/`), the exported My Studio frames (`renders/`) and the design notes. |
| [`app/`](app/) | My Studio source code. Serve the folder (for example `python3 -m http.server`) and open `index.html`. Run the tests with `node --test app/tests/logic.test.cjs`. |
| [`build/`](build/) | My Studio as one file that opens in any browser. |
| [`reference/docs/`](reference/docs/) | My Studio PRD, screen map and creative direction brief. |
| [`reference/images/`](reference/images/) | References from the founder, in three folders: `my-studio-references`, `editions-current-screens` (the old books pages) and `bookshop-references`. |
| [`reference/moodboard/`](reference/moodboard/) | The original My Studio moodboard. |

## Live links

These pages are private. To give someone access, the owner shares each page from its Share menu.

- ATH Bookshop brief and prototype: https://claude.ai/artifact/PVTjSZYBNs5Xc5x8kiSfqK
- Editions Foundations: https://claude.ai/artifact/TXEnfjvsARQzTfdJfagjgf
- ATH design system: https://claude.ai/artifact/VsF2w9855usFt9u5NYT445
- My Studio prototype: https://claude.ai/artifact/NAzzJwUNz5Mry48gDnAUki
- Figma (My Studio folder design): https://www.figma.com/design/UijhBNM4c7OZzOH0dWcu1j

## Design rules in short

- One message per screen. Lots of breathing space.
- Paper is the base colour. Pinks are the secondary colours, burgundy carries weight, and chilli red is the only accent. The split is 60 / 25 / 10 / 5.
- Instrument Serif for headings and Inter for everything else. Italic is the only emphasis.
- 12px corners and never pill buttons.
- Motion should feel physical: lift, settle and turn. Sound stays off until the visitor turns it on.
- Use real images and real words. Never use lorem ipsum.

## Not in the repository

- Licensed fonts (Proxima Nova, Helvetica Now and Nord) are not included. The prototypes use free fonts in their place.
- Four Bookshop references (Switch-Lit, runcycle, Field Architecture and Object & Archive) still need adding to `reference/images/bookshop-references/`.
