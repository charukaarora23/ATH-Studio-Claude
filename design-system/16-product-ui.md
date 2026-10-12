# Product UI (artist dashboard, apply site, shop)

Product screens use the **semantic tokens** and switch with the theme. They are calmer than marketing: brand warmth comes from scallops, folder tabs, polaroids and type, not from paint fields everywhere.

## Foundations
- Ground `surface`, cards `surface-raised` + `border-hairline` + `radius-md` + `shadow-paper`.
- Text `text` / `text-muted`; links and active states `accent`.
- One primary button per screen (`action`). Red (`pop`) never appears in product UI except shop price stickers.
- Focus: `shadow-focus` on every interactive element. Tap targets ≥ 44px (`control-md`).
- Paint fields: only in empty states, success screens and page headers (max 160px tall).

## Key flows
| Flow | Components |
|---|---|
| Browse calls | OpenCallCard grid, Tag, FolderTabs |
| Submit | TextField, upload zone, Choice (pricing), Alert, Button |
| Pay | Choice, Button "Pay $35", Alert (danger on failure) |
| Results | Tag `selected`, Polaroid, Sticker "Top 100", Certificate download |
| Shop | BookTile grid, Sticker (price), Button |

## States
| State | Treatment |
|---|---|
| Empty | `paint-dabs` header + one sentence + one button ("No submissions yet. Pick a call to start.") |
| Loading | Skeleton blocks in `surface-sunk`, no spinners over 1 second |
| Success | Sticker land animation + `success` alert + next step |
| Error | `danger` alert with what happened and how to fix; never lose the artist's uploads |

## Accessibility (WCAG 2.1 AA)
Contrast per the Colour section · visible labels · errors announced (aria-live) · keyboard reachable · reduced motion respected · alt text required on every uploaded artwork (prompt the artist for it).
