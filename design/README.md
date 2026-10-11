# ATH My Studio · Folder interaction design (v1)

Figma file: https://www.figma.com/design/UijhBNM4c7OZzOH0dWcu1j

This folder is the source of the Figma frames. Each frame is written as HTML/CSS in
`source/`, rendered and checked in Chromium, then rebuilt as native Figma layers
(text, vectors, fills, effects) by `tools/`.

## Frames
01 Studio · 02 Folder open · 03 Page 1 Purpose · 04 Page 2 Practice · 05 Review draft ·
06 File this version · 07 Filed (desktop 1440) · 08–10 Mobile 390 · 11 Foundations ·
12 Folder anatomy and states · 13 Motion and sound. PNG renders are in `renders/`.

## Regenerate
```
cd design/source && node build.cjs                 # writes design.html
NP=$(npm root -g) node ../tools/frames.cjs $PWD/design.html $PWD/../renders
NP=$(npm root -g) node ../tools/serialize.cjs $PWD/design.html ops.json grain.b64 fibre.b64
node ../tools/compact.cjs ops.json chunks 27000    # Figma-sized payloads
```
`tools/decoder.js` + `tools/runtime_body.js` is the Figma plugin runtime that turns a payload into layers.

## Provisional (needs ATH approval)
- Hanken Grotesk stands in for Nord (statements) and Proxima Nova (interface).
- Derived shades: folder highlight/edge tones and back-cover gradients around the guide's Burgundy/Petrol/Sand shades.
- Logo is a text placeholder.
- All names, documents and draft text are sample data for design review.
