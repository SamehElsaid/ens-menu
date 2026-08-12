# ENSMENU Console — Dashboard & Admin redesign

Scope: everything behind `/dashboard` and `/admin`. The public site and auth are out
of scope (they were redesigned separately; see `DESIGN.md`).

This is an information-architecture change first and a visual change second. The
previous pass rebuilt the token system and restyled components but left the
navigation model, the shell and the page composition exactly as they were. That
model is the actual problem.

---

## 1. Diagnosis

The console has **46 destinations** (22 under `/dashboard`, 24 under `/admin`) and
navigation designed for about eight.

**1. Three sidebars pretending to be one.** `DashboardSidebar` renders three
different nav trees — `navSections` (venue), `accountNavSections` (account),
`adminNavSections` — and swaps between them on `variant`. Crossing from
`/dashboard/orders` to `/dashboard/{menu}/items` replaces the entire rail. The
navigation is not a stable frame the operator reads; it is a page that changes
under them.

**2. The same word means two things.** "Subscription" appears in the venue rail
(`/dashboard/{menu}/subscription`, real page) _and_ the account rail
(`/dashboard/subscription`, a redirect to the first menu). Same label, two URLs,
one of them a lie.

**3. Dead ends in both directions.** From the account rail there is no route into a
venue except returning to `/dashboard` and clicking a card. From the venue rail the
only way out is a footer link that opens the _public_ menu in a new tab.

**4. No scope indicator.** Nothing says whether you are operating on the account or
on one venue, except the rail's contents having quietly changed. An account with
six venues is one wrong click from editing prices on the wrong one.

**5. A header that claims to be a breadcrumb and isn't.** `DashboardHeader`
renders `<nav aria-label="breadcrumb">` containing a venue chip and a page title —
no trail, no parent link — on routes four levels deep such as
`/dashboard/{menu}/settings/design/{tempSlug}`.

**6. 46 destinations and no way to search them.** `HeaderSearch` searches
knowledge-base articles. There is no way to reach a page by name.

**7. The rail cannot be collapsed.** 240px is permanently spent. On a 1280px
laptop the 10-column payments table gets 1040px, and 3 of its columns are hidden.

**8. Tables are read-only lists.** Up to 10 columns, no column control, no sticky
header, no bulk actions. `SelectionBar` was built and exported months ago and is
used by exactly nothing.

**9. Page composition is a convention, not a contract.** Every page re-assembles
`PageHeader` → `StatGrid` → `Toolbar` → `DataTable` → `Pagination` by hand, which
is why `/admin/broadcast` looks like a different product from `/admin/payments`,
and why `/admin` and `/admin/personal` have no breadcrumbs at all.

**10. Unreachable pages.** `/admin/administrators/log` and
`/dashboard/{menu}/settings/design/{tempSlug}` exist but appear in no rail.

---

## 2. The decision: one rail, two zones, one switcher

The rail stops being three rails. It becomes **one stable frame with two zones that
are always both present**:

```
┌─ VENUE ZONE ────────────────────┐   Headed by the scope switcher.
│  ◆ Cairo Downtown        ⌄      │   Filled when a venue is selected;
│  Overview                       │   collapses to a "choose a venue"
│  Analytics                      │   affordance when none is.
│  ── Menu ──                     │
│  Categories · Items · Order     │
│  Tables · Advertisements        │
│  ── Settings ──                 │
│  General · Design · Media …     │
│  ── Activity ──                 │
│  History · Ratings              │
├─ ACCOUNT ZONE ──────────────────┤   Never changes. Cross-venue work and
│  My venues                      │   billing live here permanently, so
│  Orders                    (3)  │   they are one click away from every
│  Delivery orders           (1)  │   page in the console.
│  Staff                          │
│  Subscription                   │
└─────────────────────────────────┘
```

Why this over the alternatives:

- **Scope is visible at all times.** The venue name sits at the top of the rail,
  not inferred from which rows happen to be present.
- **No dead ends.** Account work is reachable from inside a venue; venues are
  reachable from the switcher on every page.
- **"Subscription" resolves to one place.** It is an account-level fact, so it
  lives in the account zone only and the venue duplicate is removed from nav.
- **The frame is stable.** Rows fill in and out; the structure does not move.

**Admin is a separate surface, not a third zone.** The back office is a different
product for a different person. It keeps its own rail contents, reached through the
same scope switcher (`Admin console`) for users who hold admin permissions, and it
uses the identical shell, so nothing has to be learned twice.

### Admin rail: 14 flat rows become 5 named groups

The current admin rail is one undifferentiated list of 14. Grouped by what the
person is doing:

| Group     | Items                                                   |
| --------- | ------------------------------------------------------- |
| Overview  | Dashboard, Analytics                                    |
| Customers | Users, Follow-ups, Broadcast, Domain transfers          |
| Revenue   | Plans, Payments, Vouchers, Promo                        |
| Content   | Knowledge base, SEO metadata, Templates, Advertisements |
| Platform  | Administrators, Activity log, App version               |

`Activity log` is new to the rail — the page existed but was unreachable.

### Rail mechanics

| Concern            | Decision                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Width              | 264px expanded, 60px collapsed (icon rail)                                                                                                       |
| Collapse           | Explicit toggle in the header, persisted to `localStorage`                                                                                       |
| Collapse animation | One CSS variable (`--rail-w`) drives both the rail and the content inset, so the transition touches two elements once on an explicit user action |
| Collapsed labels   | `Tooltip side="end"` — extended from the current top/bottom-only component                                                                       |
| Active state       | Brand-soft fill + 3px inline-start brand bar + `aria-current="page"`. The bar is what survives collapse, where the label is gone                 |
| Keyboard           | Native tab order through links, plus `ArrowUp`/`ArrowDown`/`Home`/`End` roving within the rail, and a skip-to-content link                       |
| Mobile             | Drawer at 264px — matching the desktop rail, fixing today's 240/288 mismatch                                                                     |

---

## 3. Header: a trail, and a way to search the product

The header stops duplicating the page title and starts answering "where am I in the
hierarchy" and "how do I get somewhere else".

```
[⇤] Account › Cairo Downtown › Settings › Design    [ ⌘K Search … ]  🔔 ☾ AR (◕)
```

| Slot     | Content                                                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Leading  | Rail collapse toggle (desktop) / drawer toggle (mobile)                                                                                                 |
| Trail    | Real route-derived breadcrumbs. Every crumb but the last is a link; the last is the current page in semibold. Middle crumbs collapse to `…` under 640px |
| Command  | Command-palette trigger — an input-shaped button with a `⌘K` hint on desktop, an icon under `sm`                                                        |
| Trailing | Notifications, theme, language, account                                                                                                                 |

The page's `<h1>` stays in the content area via `PageHeader`. Removing the header's
copy of the title is what makes room for the trail without growing the bar.

### Command palette (`⌘K` / `Ctrl+K`)

The single largest productivity change in this redesign. Sources, in order:

1. **Recent** — last five destinations, from `localStorage`
2. **Go to** — every nav destination the current user is permitted to see, labelled
   with its scope (`Venue · Items`, `Account · Staff`, `Admin · Payments`)
3. **Switch venue** — every venue, jumping to the equivalent sub-route where one
   exists
4. **Actions** — navigation-only quick actions (new item, new category, invite
   staff, new voucher). Nothing that mutates data without showing its own form

Substring match across label + group + keywords, arrow-key navigation, `Enter` to
run, `Esc` to close, results grouped under headings, and full `role="dialog"` +
`aria-activedescendant` semantics.

---

## 4. Shell

```
┌──────────┬────────────────────────────────────────────┐
│          │  header (sticky top-0, 48px)               │
│   rail   ├────────────────────────────────────────────┤
│  (fixed) │  toolbar (sticky top-12, optional)         │
│          ├────────────────────────────────────────────┤
│          │  page content                              │
└──────────┴────────────────────────────────────────────┘
```

**Document scroll is kept deliberately.** Turning the main column into its own
scroll container is the fashionable move, but it breaks `position: sticky` table
headers, breaks scroll restoration, and behaves badly on iOS. With document scroll,
`sticky top-12` under a 48px header gives sticky table headers for free.

**Content width becomes a property of the page kind** rather than one 1400px value
for everything:

| Kind     | Width                    | Used by                            |
| -------- | ------------------------ | ---------------------------------- |
| `table`  | full bleed, gutters only | payments, users, vouchers, logs    |
| `wide`   | 1600px                   | dashboards, analytics              |
| `detail` | 1200px                   | user detail, domain transfer       |
| `form`   | 880px                    | promo, app version, article editor |

A 10-column ledger and a 6-field form do not want the same measure.

---

## 5. Page layout system

A `PageShell` component turns today's convention into a contract:

```tsx
<PageShell
  kind="table"
  header={<PageHeader title=… breadcrumbs=… actions=… />}
  toolbar={<Toolbar search=… filters=… />}   // sticky under the header
  footer={<Pagination … />}                   // sticky to the viewport bottom
>
  <DataTable … />
</PageShell>
```

Every console page declares its kind, so hierarchy, measure, sticky behaviour and
gutters come from one place — but `kind` lets a form page and a ledger page be
_intentionally_ different rather than both being a generic template.

## 6. Tables

`DataTable` gains the features an admin workflow actually needs, all opt-in so no
existing call site changes behaviour:

| Feature           | Detail                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Sticky header     | On by default, offset by the header height                                        |
| Selection         | `selectable` + header/row checkboxes, wired to the existing unused `SelectionBar` |
| Column visibility | A `Columns` menu built on the existing `Menu` primitive, persisted per `tableId`  |
| Density           | Comfortable / compact toggle, persisted per `tableId`                             |
| Retained          | Client sort, mobile card fallback, skeleton rows, empty state                     |

## 7. Dashboards

Both dashboard roots stop being metric walls and gain an **attention queue** — the
list of things that need a human, which is what an operator actually opens a
dashboard for.

**`/admin`** — today: a tab strip duplicating the sidebar, then three stat grids.
New: four primary KPIs with deltas; then a two-column band of growth chart (2/3)
beside an attention queue (1/3) built from pending domain transfers, failed
payments, follow-ups due and expiring subscriptions. The tab strip is deleted; it
duplicated navigation.

**`/dashboard`** — today: a grid of menu cards. New: an account KPI band, then an
attention band (unseen orders, expiring subscription, venues with no items), then
the venue grid.

## 8. Order of work

1. Design-system additions: rail/header/page-shell tokens, `Tooltip` inline sides
2. `ConsoleSidebar` — two zones, scope switcher, collapse, tooltips, keyboard
3. Shell — `--rail-w`, page-kind widths, skip link
4. Header — breadcrumbs, command trigger
5. `CommandPalette`
6. `PageShell` + breadcrumb helper
7. `DataTable` — sticky, selection, column visibility, density
8. Recompose `/admin` and `/dashboard` roots
9. Roll `PageShell` across the remaining console pages
10. Verify: typecheck, lint, contrast, translation parity, build

## 9. Verification

Two of these are checked in as scripts, because "we measured it once" is not a
guarantee anybody can rely on six months from now.

| Check            | Command                  | Result                                                                                              |
| ---------------- | ------------------------ | --------------------------------------------------------------------------------------------------- |
| Types            | `npx tsc --noEmit`       | clean                                                                                               |
| Production build | `npm run build`          | 40 console routes compile                                                                           |
| Token contrast   | `npm run check:contrast` | 42 pairs, 0 failures, both themes                                                                   |
| Locale parity    | `npm run check:i18n`     | 5067 keys each, 0 mismatched                                                                        |
| Lint             | `npm run lint`           | no new findings; 4 pre-existing `set-state-in-effect` errors on admin fetch-on-mount effects remain |

`scripts/check-contrast.mjs` parses the real `:root` and `.dark` blocks out of
`globals.css` and composites alpha tints onto their ground before measuring, so
dark-mode `--brand-soft` is scored as rendered rather than as authored. Text
pairs are held to 4.5:1 and control boundaries to 3:1.

That 3:1 line is what produced `--line-control`. Field, checkbox, segmented and
secondary-button borders were drawn with `--line-strong` at 1.56:1 — below WCAG
1.4.11 for a border that _is_ the component. Hairline rules between blocks of
text are decoration and keep `--line`.

`.ui-label` also moved into `@layer components`. Unlayered, it outranked every
Tailwind utility whatever the source order, so the `text-fg-subtle` sitting
beside it at 41 call sites was dead and those labels all rendered at
`--fg-muted`. In the components layer the class is the default and a utility
beside it wins, which is what every one of those call sites already assumed.
