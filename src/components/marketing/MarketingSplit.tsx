import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type MarketingSplitProps = {
  className?: string;
  children: React.ReactNode;
};

export function MarketingSplit({ className, children }: MarketingSplitProps) {
  return (
    <div className={cn(ds.split.row, className)}>{children}</div>
  );
}

export function MarketingSplitContent({
  className,
  children,
}: MarketingSplitProps) {
  return (
    <div className={cn(ds.split.content, className)}>{children}</div>
  );
}

export function MarketingSplitVisual({
  className,
  children,
}: MarketingSplitProps) {
  return (
    <div className={cn(ds.split.visual, className)}>{children}</div>
  );
}
