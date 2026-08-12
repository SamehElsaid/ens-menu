import type { CSSProperties } from "react";

const DIGITS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

/**
 * A figure whose digits roll to their new value.
 *
 * Each digit is a drum holding all ten glyphs, slid to show one of them — see
 * `.s-odo` in `public.css` for why it is built that way rather than by animating
 * digits in and out, and what that choice saved.
 *
 * There is no JavaScript here and no client boundary: the roll is a CSS
 * transition on an inline custom property, so this renders on the server and the
 * `prefers-reduced-motion` case is handled by the stylesheet rather than by a
 * hook that has to wait for hydration to be correct.
 *
 * Accessibility: the drums are decoration and are hidden — a screen reader
 * walking ten glyphs per digit would read the price as noise. The value is
 * announced once from a live region instead.
 */
export function Odometer({
  value,
  label,
}: {
  /** Already formatted for the locale — this component does not do arithmetic. */
  value: string;
  /** Announced with the value, e.g. the currency and period. */
  label?: string;
}) {
  const chars = value.split("");

  return (
    <>
      {/* `dir="ltr"` is load-bearing, not defensive. Each digit is its own
          inline-block, which is an atomic inline box, so the bidi algorithm no
          longer sees a number here — it sees a row of boxes, and in Arabic it
          would order them right-to-left and print the price backwards. Digits
          run left-to-right in every script, so pinning the direction is correct
          rather than a workaround. */}
      <span aria-hidden dir="ltr" className="tabular-nums">
        {chars.map((char, index) => {
          /* Punctuation is not a drum. A thousands separator is not a quantity
             and has nothing to roll to, and leaving it in normal flow keeps its
             descender out of the window's clipping. */
          if (!/\d/.test(char)) {
            return <span key={`sep-${index}`}>{char}</span>;
          }

          /* Keyed by place value — distance from the units digit — rather than by
             array index, so that the element persists across a change and its
             transition actually runs. Anchored on the right for the same reason
             arithmetic is: adding a digit shifts the figure left and every
             existing digit keeps its own drum. */
          const place = chars.length - index;

          return (
            <span key={`d-${place}`} className="s-odo">
              {/* Holds the slot open: the drum is out of flow, so without this the
                  slot would collapse. Being the only in-flow child, it is also
                  what gives the slot its baseline. */}
              <span className="invisible">{char}</span>
              <span className="s-odo-window">
                <span
                  className="s-odo-drum"
                  style={{ "--s-odo": char } as CSSProperties}
                >
                  {DIGITS.map((digit) => (
                    <span key={digit}>{digit}</span>
                  ))}
                </span>
              </span>
            </span>
          );
        })}
      </span>
      <span aria-live="polite" className="sr-only">
        {label ? `${value} ${label}` : value}
      </span>
    </>
  );
}
