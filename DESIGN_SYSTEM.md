# ra.re portfolio design system · v1

This reference describes the homepage, work index, and case studies in `docs/`. Open the [component specimen](docs/design-system.html) through the local preview server to see the live CTA styles, type, colors, and grid.

## Art direction

Use white paper, dark ink, and cobalt. Create hierarchy through scale, grid position, and space. Use lowercase for visible portfolio copy. Keep body copy and captions on opaque reading panels. Keep the animated ribbon and dot field in the homepage hero. Project artwork can use its own palette.

## Typefaces

| Role | First choice | Fallback | Source |
| --- | --- | --- | --- |
| Display headings, reading, project labels, footer | PP Neue Montreal Regular | Switzer, Arial, sans-serif | Local preview file or installed font |
| Navigation, CTA, index headings, tags | PP Neue Montreal Mono Book | UI monospace, monospace | Local preview file or installed font |

The PP preview font files are excluded from Git. Public builds resolve to the fallback on devices without the corresponding installed font. Switzer Regular is bundled as the sans fallback. The mono fallback comes from the operating system. See [font sources](docs/assets/FONT-SOURCE.txt).

## Type scale

The homepage scale uses shared `--type-*` tokens in `docs/variants.css`. The sizes below follow the active CSS. Fluid values are listed as CSS expressions with their line heights.

| Role | Family | Size | Line height |
| --- | --- | --- | --- |
| Case study title | Sans | `clamp(38px, 7vw, 100px)` | 0.99 |
| Wechselspiel process title | Sans | `clamp(32px, 7vw, 96px)` | 1 |
| Case study lead and takeaway | Sans | `clamp(17px, 2vw, 23px)` | 1.45 |
| Case study reading | Sans | 18 px | 1.55 |
| Menu chapter | Sans | `clamp(24px, 6vw, 90px)` | 0.98 |
| Menu chapter number | Mono | `clamp(12px, 2vw, 24px)` | normal |
| Work card title | Sans | `clamp(14px, 1.35vw, 20px)` | 1.2 |
| Homepage intro and work headings | Mono | 13 px | 1.55 |
| CTA and menu trigger | Mono | 13 px | 1.4 |
| Case metadata and captions | Sans | 13 px | 1.4 |
| Work tags | Mono | 11 px | 1.4 |
| Footer | Sans | 13 px, 11 px at widths of 360 px and below | 1.4 |

Display headlines use tight tracking, typically `-.05em`. Case leads stay within 48 characters of line measure and reading paragraphs within 64. Let copy wrap naturally and keep each page's semantic heading order.

## Color and surfaces

| Color | Value | Use |
| --- | --- | --- |
| Paper | `#ffffff` | Page and reading panels, reverse text |
| Ink | `#191919` | Reading and project titles, `--ink` |
| Cobalt | `#1939ff` | CTA, navigation, tags, focus, selected work accents, `--cobalt` |
| Caption ink | `#4e5570` | Case captions |
| Figure mat | `#f3f4f8` | Case study image field |
| Diagram field | `#f3f4fc` | Work index diagrams |
| Deep blue | `#131e6a` | Selected project covers |
| Muted audio | `#c32638` | Sound off icon, paired with a distinct mute glyph |

Keep grid rules faint so the text reads first. The grid blends translucent cobalt and neutral gray. Ribbon colors and individual artwork belong to those assets.

## Grid and spacing

| Surface | Columns and behavior |
| --- | --- |
| Header and outer frame | 1,600 px maximum width. Side padding is `clamp(24px, 6vw, 100px)`, with 24 px at 640 px and below. Header actions sit 12–40 px from the frame edges around the centered menu. |
| Homepage work index | Seven square modules plus two half-module edge tracks. At 1,600 px and up, the index uses 15 modules plus the edge tracks. Cards may extend to either edge. |
| Work index at 720 px and below | One card per row on the underlying seven-column grid. Captions appear below the cover. |
| Case study | Uses the work index modules and half-module edges. The intro spans six columns and the reading and takeaway span four. At 1,600 px and up, those spans double. Full-width figures span all inner columns. |
| Case study at 720 px and below | Intro, reading panels and figures span all seven inner columns. Gallery items stack. |

Use the module for vertical rhythm and align reading fields and artwork to its edges. Home reading panel padding is `clamp(15px, 1.65vw, 30px)`. Case panel padding is `clamp(16px, 2.5vw, 38px)`. Use 8 px between a CTA and its icon, 4 px between work tags, and 12 px from the viewport edge for the fixed scroll control.

## Icons and actions

Use Phosphor Regular for interface icons. The [portfolio SVG sprite](docs/assets/interface-icons.svg) bundles the arrows, close, speaker, speaker slash, and guitar used by the site under the [Phosphor MIT license](docs/assets/Phosphor-MIT.txt). Icons inherit `currentColor`. Use 16 px beside CTA labels and 20–22 px for standalone controls. The custom ra.re menu glyph stays inline so its three strokes can animate independently.

Use `.cta` on a link, button, or menu summary with a visible label. Add `.cta-icon` to the decorative SVG for a 16 px icon. Put the icon first for back, pluck, and the scroll cue. Put it last for say hello and other destination links. Keep native link and button semantics. An icon that repeats the label uses `aria-hidden="true"`; an icon-only control needs an accessible name.

| State | Treatment |
| --- | --- |
| Rest | Cobalt mono, no fill or underline, 44 px minimum target |
| Hover | Underline on hover-capable devices |
| Keyboard focus | 2 px outline with a 3 px offset |
| Menu open | Toggle changes to a close mark. The header contact yields to the open menu. |
| Sound on or off | Icon and pressed state identify the current setting. |

Use `mailto:hello@ra-re.agency` for say hello. Keep icon-only sound and return-to-top controls as utilities. Keep work cards as whole-card links.

## Components and templates

| Pattern | Composition | Source |
| --- | --- | --- |
| Header | Optional back, centered ra.re disclosure, right contact | `docs/variants.css`, `docs/menu-preview.js`, `docs/work/case-study.css` |
| Homepage hero | Ribbon, pluck and sound controls, scroll cue | `docs/variants.css`, `docs/ribbon.js`, `docs/catalog.css` |
| Work card | Linked cover, title, short description and tags. Caption reveals on hover or keyboard focus, with a static treatment on touch. | `docs/content.css`, `docs/catalog.css` |
| Tags | 11 px mono, white fill, 1 px cobalt border, full rounding | `docs/catalog.css` |
| Case study | Intro, figure and caption, reading panel, optional gallery and takeaway | `docs/content.css`, `docs/work/case-study.css` |
| Footer | Copyright, name and agency aligned to grid tracks | `docs/variants.css`, `docs/work/case-study.css` |

For new work cards, choose an intentional cover crop. Keep UI screenshots and lockups contained when their edges carry information. Use descriptive alternative text for informative images, empty alternative text for decorative media, and captions to explain what a figure shows.

## Motion and accessibility

Keep controls and navigation available by keyboard and touch. Use visible focus and keep text labels or accessible names for every action. The homepage ribbon is decorative. Respect reduced-motion preferences for ribbon playback, menu transitions, project captions and the scroll cue. Preserve the still composition when motion is reduced. Keep sound opt-in and pair the color change with a distinct icon. Check new components at 320 px, 390 px, and a desktop width with keyboard focus and reduced motion enabled.
