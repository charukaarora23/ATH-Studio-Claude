# ATH brand guidelines

Two guides, built from the outlined logo files so every logo in them is exact.

| File | For | Live |
| --- | --- | --- |
| `ATH-social-and-graphics.html` | Social media, emails, graphics and how printed pieces look | https://claude.ai/artifact/SLnYv7JsYLbaj83QypCCcf |
| `ATH-ui-and-print.html` | Website and app interface, and print production | https://claude.ai/artifact/MNh2oQbc1fXQk2U1itxg98 |

`img/slides/` holds the Instagram slide system (covers, numbers, pointers, paragraphs, end card), the story, the A3 poster and the A6 postcard, rendered with Inter Tight and Libre Baskerville. The paintings in them are public-domain stand-ins from `src/stock/` (see `SOURCES.md`).

To rebuild:
1. `ATH_FONTS=<fonts folder> NP=<folder holding playwright> python3 src/slides.py` renders `img/slides/` (needs the npm packages @fontsource/inter-tight and @fontsource/libre-baskerville unpacked in the fonts folder as `it/` and `lb/`). `src/posts.py` renders `img/profile-set.png` and needs the licensed Nord files.
2. `python3 src/build.py` writes the two HTML pages from `src/`.
