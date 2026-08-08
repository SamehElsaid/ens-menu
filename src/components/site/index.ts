/**
 * The public site's design system.
 *
 * Everything a page outside `/dashboard` and `/admin` needs, and nothing that
 * the product shares. Import from here rather than reaching into
 * `components/ui`, which belongs to the dashboard.
 */

export {
  SiteButton,
  SiteButtonLink,
  SiteAnchorButton,
  SiteSpinner,
  siteButtonClasses,
  type SiteButtonVariant,
  type SiteButtonSize,
} from "./Button";

export {
  Container,
  Section,
  SectionHeading,
  Eyebrow,
  Prose,
  Card,
  Badge,
  Reveal,
  RevealGroup,
  type SectionTone,
} from "./primitives";

export { Accordion, type FaqItem } from "./Accordion";
