import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type Level = "display" | "section";

type MarketingHeadingProps = {
  as?: "h1" | "h2" | "h3";
  level?: Level;
  className?: string;
  children: React.ReactNode;
};

const levelClass: Record<Level, string> = {
  display: ds.type.display,
  section: ds.type.sectionTitle,
};

export default function MarketingHeading({
  as: Tag = "h2",
  level = "section",
  className,
  children,
}: MarketingHeadingProps) {
  return <Tag className={cn(levelClass[level], className)}>{children}</Tag>;
}

/** Accent span inside a headline — single soft gradient, use once per title */
export function MarketingAccent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <span className={cn(ds.type.accent, className)}>{children}</span>;
}
