# Template Builder — Full Control Schema

Hybrid model (**option ج**):

1. New templates **start** from Default (OneCard) structure.
2. Admin has **full control**: drag/drop, nest, restyle every node, custom HTML/CSS/JS, theme colors.

## Document

```ts
type TemplateDocument = {
  id, name, slug, version: 1, createdAt, updatedAt
  baseTheme?: "default" | "blank"
  globalStyles: { colors, typography, spacingScale? }
  customCode?: { headHTML, bodyHTML, customCSS, customJS }
  root: BuilderNode
}

type BuilderNode = {
  id, type, name?
  props: Record<string, unknown>
  styles: { desktop, tablet?, mobile? }
  customCode?: { html, css, js }
  children?: BuilderNode[]
}
```

Color tokens in styles: `{{colors.primary}}`

## Node types

**Layout:** `section`, `sheet`, `container`, `row`, `column`, `spacer`  
**Content:** `heading`, `text`, `button`, `image`, `html`, `cta`  
**Menu-bound:** `menu.header` (full header packs), `menu.categories` (14 shapes), `menu.ads` (12 ad shapes), `menu.navbar`, `menu.logo`, `menu.hero`, `menu.items`, `menu.hours`, `menu.social`, `menu.footer`

`menu.items` props: `cardStyle` (`split`|`list`|`compact`), `columns`, `borderRadius`, `imageRatio`, badges/description/price flags.

## Bootstrap

```json
{
  "menu": { "theme": "builder" },
  "templateDocument": { "...TemplateDocument..." }
}
```

## Data layer (ens-menu)

`templateApi` → IndexedDB now; swap for HTTP later. Starter: `createOneCardStarterDocument()`.
