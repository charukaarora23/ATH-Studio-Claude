# Motion

Motion makes the studio feel alive: paper settles, tape sticks, stickers land. Subtle, never bouncy UI.

## Tokens
| Token | Value | Use |
|---|---|---|
| `duration-instant` | 80ms | Press feedback |
| `duration-fast` | 160ms | Hover colour, small lifts |
| `duration-base` | 240ms | Tabs, menus, polaroid straighten |
| `duration-slow` | 480ms | Entrances |
| `duration-float` | 6000ms | Idle float loop |
| `ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | Default |
| `ease-in-out` | cubic-bezier(0.65, 0, 0.35, 1) | Loops, transitions |
| `ease-spring` | cubic-bezier(0.34, 1.56, 0.64, 1) | Sticker landing only |

## Signature moves
| Move | Spec |
|---|---|
| **Paper settle** (entrance) | Cards and polaroids rise 16px + fade in, `duration-slow` `ease-out`, stagger 60ms |
| **Straighten** (hover) | Polaroid rotates to 0deg, lifts 4px, `shadow-lift`, `duration-base` |
| **Sticker land** | Scale 1.3 → 1, rotate 20deg → 8deg, `ease-spring`, 480ms |
| **Idle float** | ±6px Y, rotate ±4deg, `duration-float`, `ease-in-out`, infinite |
| **Tape band scroll** | Marquee at 40px/s, pauses on hover |
| **Book lift** (hover) | Cover lifts 4px, tilts −1deg |
| **Parallax** (heroes) | Paint field moves at 0.85× scroll; objects at 1.1× |

## Video and Reels
- Cuts on the beat; text appears with a 240ms paper settle.
- End card 2 seconds: logo badge on cream, one line, URL.

## Accessibility
Respect `prefers-reduced-motion`: disable float, parallax and marquee; keep fades only.
