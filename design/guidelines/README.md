# ATH brand guidelines

Two guides, built from the outlined logo files so every logo in them is exact.

| File | For | Live |
| --- | --- | --- |
| `ATH-social-and-graphics.html` | Social media, emails, graphics and how printed pieces look | https://claude.ai/artifact/SLnYv7JsYLbaj83QypCCcf |
| `ATH-ui-and-print.html` | Website and app interface, and print production | https://claude.ai/artifact/MNh2oQbc1fXQk2U1itxg98 |

`img/` holds the example posts, story, poster, postcard, profile set and type specimen, rendered with the real fonts (Faculty Glyphic, Nord, Inter).

To rebuild:
1. `ATH_FONTS=<fonts folder> NP=<folder holding playwright> python3 src/posts.py` renders `img/` (needs FacultyGlyphic-Regular.ttf, Nord-Regular.otf, Nord-Medium.otf; Nord is licensed and not stored here).
2. `python3 src/build.py` writes the two HTML pages from `src/`.
