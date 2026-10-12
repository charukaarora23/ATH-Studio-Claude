# Layout and grid

## Spacing scale
4px base: `space-1` 4 · `space-2` 8 · `space-3` 12 · `space-4` 16 · `space-5` 20 · `space-6` 24 · `space-8` 32 · `space-10` 40 · `space-12` 48 · `space-16` 64 · `space-20` 80 · `space-24` 96 · `space-32` 128. Use only these.

## Web grid
| Breakpoint | Columns | Gutter | Margin | Container |
|---|---|---|---|---|
| < `bp-md` 768 | 4 | 16 | 16 (`space-4`) | fluid |
| 768 to 1023 | 8 | 24 | 32 | fluid |
| ≥ `bp-lg` 1024 | 12 | 24 | 48 | `container` 1240px |

Section padding: `space-20` desktop, `space-16` tablet, `space-12` mobile. Heading to content: `space-10`.

## Social grids
| Format | Size | Safe margin | Notes |
|---|---|---|---|
| Feed post | 1080 × 1350 | 64px | Grid crop is 3:4 centre: keep key text in the middle 1012px of height |
| Square / ad | 1080 × 1080 | 64px | Fact bar 120px at the bottom |
| Story / Reel | 1080 × 1920 | 64px sides, 250px top, 340px bottom | Reel cover: title in the centre 1080 × 1350 |
| Carousel | 1080 × 1350 per slide | 64px | Slide 1 = hook, last = CTA |

Build every social layout on a 6-column grid with 24px gutters inside the safe area.

## Print
| Item | Trim | Bleed | Safe |
|---|---|---|---|
| 101 Art Book / Big Book | 8.5 × 8.5 in | 0.125 in | 0.375 in |
| Poster A3 | 297 × 420 mm | 3 mm | 15 mm |
| Certificate A4 landscape | 297 × 210 mm | 3 mm | 10 mm |

## Composition rules
- **Rule of one:** one headline, one focal object, one pop per layout.
- Text blocks align left. Centre only on certificates and quote cards.
- Objects (polaroids, stamps, stickers) overlap edges and each other by a third; they never float alone in empty space.
- Paint fields fill a whole zone edge to edge; never a paint "blob" in the middle of cream.
- Leave at least 30% of every layout as quiet space.
