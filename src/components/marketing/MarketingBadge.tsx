import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type MarketingBadgeProps = {
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
};

export default function MarketingBadge({
  children,
  dot = true,
  className,
}: MarketingBadgeProps) {
  return (
    <div className={cn(ds.badge, className)}>
      {dot && <span className={ds.badgeDot} aria-hidden />}
      {children}
    </div>
  );
}
