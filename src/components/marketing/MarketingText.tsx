import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type Variant = "subtitle" | "body" | "caption" | "label";

type MarketingTextProps = {
  as?: "p" | "span" | "div";
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
};

const variantClass: Record<Variant, string> = {
  subtitle: ds.type.subtitle,
  body: ds.type.body,
  caption: ds.type.caption,
  label: ds.type.label,
};

export default function MarketingText({
  as: Tag = "p",
  variant = "body",
  className,
  children,
}: MarketingTextProps) {
  return <Tag className={cn(variantClass[variant], className)}>{children}</Tag>;
}
