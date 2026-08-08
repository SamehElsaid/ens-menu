# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: the venue owner or manager**, working inside the dashboard. They run a
restaurant, café, hotel outlet, bakery or lounge — usually in Egypt and the
wider MENA region — and they touch the product between service periods: on a
phone at the pass, on a laptop in a back office, often with a service in
progress around them. Their job is keeping a live menu and live orders correct:
change a price, hide a sold-out item, add today's special, check what tables
have ordered, print or re-print a QR.

Other confirmed audiences, secondary to the owner for this redesign:

- **Floor staff** with scoped permissions (`orders:view`, `menu:items`,
  `staff:manage`, …) who mostly live in the orders screens.
- **Guests** scanning a table QR. Their menu is rendered by a separate
  View-app on `{slug}.ensmenu.com`, not by this repository.
- **ENS internal admins** managing users, plans, payments, follow-ups,
  knowledge base, metadata and design templates.

## Product Purpose

ENSMENU turns a hospitality venue's menu into a live digital surface: a QR menu
guests open on their phone, table and delivery ordering on top of it, and a
dashboard where the venue keeps all of it current. Success is a venue whose
published menu matches reality at every moment, and whose orders arrive without
a paper step.

## Positioning

The menu does not have to be typed in. ENSMENU ingests an existing paper menu,
photo or PDF through AI import, reconstructs categories, items, prices and
descriptions, and lets the owner review and publish — the venue goes from paper
to a live QR ordering surface in one session rather than an afternoon of data
entry. Around that, plan-gated capability (table ordering, delivery, staff
roles, per-table QR, analytics depth) grows with the venue.

## Operating Context

- **Two scopes.** Some work is account-level and spans every menu (orders,
  delivery orders, staff, subscription); most work is scoped to one menu under
  a `[menu]` route segment that accepts a slug or a numeric id.
- **A venue may run several menus** (branches, outlets, seasonal), grouped in
  menu groups, with plan limits on how many are active.
- **Publishing is external.** The dashboard writes `menu.theme` and a
  customization record; the guest experience is rendered by a separate View-app
  on `{slug}.ensmenu.com` with `?table=` and `?src=qr` parameters. Theme ids,
  the customization field names, the `TemplateDocument` schema (version 1) and
  the public URL helpers are integration contracts.
- **Bilingual, RTL-first.** Arabic is the default locale with no URL prefix;
  English is served under `/en`. `dir` is set on `<html>` and the interface must
  be built with logical properties.
- **Plan gating is a visible part of the interface.** Free and Pro accounts see
  the same navigation; Pro-only destinations are locked, not hidden.
- **Devices.** Phone during service, laptop for setup and settings; both are
  primary, neither is a fallback.

## Capabilities and Constraints

Confirmed functionality that the interface must keep reachable:

- Account: menu list, menu groups, create/copy/delete menu, subscription and
  plan purchase (Paymob callback route), custom domain transfer, personal
  profile, staff members and roles.
- Per menu: overview, analytics, AI menu import wizard, categories, items,
  display order (drag and drop), tables and per-table QR, advertisements,
  general/design/media/delivery settings, activity history, ratings.
- Orders: table orders and delivery orders at account scope, with filters,
  detail view and status transitions; pending counts surface as nav badges.
- Admin: users and user detail, broadcast email, follow-ups, domain transfers,
  plans, payments, advertisements, administrators and their log, app version,
  promo, vouchers, knowledge base, metadata, template builder.
- Public: home, about, pricing, contact, FAQ, knowledge base, legal pages, two
  mobile-app landing pages, auth (login, register, reset, verify, staff login).

Technical constraints:

- Next.js 16 App Router, React 19, Tailwind CSS v4 (no `tailwind.config`; theme
  lives in CSS), `next-intl`, Redux Toolkit (`auth`, `menuData`), Zustand for
  the template builder only, axios wrapper with encrypted token and API-key
  signing, Firebase Cloud Messaging for push, `react-hook-form` + `yup`.
- Data fetching is `useEffect` + local state or bespoke hooks; there is no
  server-state library. A UI rewrite must not change fetch semantics.
- Staff RBAC (`useAuthorization`) and admin permissions (`useAdminPermissions`)
  filter navigation and page actions.
- No route-level `loading.tsx` / `error.tsx` exists today under dashboard or
  admin; states are handled inside client components.

Explicitly undecided: whether the account-level `/dashboard/advertisements`
route and the unused marketing sections are kept or removed as product
surfaces.

## Brand Commitments

- The name **ENSMENU** (styled ENSmenu in prose) and the existing logo assets:
  the QR-glyph mark and the wordmark.
- **The interface follows the modern SaaS application convention, deliberately.**
  Asked to choose a visual world, the owner chose the category standard over
  every alternative. Future work executes that convention at full fidelity —
  sidebar, header, cards, tables, toolbars — and earns its quality through
  craft, not through inventing a house style on top. The reference bar is
  **Linear**: dense, fast, keyboard-reachable, precise in its details.
- **Density is compact.** The product is read by someone who uses it every day,
  not by a first-time visitor; information per screen is favoured over air.
- Nothing else is binding. Colour, typography, spacing and component vocabulary
  are open, as long as they serve the convention above.
- Arabic/English with correct RTL is a product requirement rather than a brand
  commitment, and it stays.

## Evidence on Hand

- Real customer logos rendered in the trusted-by strip, fetched from the API.
- Real plan and pricing data from the plans API; pricing comparison rows in
  `src/lib/pricingComparison.ts`.
- Real legal copy for privacy and terms in `messages/{ar,en}.json`.
- Product imagery under `public/images/`.
- No confirmed testimonials, case studies, customer counts, uptime figures or
  benchmark numbers exist. Future work must not invent them.

## Product Principles

1. **The live menu is the product.** Every screen should make it obvious what
   guests currently see and how to change it.
2. **Service-time speed beats completeness.** The actions an owner performs
   during a service — hide an item, change a price, advance an order — must be
   reachable in one gesture from where they already are.
3. **One menu at a time, switchable anywhere.** Menu context is the spine of
   the dashboard; changing it should never require walking back to a list.
4. **Locked is not hidden.** Plan-gated capability stays visible and explains
   what it unlocks, at the destination rather than behind an interruption.
5. **Arabic is the first draft, not the translation.** Layout, typography and
   density are judged in Arabic before English.

## Accessibility & Inclusion

Bilingual AR/EN with full RTL support is required. Interfaces must keep
programmatic labels on every control, a visible focus ring, keyboard reach for
every action, and never rely on colour alone to carry status.
