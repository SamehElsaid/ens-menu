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
 *
 * In the "Pass" direction the glyph is a square ink chip rather than a rounded
 * brand-coloured tile: the mark has to read as something stamped onto paper,
 * and the accent is reserved for state. The hover is a colour change, not a
 * rotation — nothing on this site tilts.
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
          "flex size-9 items-center justify-center rounded-site-sm transition-colors duration-(--dur-settle)",
          onInk
            ? "bg-site-on-ink text-site-ink-bg group-hover:bg-site-brand-bright"
            : "bg-site-ink text-site-ground group-hover:bg-site-brand",
        )}
      >
        <BsQrCode size={19} />
      </span>
      <span
        className={cn(
          "font-site-display text-[1.0625rem] font-bold tracking-[-0.04em] uppercase",
          onInk ? "text-site-on-ink" : "text-site-ink",
        )}
      >
        ENSMENU
      </span>
    </Link>
  );
}

export default SiteLogo;
