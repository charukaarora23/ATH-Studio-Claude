# Design notes · folder interaction v1

Figma: https://www.figma.com/design/UijhBNM4c7OZzOH0dWcu1j
Prototype: Present mode from "01 Studio · Desktop" (flow "Bio: closed folder to filed").

## Why the previous build felt unconvincing
- Folders were rounded cards with a separate rectangle sitting on top as a "tab". No back cover, no thickness, no thumb cut, so nothing read as a folder.
- Papers were thin white lines and did not relate to saved content.
- Dashed inner borders read as form fields, not stitching.
- Four canvas options sat in the main UI, competing with the work.
- Motion was layered on per element rather than following how a folder physically opens.

## What changed
- **Construction.** Back cover and tab are one SVG outline with S-curve shoulders. Front cover is shorter, has a thumb cut, a rim highlight on the fold edge, a 3px darker edge strip for board thickness and one soft contact shadow.
- **Content-driven papers.** One sheet per filed version (max four, newest shown), each with a small version tab. Count and "last filed" come from data. Empty folders show one blank page.
- **Open folder = spread.** Inside of the front cover on the left (notes card or filed slips in a folded pocket), spine with two creases, back cover on the right with chapter tabs cut from the same outline. The active page sits on a small stack.
- **Writing pages.** Newsreader Light question, Hanken interface labels, ruled inputs, Hot Rose 3px focus ring. Fictional examples sit in a Lemon note labelled "Fictional example · not added to your notes".
- **Review.** Draft is directly editable; facts used are listed with their source; word count against the limit; "Your edits are never replaced" (new drafts open beside).
- **Filing.** Paper slip names the version; filed state adds a slip to the pocket, a Petrol date mark ("Saved on this device", not a quality seal) and a toast with Undo.
- **Mobile.** Folders stack like a drawer. Pages use a tab band where the active tab is the page's own tab; actions sit in a bottom bar.

## Brand mapping (verified against ATH v24)
Burgundy/Peony bio, Petrol/Pistachio statement (Petrol pairs with Pistachio type in the guide), Blush Sand/Burgundy for My files. Paper #FBF6EF for every sheet, Cream desk by default. Radii 4/12/20/pill, Hot Rose focus ring, 240ms interface motion.

## Provisional, needs a decision
1. Nord (statements) and Proxima Nova (interface) are licensed; Hanken Grotesk stands in for both.
2. Derived shades not in the guide: front-cover highlight (#7B1430, #0B5F62, #F0E0D7), edge strips, back-cover gradients.
3. Logo placeholder.
4. Blush Dusk canvas: the guide reserves gradients for headlines; here it is only a desk with no text on it. Confirm or drop.
5. Sound assets: spec only (opt-in paper slide + tap); no recorded audio chosen.

## Not yet designed
Statement flow pages, My files search/list, failed save, over-limit, quota, empty studio, Settings (sound volume/test, motion, canvas), first-person variant.
