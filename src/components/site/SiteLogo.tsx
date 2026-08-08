import { BsQrCode } from "react-icons/bs";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

/**
 * Public-site wordmark.
 *
 * A variant rather than an edit: `components/Global/Logo` is rendered by the
 * dashboard header and sidebar, and changing it would move the product. This
 * keeps the two brand commitments — the QR glyph and the ENSMENU wordmark —
 * and drops the gradient fill and the spin, neither of which survives at
 * marketing scale.
 */
export function SiteLogo({
  onInk,
  className,
  onClick,
  label = "ENSMENU",
}: {
  onInk?: boolean;
  className?: string;
  onClick?: () => void;
  /** Screens where the mark is the only way out say so, e.g. "Back to home". */
  label?: string;
}) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "group inline-flex items-center gap-2.5 rounded-site-sm",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-9 items-center justify-center rounded-[10px] transition-transform duration-200 group-hover:-rotate-6",
          onInk
            ? "bg-white/10 text-white ring-1 ring-white/15 ring-inset"
            : "bg-site-brand text-white shadow-site-brand",
        )}
      >
        <BsQrCode size={19} />
      </span>
      <span
        className={cn(
          "font-site-display text-[1.0625rem] font-extrabold tracking-[-0.03em]",
          onInk ? "text-white" : "text-site-ink",
        )}
      >
        ENSMENU
      </span>
    </Link>
  );
}

export default SiteLogo;
