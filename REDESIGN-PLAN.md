# “Prism” — implementation plan

Page-by-page record of what changes, written before the code. The system itself
is in `DESIGN.md`; this file is the execution order and the per-surface brief.

Legend: **shape** = layout/structure changes, **skin** = token-level changes
that follow automatically from the foundation.

---

## Phase 0 — Findings from the scan

**70 routes**, 25 layouts, two component libraries (`src/components/ui/` for the
product, `src/components/site/` for marketing), two token layers (`:root` in
`globals.css`, `.public-world` in `public.css`).

Inconsistencies found, and what this redesign does about each:

| # | Problem | Resolution |
|---|---|---|
| 1 | Settings is five sidebar links with no in-page relationship; a user editing “General” has no idea “Media” and “Delivery” are siblings. | Add a settings tab bar shared by all five sub-pages. |
| 2 | `/dashboard/[menu]` overview shows four stats and an activity feed, but the primary job (publish state, live link, QR) is scattered. | Rebuild as a status hero + stats + split of activity/QR. |
| 3 | Two dialects of neutral (`gray-*` in modals/forms, `slate-*` in pages) already aliased to one ramp, but call sites still read inconsistently. | Aliases retained so nothing breaks; call sites swept to semantic tokens. |
| 4 | The mono uppercase label is applied to eyebrows, column headers, stat captions, IDs and timestamps — five different jobs with one voice. | `.ui-label` becomes sans; a new `.ui-figure` keeps mono for digits only. |
| 5 | Empty states differ per page (some centred `EmptyState`, some bespoke). | All route through the `EmptyState` primitive. |
| 6 | Loading differs per page (spinners, bespoke shimmer, `animate-pulse`). | All route through `Skeleton`/`SkeletonRegion`. |
| 7 | The public site draws visible column rules (`.s-ruled`) on every section — engineering-drawing, not premium. | Removed; rhythm comes from whitespace and band alternation. |
| 8 | Focus is expressed twice (ring **and** a 2px inline-start field edge). | One treatment: 2px brand border + 3px halo. |

---

## Phase 1 — Foundation

**`src/app/[locale]/globals.css`**
- Replace the ink `--brand-*` ramp with the OKLCH purple ramp; `#9035E8` = 500.
- Replace warm bone `--n-*` with brand-hue-tinted neutrals.
- Delete `--saf-*`; add `--grad-brand` / `--grad-vivid` / `--grad-deep`.
- Semantic surfaces, lines, text, status, ring → new values (both themes).
- Radii: `sm` 6 · `md` 8 · `lg` 10 · `xl` 14 · `2xl` 18 · `3xl` 24.
- Shadow ladder recomposed in the brand hue; add `--shadow-brand`.
- Type stack → Cairo + JetBrains Mono
  (figures only). Drop the Space Grotesk import.
- `.ui-label` → sans, sentence case, no tracking. `.ui-figure` keeps mono.
- Delete `.ui-field` (the inline-start edge); focus moves into `Input`/`Field`.
- `.glass-effect`, `.blob`, `.s-aurora` equivalents → soft elevated surfaces.
- Third-party chrome (react-select, datepicker, phone input, toastify) retuned
  to the new radii and focus treatment.

**`src/styles/public.css`**
- `--s-*` ground/ink/brand/action → purple system; `--s-action` becomes the
  brand (not ink), because purple *can* carry white here.
- Radii up; elevation ladder in; `.s-stamp` (hard ink offset) → `.s-lift`.
- `.s-ruled` column rules removed; `.s-aurora` graticule → a soft brand-tinted
  radial field.
- `.s-ticket` → sans label; Arabic exception preserved.
- `.s-field` inline-start edge removed in favour of the shared focus treatment.

---

## Phase 2 — Product primitives (`src/components/ui/`)

| File | shape / skin | Change |
|---|---|---|
| `styles.ts` | shape | Control heights 32/36/40/44, radii, shared focus ring, new `tone` maps. |
| `Button.tsx` | shape | `primary` = brand fill + `--shadow-brand`; new `gradient` variant for hero CTAs; `secondary` = surface + rule; `ghost`, `danger`, `link`. Loading state keeps width. |
| `Card.tsx` | shape | Elevated surface, 14px, optional `interactive` lift, header/body/footer slots with dividers. |
| `Input.tsx` / `Field.tsx` | shape | 40px, 10px radius, 2px brand focus border + halo, leading/trailing slot, error under field. |
| `Select.tsx`, `Checkbox.tsx`, `Switch.tsx` | skin | Same focus treatment, brand checked state. |
| `Badge.tsx` | shape | Tint + dot + label; `solid` reserved for counts. |
| `Table.tsx` | shape | Elevated panel, sans headers, 44px rows, hover tint, selected = `brand-50` with inline edge; keeps the sorting engine added previously. |
| `Modal.tsx` / `Sheet.tsx` | shape | 18px radius, `--shadow-2xl`, tinted scrim at 55%, header/footer dividers. |
| `Menu.tsx`, `Tooltip.tsx` | skin | Raised surface, 10px radius, `--shadow-lg`. |
| `Tabs.tsx` | shape | Underline tabs for page-level, segmented pill for filters. |
| `Toolbar.tsx` | shape | No longer wrapped in a `Card` by call sites; it *is* a surface. |
| `StatCard.tsx` | shape | Sans caption, display figure, delta chip with icon; optional sparkline slot. |
| `PageHeader.tsx` | shape | Breadcrumb row, title, description, action cluster, optional tab bar slot. |
| `EmptyState.tsx` | shape | Brand-tint icon medallion, title, description, primary + secondary action. |
| `Alert.tsx` | skin | Tint + icon + optional action. |
| `Pagination.tsx` | skin | 36px controls, brand current page. |
| `Skeleton.tsx` | skin | Tinted shimmer. |

---

## Phase 3 — Public primitives (`src/components/site/`)

- `primitives.tsx` — `Section` gains `tone="ground" | "panel" | "brand" | "deep"`;
  `Container`, `Grid`, `Col`, `Bento` keep their APIs; `Card` gains `lift`;
  `PageHeader` re-typed; `Eyebrow` becomes a sans brand-tinted pill.
- `Button.tsx` — matches the product’s variant set plus `gradient`.
- `Form.tsx` — same focus treatment as the product.
- `Accordion.tsx` — card rows with a rotating chevron, not numbered ledger rows.
- `AuthShell.tsx` — split shell: form panel on a tinted ground, aside carrying
  the gradient and one proof point.

---

## Phase 4 — Global chrome

| Surface | Change |
|---|---|
| `SiteHeader` | Floating inset rounded bar, translucent + backdrop blur, elevation on scroll. Active link = `brand-100` pill. Mega-panel dropdowns become two-column cards with icon + description. Mobile drawer gets a rounded sheet and pinned CTA. |
| `SiteFooter` | Deep-violet band (`--grad-deep`), four columns, brand wordmark, newsletter/CTA row, legal bar. |
| `DashboardSidebar` | Rounded active pill (`brand-50` + `brand-700` + inline edge), sans section labels, 32px rows, redrawn menu switcher, Pro badges as brand tints. |
| `DashboardHeader` | 56px, breadcrumbs, `⌘K` search affordance, icon buttons at 36px, avatar menu. |
| `Layout` | Content max-width 1400px, `--page-gutter` rhythm, ground `--app-bg`. |
| `UserDropDown` | Raised menu, avatar header block, grouped items, danger sign-out. |
| `ContactFab` | Brand fill + `--shadow-brand`; WhatsApp green retained on the glyph only (§14.4). |

---

## Phase 5 — Marketing pages

| Page | Archetype | Shape changes |
|---|---|---|
| `/` home | Gradient hero | Hero → deep band with gradient headline accent, phone proof, dual CTA, trust row. `LogoStrip` → quieter marquee on ground. `HowItWorks` → 4-step cards with connecting rule. `Features` → bento, one gradient cell. `Showcase` → template gallery with lift. `Plans` → two cards, Pro featured with gradient border. `HomeFaq` → accordion. `CtaBand` → gradient band. |
| `/pricing` | Bento showcase | Billing toggle as segmented control; three plan cards with the featured one raised and gradient-edged; comparison table as an elevated panel with sticky header; FAQ accordion. |
| `/about` | Bento showcase | Narrative sections alternate `7/5`; stats band on brand tint; team/values bento. |
| `/contact` | Focused task | Two-column: form panel + channel cards; map in a rounded elevated frame. |
| `/faq` | Reading column | Sticky category index; accordion cards; support CTA card. |
| `/mobile-app`, `/ens_owner_app_owner` | Gradient hero | Phone frame on gradient band; feature bento; store buttons. |
| `/knowledge-base` + `[slug]` | Reading column | Search + category chips; article cards; article page with sticky TOC and prose scale. |
| `/privacy-policy`, `/terms-and-conditions` | Reading column | Sticky TOC, 68ch measure, prose rhythm. |
| `StatusScreen` (404, 401, payment) | Focused task | Centred card on tinted ground, brand code figure, two actions. |

---

## Phase 6 — Auth

`AuthShell` becomes a split: left/start = form on `--app-bg` with the logo and
toggles; right/end = a gradient aside carrying one proof point and the phone
mock, hidden below `lg`. All five forms (`login`, `register`, `reset-password`,
`verify-email`, `staff-login`) adopt the new field, button and alert treatment.
Social buttons keep official marks (§14.4). Recaptcha modal retuned.

---

## Phase 7 — Dashboard

| Page | Shape changes |
|---|---|
| `/dashboard` | Page header + menu card grid; each menu card gains media, status chip, metric row and a lift. Empty state via primitive. |
| `/dashboard/[menu]` | New: status hero strip (published state, live URL, QR action) → `StatGrid` → `2/3 + 1/3` activity + QR panel. |
| `/dashboard/[menu]/items` | Toolbar as its own surface (not inside a `Card`); card grid with lift; bulk-select affordance; FAB on mobile. |
| `/dashboard/[menu]/categories` | Same pattern as items. |
| `/dashboard/[menu]/table` | QR cards with a preview tile and download/print actions; free-plan gate as an upgrade card, not an empty state. |
| `/dashboard/[menu]/analytics` | Period segmented control, stat grid, chart panels on elevated surfaces, top-items table. Chart series use the brand ramp. |
| `/dashboard/orders`, `/delivery-orders` | Filter toolbar, status-grouped cards, order detail modal with a timeline. |
| `/dashboard/[menu]/settings` + 4 sub-pages | **New shared tab bar**; each page becomes grouped cards with a sticky save bar; danger zone separated. |
| `/dashboard/[menu]/settings/design` | Template gallery with hover lift and a selected state; customise panel as a two-column editor. |
| `/dashboard/[menu]/subscription` | Plan cards with the current plan marked; payment methods as list rows; voucher inline. |
| `/dashboard/[menu]/personal`, `/staff`, `/ratings`, `/history`, `/advertisements`, `/display-order`, `/domain-transfer`, `/import` | Skin + primitive alignment; `PersonalProfile` gets an avatar header block. |

---

## Phase 8 — Admin

All 22 admin pages already share `PageHeader` + `Toolbar` + `DataTable` from the
previous pass, so they follow the primitives. Specific work:

- `/admin` overview — KPI grid + chart panels on the new elevation.
- `/admin/users/[userId]` — sectioned detail page with a sticky summary aside.
- `/admin/template/[id]` — dark builder shell keeps its dark chrome (§14.3);
  its accent moves from saffron to the brand’s dark value `#BF92FF`.

---

## Phase 9 — Sweep and verify

1. Grep for dead vocabulary: `saf-`, `--accent-purple`, `royal-purple`,
   `glow-purple`, `s-stamp`, `s-ruled`, `s-ticket`, `ui-field`, `bg-brand-soft`
   used as “live”, `border-line` used as the only structure.
2. Remove unused tokens and the Space Grotesk dependency.
3. `tsc --noEmit`, `eslint`, translation key parity, production build.
4. Contrast audit against the shipped token pairs in both themes.
5. Check 375 / 768 / 1024 / 1440 and `prefers-reduced-motion`.
