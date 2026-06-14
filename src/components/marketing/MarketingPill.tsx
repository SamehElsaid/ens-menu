import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type MarketingPillProps = {
  children: React.ReactNode;
  className?: string;
};

export function MarketingPill({ children, className }: MarketingPillProps) {
  return <span className={cn(ds.pill, className)}>{children}</span>;
}

export function MarketingPillRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(ds.pillRow, className)}>{children}</div>;
}
