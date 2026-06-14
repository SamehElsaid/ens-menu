import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type SectionVariant = "hero" | "default" | "muted" | "footer";

type MarketingSectionProps = {
  id?: string;
  as?: "section" | "footer";
  variant?: SectionVariant;
  className?: string;
  children: React.ReactNode;
};

const variantClass: Record<SectionVariant, string> = {
  hero: ds.section.hero,
  default: ds.section.default,
  muted: ds.section.muted,
  footer: ds.section.footer,
};

export default function MarketingSection({
  id,
  as: Tag = "section",
  variant = "default",
  className,
  children,
}: MarketingSectionProps) {
  return (
    <Tag
      id={id}
      className={cn(ds.section.base, variantClass[variant], className)}
    >
      {children}
    </Tag>
  );
}
