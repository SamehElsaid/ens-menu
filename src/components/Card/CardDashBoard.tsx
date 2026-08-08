import { Card } from "@/components/ui";
import { cn } from "@/lib/cn";

interface CardDashBoardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
  border?: boolean;
  borderColor?: string;
}

/**
 * Legacy dashboard panel kept for the pages that already use it.
 * New surfaces should import `Card` from `@/components/ui` directly.
 */
function CardDashBoard({
  className = "",
  children,
  hover = false,
  border = true,
  borderColor,
}: CardDashBoardProps) {
  return (
    <Card
      variant={border ? "flat" : "raised"}
      padded="lg"
      interactive={hover}
      className={cn(borderColor, className)}
    >
      {children}
    </Card>
  );
}

export default CardDashBoard;
