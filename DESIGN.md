# ENSMENU — “Prism”

A new design direction, generated with the `ui-ux-pro-max` skill and resolved
against this product. It replaces the previous direction (“Pass” — bone paper,
ink primary action, saffron accent, hairline rules, monospaced ticket labels,
near-square corners) outright.

Skill inputs: `--design-system --variance 6 --motion 5 --density 7`, which
returned **Soft UI Evolution** as the style family (“improved shadows, subtle
depth, WCAG AA+”) and **Cairo** as the type system. The skill’s
default palette was a corporate blue; the brand is fixed at **`#9035E8`**, so
the colour system here is derived from that anchor instead and everything else
in the skill output is resolved against it. Where the skill and the product
disagree, this file wins and says why.

---

## 1. The idea

Light through glass.

The product’s one brand moment is a guest lifting a phone to a code and a menu
appearing. That is a light source and a surface it lands on. So the system has
exactly one light source — **`#9035E8`** — and everything else is the calm,
faintly-tinted glass it passes through.

This gives the palette its single governing rule:

> **Purple is where the light lands.** Primary actions, the selected row, focus,
> links, live metrics, brand moments. Nowhere else.

Everything a purple pixel is spent on is something the user can act on or
something the product wants read first. A screen with purple in twelve places
has no hierarchy left; a screen with purple in two has a spine. The neutrals do
the structural work, and because they carry a trace of the brand hue (chroma
0.006–0.02 at the brand’s own angle) the greys never go cold against the accent
— the whole interface reads as one temperature.

What this direction refuses:

- **Purple everywhere.** Purple headings, purple borders, purple icons, purple
  section backgrounds. The moment purple is decoration it stops being signal.
- **Neon.** `#9035E8` is a saturated hue and it would be very easy to make this
  look like a gaming brand. Large purple fills are the exception; large purple
  *tints* (`brand-50`/`100`, 2–6% overlays) are the rule.
- **Flat.** The previous direction drew every resting surface with a 1px
  hairline and forbade shadow. This one is layered: surfaces have depth, and
  depth is how grouping is communicated before colour is.
- **The mono ticket.** Every eyebrow, label and column header was JetBrains
  Mono, uppercase, tracked. That was the previous direction’s loudest signature
  and it is gone. Mono survives only where digits must align.
- **Square corners.** 2–4px radii read as engineered and severe. Premium
  software in 2026 reads as 10–14px: soft enough to feel considered, tight
  enough not to feel like a toy.

## 2. Two worlds, still

The split from the previous system is kept, because it was right: the product
(`/dashboard`, `/admin`) and the public site are read by different people at
different speeds, and they need separate token layers so a marketing change
cannot move a working screen.

| | Product | Public site |
|---|---|---|
| Ground | Tinted white, white panels | Tinted white with deep-violet inversion bands |
| Density | Dense — 13px body, 32–36px controls | Generous — fluid display scale |
| Purple | Actions, selection, focus, figures | Actions plus one gradient moment per page |
| Structure | Soft elevation + faint rule | Elevation, generous whitespace |
| Tokens | `--fg` / `--surface` / `--line` / `--brand` | `--s-*`, scoped to `.public-world` |

Product tokens live in `src/app/[locale]/globals.css`. Public tokens live in
`src/styles/public.css`, scoped to `.public-world`. Neither reads the other.

## 3. Colour

### The ramp

Derived in OKLCH from `#9035E8` with the hue locked at **301.53°** and chroma
following a bell that peaks at the anchor, so tints stay tinted rather than grey
and shades stay saturated rather than muddy. The brand is not approximated:
**`#9035E8` *is* step 500.**

| Step | Hex | Contrast vs white | Job |
|---|---|---|---|
| 50 | `#F7F3FF` | 1.09 | Selected row, hover tint, section wash |
| 100 | `#EFE6FF` | 1.20 | Badge fill, active nav fill |
| 200 | `#E0CFFF` | 1.44 | Tint borders, chart series 3 |
| 300 | `#CDAEFF` | 1.89 | Dark-mode links, disabled-on-purple |
| 400 | `#B57CFF` | 2.88 | Dark-mode accents, chart series 2 |
| **500** | **`#9035E8`** | **5.44** | **The brand. Primary fill.** |
| 600 | `#7F22D2` | 6.86 | Primary hover, links on white |
| 700 | `#6905B3` | 9.24 | Primary active, text on brand tints |
| 800 | `#540091` | 11.76 | Gradient deep end |
| 900 | `#410073` | 14.26 | Inversion bands |
| 950 | `#270048` | 17.80 | Deepest band, dark hero ground |

White on 500 clears **5.44:1**, so the primary button is the literal brand hex
rather than a darkened stand-in. This is the whole reason the anchor works: most
brand purples have to be pushed two steps darker before they can carry a label,
and the button stops being the brand colour.

### Neutrals

Same 301.53° hue at chroma 0.006–0.016 — perceptually grey, but grey that
belongs to this brand. Placed beside `#9035E8` they read as neutral; placed
beside a true neutral they read as very slightly warm-violet, which is what
stops the interface splitting into “the purple parts” and “the grey parts”.

| Role | Light | Dark |
|---|---|---|
| Page ground | `#F8F7FB` | `#121016` |
| Panel | `#FFFFFF` | `#1C1921` |
| Sunken | `#F3F1F8` | `#26232C` |
| Raised (menus, modals) | `#FFFFFF` | `#221F28` |
| Rule | `#E5E1EB` | `#34303B` |
| Primary text | `#221F27` (16.2:1) | `#F4F2F8` (15.6:1) |
| Muted text | `#64616A` (6.1:1) | `#ACA9B1` (7.5:1) |
| Subtle text | `#6D6A72` (5.3:1) | `#8D8B91` (5.2:1) |

There is no decorative third text step. Subtle is the quietest colour the product
may set, and it clears 4.5:1 on the panel, the page ground *and* the sunken
surface — so a caption stays readable wherever it lands, and hierarchy comes from
size and weight rather than from fading type out.

### Status

Four families, each at the same lightness and chroma discipline as the others,
hue-separated from the brand and from each other:

| Family | Hue | Light solid | Dark solid | Δ from brand |
|---|---|---|---|---|
| Success | 158° | `#008652` | `#40C987` | 144° |
| Warning | 72° | `#996300` | `#E89911` | 133° |
| Danger | 22° | `#C92838` | `#FF807F` | 77° |
| Info | 253° | `#0070CE` | `#6BB0FF` | 49° |

The light and dark solids sit on opposite sides of mid-lightness, so type on a
filled status swatch cannot be a fixed colour. `--fg-on-status` is white in the
light theme and `#121016` in the dark one; every solid pill, badge and the danger
button reads it rather than hard-coding `text-white`.

Info is the tight one — 49° from the brand — so **info never appears as a bare
colour**. It always carries its icon, and it is never used for a fill that could
be mistaken for a selected state. Every status pill carries a dot and a word;
every status row carries an icon. Colour is never the only signal, which is also
what makes the whole set survive greyscale and colour-blind vision.

### Gradients

Three, all derived by swinging hue at constant lightness from the anchor, so a
gradient never changes how bright the surface is — only its temperature. That is
what keeps them from looking like a 2014 header.

```
--grad-brand:  #9035E8 → #7046F9   (purple → violet)     primary CTA, brand fills
--grad-vivid:  #9035E8 → #BB0BB5   (purple → magenta)    hero, featured plan
--grad-deep:   #6905B3 → #270048   (deep violet → near-black) inversion bands
```

Budget: **one gradient moment per page.** Hero, one featured card, or one CTA
band — not all three. Gradients never appear on a control smaller than a button,
never on a data surface, and never behind body text that has to be read.

## 4. Type

| Role | Face | Used for |
|---|---|---|
| UI + display | **Cairo** | Everything in Latin and Arabic |
| Figures | **JetBrains Mono** | Tabular digits only |

Cairo is the product face because it covers Latin and Arabic in one family, so
English and Arabic screens share the same rhythm instead of swapping faces at
the locale boundary. It is humanist enough for long UI copy, and its 600/700
weights hold at display sizes without a second display font.

**Mono is demoted, deliberately.** Under the previous direction every eyebrow,
column header, ID and stat label was uppercase tracked mono, and that single
decision is what made the old screens read as ticket rails. Here mono is used
for one thing: keeping digits in a column from jittering. Labels are now sans,
sentence case, `0.01em`, `--fg-muted` — quieter, faster to read, and they stop
competing with the data they label.

Hierarchy is built from **weight and size**, not from case and tracking:

| Token | Size | Weight | Tracking |
|---|---|---|---|
| Display | `clamp(2.5rem, 1.1rem + 5.6vw, 5rem)` | 700 | −0.035em |
| H1 | `clamp(2rem, 1.35rem + 2.8vw, 3.25rem)` | 700 | −0.03em |
| H2 | `clamp(1.625rem, 1.2rem + 1.9vw, 2.5rem)` | 700 | −0.025em |
| H3 | `clamp(1.1875rem, 1.08rem + 0.5vw, 1.4375rem)` | 650 | −0.015em |
| Body | 1rem (public) / 0.8125rem (product) | 400 | 0 |
| Label | 0.75rem | 550 | 0.01em |

Arabic drops the negative tracking at every step and takes `1.35`–1.45
line-height: Arabic letterforms join, so tightening damages the join, and marks
above the baseline collide at Latin line-heights.

Product body stays **13px**. It is read every day, at arm’s length, by someone
who needs six rows in the space a marketing site gives one.

## 5. Geometry and elevation

**Radii.** `sm` 6px · `md` 8px · `lg` 10px (controls) · `xl` 14px (cards) ·
`2xl` 18px (modals, sheets) · `3xl` 24px (hero panels). Pills survive for badges,
avatars and switch tracks. The public site is one step softer at card scale.

**Elevation is a real ladder again**, and it is what communicates grouping:

| Level | Use | Character |
|---|---|---|
| `xs` | Resting card | 1px tinted rule + a 1px contact shadow |
| `sm` | Toolbar, sticky header | Faint two-stop |
| `md` | Hovered card, popover trigger | Lifts, does not move |
| `lg` | Dropdown, tooltip | Clear separation |
| `xl` | Sheet | |
| `2xl` | Modal | Deep, wide, soft |
| `brand` | Primary button, featured card | A purple-tinted shadow — the light source casting colour, not a grey drop |

Every shadow is composed in the brand hue rather than in black
(`rgb(35 20 60 / α)`), so shadows warm the neutrals instead of dirtying them.
The single most premium detail in the system is `--shadow-brand`: a primary
button that casts a faint purple glow onto the surface below it.

**The lift.** The one signature interaction: an interactive card raises one
elevation step and translates `-2px` on the block axis over 180ms. No scale, no
colour change, no border flash. It appears on marketing and on entity cards; a
dense working list uses a tint change instead, because rows that move under the
pointer are hard to click.

## 6. Grid and rhythm

8px base unit. `--space-1` 4px through `--space-16` 96px.

The public site is a **12-column grid**, but — unlike the previous direction —
the grid is *not* drawn. Hairline column rules read as engineering-drawing, not
as premium software. Structure comes from generous, consistent gutters
(`clamp(1.25rem, 4vw, 2.5rem)`) and a 1240px measure.

Sections alternate three shapes so a long page has cadence: full-bleed band,
asymmetric `7/5` split, and centred `max-w-3xl` statement. Bento spans are
declared (`span 12/8/6/4/3`), collapsing to `span 6` at `md` and `span 12`
below.

## 7. Layout archetypes

Every page is one of five shapes. New pages pick an archetype rather than
inventing a layout.

1. **Gradient hero** (home, app landings) — deep-violet band, oversized display
   line, one gradient moment, product proof bleeding off the grid.
2. **Bento showcase** (features, pricing, about) — 12-column bento, varied
   spans, exactly one cell allowed to carry the gradient.
3. **Reading column** (legal, knowledge base, FAQ) — `68ch` measure with a
   sticky index from `lg`.
4. **Work surface** (dashboard, admin lists) — page header, toolbar, then an
   elevated collection panel. No card wrapping the whole page.
5. **Focused task** (auth, wizards, settings forms) — single column,
   `max-width: 26rem`, on a split panel whose aside carries the gradient.

## 8. Navigation

**Public.** A floating, rounded bar inset from the top of the viewport, resting
on a translucent tinted surface with a saturating backdrop blur. It gains
elevation on scroll rather than changing colour. Four destinations, two of which
open a described mega-panel. The active destination carries a `brand-100` pill,
not an underline. Below `lg` it becomes a full-height sheet from the inline
start with the primary action pinned above the safe area.

**Product.** The 240px rail stays — correct for a tool with 20+ destinations —
but it is restructured:

- **Menu switcher at the head**, redrawn as a rounded control with the venue
  avatar and a disclosure chevron.
- **Sections are sans-labelled and separated by space**, not by rules.
- **The active row is a `brand-50` pill with `brand-700` label, a purple inline
  edge marker and semibold weight** — three signals, so it survives greyscale.
- **Rows are 32px on the rail and 40px in the sheet**, because the sheet is
  touched and the rail is pointed at.
- **A command palette** (`⌘K` / `Ctrl-K`) is the fast path, and the header
  search field is its entry point.

The header carries **breadcrumbs**, not just a title — this product nests three
levels deep (`account → menu → items`) and a single title cannot say where you
are or let you climb out.

## 9. Cards

A card is an elevated surface with an optional header, a body, and an action row
divided from it. Three kinds:

| Kind | Use |
|---|---|
| `Card` | Any grouped panel. 14px, `--shadow-xs`, tinted rule. |
| `StatCard` | One number. Sans label, display-size figure, delta with icon and colour. |
| Entity card (menu, item, table, staff) | Media, body, metadata row, actions behind a divider. Lifts on hover. |

Collections are **elevated tables on desktop and cards on mobile** — never a
horizontally scrolling table. `DataTable` already inverts this way.

## 10. Forms

- Labels are sans, sentence case, above the field, always visible.
- Fields are a 1px rule on `--surface`, 10px radius, 40px tall (36px in dense
  contexts, 44px below `sm`). Focus is a **2px `brand-500` border plus a 3px
  `brand-500/15` halo** — the classic premium-SaaS focus, and the reason the
  previous direction’s inline-start edge marker is gone.
- Errors turn the border `--danger`, sit under the field, name the problem and
  the recovery, and carry `role="alert"`.
- The primary action is `--brand`, full-width below `sm`, and reversed in DOM
  order so the thumb lands on it first.
- One question per row on mobile; paired fields only from `sm`.

## 11. Motion

Skill dial `--motion 5` — standard. Purposeful, transform/opacity only, nothing
that delays a working screen.

| What | Duration | Easing |
|---|---|---|
| Colour / border settle | 150ms | `ease-out` |
| Card lift | 180ms | `cubic-bezier(.2,0,0,1)` |
| Overlay in | 220ms | `cubic-bezier(.16,1,.3,1)` |
| Sheet in | 260ms | `cubic-bezier(.16,1,.3,1)` |
| Scroll reveal | tied to view timeline | linear |

Scroll reveals use native `animation-timeline: view()` behind `@supports` and
`prefers-reduced-motion`, so there is no observer, no main-thread work, and
content is fully visible if the animation never runs. No animation library is
added: GSAP would cost ~50KB to do what four CSS keyframes already do here.
Everything else is behind `motion-safe:`.

## 12. Non-negotiable

**Direction.** Logical properties only — `ps`/`pe`, `ms`/`me`, `start`/`end`,
`text-start`. Never `left`/`right` behind a locale check. Forward chevrons carry
`rtl:rotate-180`.

**Focus.** A 2px `--ring` outline on `:focus-visible`, never removed. On
gradient and inversion bands it flips to white.

**Labels.** Every input has a programmatic label; every icon-only control has a
translated `aria-label`.

**Colour is never the only signal.** Pair it with an icon, a dot, a label or a
weight change.

**Dialogs.** Only `Modal` and `Sheet` may create an overlay — they own focus
trapping, scroll locking, Escape and focus restoration.

**Touch targets ≥ 44px** below `sm`, which is why every control size steps up
one notch on mobile.

**Tabular figures** on every number.

**Contrast.** Body text ≥ 4.5:1 and large text ≥ 3:1 in both themes, verified
against the actual token pairs rather than assumed from the light theme.

## 13. Dark mode

Not an inversion. A separate theme with its own decisions:

- **Deep neutral grounds carrying the brand hue** (`#121016` page, `#1C1921`
  panel) rather than pure black or blue-grey slate. Elevation is expressed by
  surfaces getting *lighter*, which is the opposite of the light theme and the
  reason a straight inversion fails.
- **The primary fill lifts to `#9741F0`** — one lightness step up from the
  anchor. It still reads unmistakably as the brand, but it holds white type at
  4.85:1 and separates from the page ground at 3.9:1, which `#9035E8` does not
  do on a dark ground.
- **Hover and press still deepen** (`#8A2CE6`, `#7C1FD0`), the same direction as
  the light theme. The instinctive dark-mode move is to lighten them, but the
  fill starts with only 0.35 of contrast headroom above white, so lightening
  drops the label under 4.5:1 at exactly the moment the button is being pressed.
  The lift on hover comes from the brand glow instead.
- **Purple text lightens to `#BF92FF`** (7.25:1 on panel). Never `#9035E8`:
  saturated mid purple on a dark ground vibrates.
- **Brand tints become translucency, not paint** — `rgb(144 53 232 / 0.14)` over
  the surface, so a selected row in a raised menu and a selected row on the page
  are both correct without two tokens.
- Shadows deepen and lose their purple cast; on dark grounds the tinted shadow
  is invisible and only the depth matters.

## 14. The four exemptions

Everything else in the app is auditable against §3–§12. These four cases are
not, and each one is a deliberate decision rather than an oversight — so a
`bg-gradient` or a `text-white` found in one of them is correct.

1. **Template previews.** The design picker and the customise panel render a
   picture of the *customer-facing* menu, including that template’s own colours
   and type. Restyling the preview to house tokens would make it a preview of
   the wrong thing. The same applies to the miniature style thumbnails in
   `TemplateBuilder/panels/StylePickers.tsx`, which are diagrams of layout
   options, not chrome.
2. **Scrims over photography.** A caption sitting on an uploaded image needs a
   dark ramp and light type to stay legible over content nobody controls. That
   ramp is contrast machinery, not decoration.
3. **The template builder shell.** The canvas builder is deliberately dark so
   the page being built reads as the bright object on the screen. It is a tool
   inside the tool and keeps its own chrome — but its accent is the brand
   purple’s dark-theme value, not a separate hue.
4. **Third-party brand hues.** WhatsApp green, the social platform marks and the
   payment rail logos identify an external service. They are allowed on the
   glyph only — never on a fill, a border or a status.

Loading shimmers are the one gradient exempt from the per-page budget, because a
sweep has to be a gradient to read as motion. They are driven by the surface
tokens and disabled under `prefers-reduced-motion`.
