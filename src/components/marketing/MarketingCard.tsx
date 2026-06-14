import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type MarketingCardProps = {
  elevated?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function MarketingCard({
  elevated = false,
  className,
  children,
}: MarketingCardProps) {
  return (
    <div
      className={cn(
        ds.card.base,
        elevated ? ds.card.elevated : ds.card.shadow,
        ds.card.padding,
        className,
      )}
    >
      {children}
    </div>
  );
}
