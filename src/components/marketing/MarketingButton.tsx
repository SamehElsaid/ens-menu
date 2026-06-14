import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { ds } from "@/lib/designSystem";

type ButtonVariant = "primary" | "secondary" | "compact" | "ghost";

type MarketingButtonLinkProps = {
  href: string;
  variant?: ButtonVariant;
  className?: string;
  prefetch?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  children: React.ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: ds.btn.primary,
  secondary: ds.btn.secondary,
  compact: ds.btn.compact,
  ghost: ds.btn.ghost,
};

export function MarketingButtonLink({
  href,
  variant = "primary",
  className,
  prefetch = false,
  onClick,
  children,
}: MarketingButtonLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      onClick={onClick}
      className={cn(ds.btn.base, variantClass[variant], className)}
    >
      {children}
    </Link>
  );
}

export function MarketingButtonRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn(ds.btn.row, className)}>{children}</div>;
}
