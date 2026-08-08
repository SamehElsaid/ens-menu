# EnsMenu Design System

Two worlds, one company.

**Part one — the product** (`/dashboard`, `/admin`): compact, neutral, dense.
It is read every day by the person running the venue.

**Part two — the public site** (everything else): marketing scale, warm ground,
one loud headline per page. It is read once, by someone deciding.

They share a brand and nothing else. Each has its own token layer and its own
component vocabulary, so a change to one cannot move the other. If a screen
needs something these parts do not describe, extend the primitive — do not
style in place.

---

# Part one — the product

The contract for every product surface.

---

## 1. Visual direction

Restrained, modern SaaS. Purple is the brand, but it is spent on decisions —
the primary action, the active nav item, the selected state — not on
decoration. Everything else is surface, hairline and text.

What this rules out:

- Gradient fills on buttons and cards. Emphasis comes from weight, size and
  a solid brand fill.
- Gradient text. Headings carry their own weight.
- Coloured glow shadows (`shadow-[0_10px_30px_-5px_rgba(124,58,237,.3)]`).
  Shadows are neutral, with a real offset and a soft blur.
- Border **and** heavy shadow on the same card. Elevation is declared once.
- Bubble radii. Cards sit at 12–14px; only small controls are pills.

---

## 2. Tokens

Defined in `src/app/[locale]/globals.css`. Semantic tokens flip in `.dark`, so
components should not carry `dark:` variants for colour.

### Surfaces

| Token              | Utility        | Use                                               |
| ------------------ | -------------- | ------------------------------------------------- |
| `--app-bg`         | `bg-app`       | Page background behind all content                |
| `--surface`        | `bg-surface`   | Cards, panels, the sidebar, inputs                |
| `--surface-2`      | `bg-surface-2` | Sunken areas: table headers, hover fills, footers |
| `--surface-3`      | `bg-surface-3` | Pressed fills, switch tracks, skeletons           |
| `--surface-raised` | `bg-raised`    | Modals, dropdowns, popovers                       |
| `--overlay`        | `bg-overlay`   | Modal and sheet backdrops                         |

### Lines and text

| Token           | Utility              | Use                                        |
| --------------- | -------------------- | ------------------------------------------ |
| `--line`        | `border-line`        | Default hairline                           |
| `--line-strong` | `border-line-strong` | Input borders, dividers that need presence |
| `--fg`          | `text-fg`            | Primary text                               |
| `--fg-muted`    | `text-fg-muted`      | Secondary text, labels, descriptions       |
| `--fg-subtle`   | `text-fg-subtle`     | Placeholders, disabled, tertiary metadata  |

### Brand and status

Each family exposes `X`, `X-soft`, `X-fg` and `X-line`: `brand`, `success`,
`warning`, `danger`, `info`. Use `bg-brand text-on-brand` for solid actions and
`bg-*-soft text-*-fg border-*-line` for badges and alerts.

`--primary`, `--accent-purple`, `purple-*` and `violet-*` all resolve to the
same brand ramp, and `gray-*` resolves to `slate-*`. Pre-existing call sites
therefore land on the unified system without being rewritten.

### Radius

`rounded-md` (6px) small controls · `rounded-lg` (8px) buttons and inputs ·
`rounded-xl` (10px) cards and panels · `rounded-2xl` (14px) modals ·
`rounded-full` pills, avatars and badges.

### Elevation

`shadow-xs` resting buttons · `shadow-sm` hover · `shadow-md` raised cards ·
`shadow-lg` dropdowns and sheets · `shadow-2xl` modals.

### Motion

150ms for colour and border settles, 200–280ms for overlays on
`cubic-bezier(0.16, 1, 0.3, 1)`. Every animation is behind `motion-safe:`.

---

## 3. Primitives

Import from `@/components/ui`.

| Need             | Use                                                   | Never                                             |
| ---------------- | ----------------------------------------------------- | ------------------------------------------------- |
| Any action       | `Button`, `ButtonLink`                                | A hand-styled `<button className="bg-primary …">` |
| Labelled input   | `Field` + `Input` / `Textarea` / `Select`             | A bare `<label>` beside a bare `<input>`          |
| Toggle           | `Checkbox`, `Radio`, `Switch`, `ChoiceCard`           | A styled div                                      |
| Panel            | `Card`, `CardHeader`                                  | `bg-white rounded-2xl shadow p-6`                 |
| Status label     | `Badge`, `CountBadge`                                 | An inline pill class string                       |
| Inline message   | `Alert`                                               | A coloured div with a border-left                 |
| Dialog           | `Modal`, `ConfirmDialog`                              | `fixed inset-0 bg-black/50 …`                     |
| Slide-over       | `Sheet`                                               | A hand-built drawer                               |
| Collection       | `DataTable`, or `TableShell`/`Table`/`Th`/`Td`/`Tr`   | A raw table in an `overflow-x-auto` div           |
| Page title       | `PageHeader`, `SectionHeader`                         | `text-3xl font-bold …`                            |
| Metric           | `StatCard`, `StatGrid`                                | A bespoke KPI card                                |
| Nothing to show  | `EmptyState`, `NoResultsState`, `ErrorState`          | A centred paragraph                               |
| Loading          | `Skeleton`, `SkeletonText`, `Spinner`, `LoadingBlock` | `animate-pulse` on ad-hoc divs                    |
| Filters          | `Toolbar`, `SearchInput`, `SegmentedControl`          | Hand-rolled filter chips                          |
| Overflow actions | `Menu`, `MenuItem`                                    | A hover-only dropdown                             |
| Tabs             | `Tabs`                                                | Links styled to look like tabs                    |
| Paging           | `Pagination`                                          | Bespoke prev/next buttons                         |

### Control geometry

Buttons, inputs and selects share `controlHeight`: `xs` 28px, `sm` 32px,
`md` 40px, `lg` 44px. A row of mixed controls therefore always lines up.

---

## 4. Rules that are not negotiable

**Labels.** Every input has a programmatic label. `Field` wires `htmlFor`,
`aria-describedby` and `aria-invalid` from one place — use it. A placeholder is
not a label.

**Focus.** Never remove the focus ring. The base layer gives every interactive
element a 2px `--ring` outline on `:focus-visible`; primitives inherit it via
`focusRing`.

**Dialogs.** Only `Modal` and `Sheet` may create an overlay. They handle focus
trapping, scroll locking, Escape, focus restoration and `aria-modal`. A
hand-rolled `fixed inset-0` gets none of that.

**Direction.** Use logical properties — `ps`/`pe`, `ms`/`me`, `start`/`end`,
`text-start` — never `left`/`right` behind a locale check. Chevrons that imply
forward motion carry `rtl:rotate-180`.

**Icon-only controls.** Always `aria-label`, always translated.

**Colour is never the only signal.** Pair it with an icon, a label or text.

**Errors name the problem and the recovery.** "Couldn't save the item — check
your connection and try again", not "Error".

---

## 5. Responsive behaviour

Breakpoints are Tailwind defaults; the ones that carry layout decisions are
`sm` 640, `md` 768, `lg` 1024.

- **Sidebar** is a fixed 272px rail from `lg`, and a `Sheet` below it.
- **Modals** are centred dialogs from `sm`, and bottom sheets below it.
- **Tables** use `DataTable`, which becomes one labelled card per row below
  `md` instead of scrolling horizontally.
- **Page padding** is 16px, rising to 24px from `sm`.
- **Action rows** stack full-width and reverse below `sm`, so the primary
  action sits closest to the thumb.

---

# Part two — the public site

Home, pricing, about, contact, FAQ, knowledge base, the two app landings, legal
documents, the auth screens and the status screens. The SaaS marketing page
played straight and built to Stripe's finish: one continuous reading column,
one accent, real product surfaces instead of decoration. It refuses the
sales-deck landing page that stacks unrelated claim cards until the scrollbar
looks impressive.

The story it has to tell in one viewport: a venue owner learns that the paper
menu they already own becomes a live QR menu, sees it happen, and creates a
free account.

---

## 6. The boundary

Everything public lives inside `.public-world`, applied by
`src/app/[locale]/(main)/layout.tsx` and by the auth and status shells. That
class scopes a separate token layer in `src/styles/public.css`, and Tailwind
maps those tokens onto a separate utility namespace in `globals.css`:
`bg-site-bg`, `text-site-ink`, `text-site-h1`, `rounded-site-card`,
`shadow-site`. Nothing public reads a `--fg` / `--surface` / `--line` product
token, and nothing in the product reads an `--s-*` token.

Practical consequences:

- Public components live in `src/components/site/**` and are imported by
  nothing under `dashboard/` or `admin/`.
- Where a public surface needed something the product already had, it got a
  variant rather than an edit — `SiteLogo` beside `Global/Logo`, `SiteButton`
  beside `ui/Button`.
- The forms are the exception that proves the rule: the auth screens keep their
  existing `react-hook-form` + `yup` logic and their existing field components
  untouched, and only the shell around them is new. Validation, API calls and
  redirects were not touched.

## 7. Public tokens

Declared on `.public-world`, overridden on `.dark .public-world`.

### Ground and ink

| Token         | Utility            | Use                                     |
| ------------- | ------------------ | --------------------------------------- |
| `--s-bg`      | `bg-site-bg`       | Page ground — warm white, not pure grey |
| `--s-bg-tint` | `bg-site-tint`     | Alternating band, sunken cards          |
| `--s-bg-warm` | `bg-site-warm-bg`  | The food-adjacent band                  |
| `--s-bg-ink`  | `bg-site-ink-bg`   | Deep bands, footer, phone bezels        |
| `--s-ink`     | `text-site-ink`    | Headings and emphasis                   |
| `--s-body`    | `text-site-fg`     | Body copy                               |
| `--s-muted`   | `text-site-muted`  | Metadata, captions                      |
| `--s-line`    | `border-site-line` | Hairline                                |

### Accents

`--s-brand` is the same indigo the product uses, spent at marketing intensity:
one accent for every action, `--s-brand-tint` behind icons and eyebrows.
`--s-warm` is the single hospitality note — highlights, ratings, "coming soon"
— and never a primary action.

Dark bands opt in with `s-on-ink`, which flips the ink tokens for everything
inside them; that is why the footer and the auth aside carry no `dark:`
variants.

### Type

Alexandria display over Readex Pro body. Sizes are fluid `clamp()` steps:
`text-site-display` (hero) · `text-site-h1` · `text-site-h2` (section) ·
`text-site-h3` (card) · `text-site-lead` · `text-site-body` · `text-site-sm` ·
`text-site-xs` (eyebrow).

Arabic is not Latin at a different width. Headings drop the negative tracking,
and `.public-world:dir(rtl)` raises heading line-height to 1.35 — at the Latin
1.08 the second line of a hero lands on the first.

### Radius and elevation

`rounded-site-card` (16px) sections and cards · `rounded-site-control` (10px)
buttons and inputs · `rounded-site-sm` (8px) icon tiles · `rounded-full` pills.
`shadow-site-sm` resting · `shadow-site` raised · `shadow-site-lg` devices and
overlays · `shadow-site-brand` only under a primary action.

## 8. Public components

Import from `@/components/site`.

| Need                              | Use                                                             |
| --------------------------------- | --------------------------------------------------------------- |
| Page chrome                       | `SiteHeader`, `SiteFooter` (from the `(main)` layout)           |
| Vertical rhythm                   | `Section` with a `tone`, `Container` with a `width`             |
| Section intro                     | `SectionHeading` (eyebrow + title + lead), `Eyebrow`            |
| Panel                             | `Card`, optionally `interactive`                                |
| Action                            | `SiteButton`, `SiteButtonLink`, `SiteSpinner`                   |
| Reading column                    | `Prose`                                                         |
| Accordion                         | `Accordion` — `details`/`summary`, so it works before hydration |
| Closing action                    | `CtaBand`                                                       |
| Product shot                      | `PhoneMenu` — the real guest menu, not an illustration          |
| Auth screen                       | `AuthShell` + `AuthAside`                                       |
| Legal document                    | `legal/LegalView`                                               |
| 404, unauthorized, payment result | `StatusScreen`                                                  |

`Section` owns the band colour and the vertical padding, so no page hand-rolls
`py-24`. `Container` owns the gutter and the max width. Between them they are
the reason every public page shares a rhythm without sharing a template.

## 9. Rules specific to the public site

**Nothing invented.** No fabricated customer counts, no stock testimonials, no
logo wall of companies that are not customers. The venue strip on the home page
renders real logos from the API and each tile links to that venue's live menu —
and it removes itself below three venues, because a band captioned "trusted by"
holding one logo argues against itself.

**Show the product, not a metaphor.** The hero, the auth aside and the app
landings show the actual guest menu or actual app footage. The owner app
landing has no device shot at all, because no recording of it exists — a
centred hero is better than a promise the screenshot cannot keep.

**One primary action per page**, and it is always "start free" / register.
Secondary actions are `variant="secondary"`; a third option is a text link.

**Motion is scroll-driven and optional.** `s-reveal` and `s-stagger` use CSS
view timelines behind `@supports` and `prefers-reduced-motion`, so there is no
observer, no layout thrash, and nothing hidden if the animation never runs.

**A guest's phone stays light.** `s-daylight` re-declares the light tokens
inside the phone mock, so it depicts the product rather than the visitor's
theme preference.

**Fixed panels live outside the header.** The header carries a backdrop filter
while the mobile nav is open, which makes it the containing block for anything
`fixed` inside it — the nav panel is a sibling for that reason.

## 10. Public responsive behaviour

- **Header** is transparent over the hero and gains a blurred ground on scroll.
  Desktop dropdowns become `details` sections in a full-height panel below `lg`.
- **Heroes** are two columns from `lg`, one centred column below.
- **The pricing comparison** is a table from `lg` and one labelled row per
  feature below it — never a horizontally scrolling table.
- **Legal documents** keep a sticky index from `lg`; below that the index is a
  plain list above the document.
- **Auth screens** show the reassurance aside from `lg` only; below that the
  form is the whole screen.

## 11. What was removed

The old marketing surface is gone, not disabled: `components/HomePage`,
`components/mobile-app`, `components/owner-app`, `components/marketing`,
`Legal/LegalPageView`, `lib/designSystem.ts`, the `--ds-*` token layer, the
`transform-showcase.css` and `about-page.css` stylesheets, and roughly 4,500
lines of `globals.css` — every rule whose selector named a class that no longer
exists anywhere in `src/` or `messages/`.
