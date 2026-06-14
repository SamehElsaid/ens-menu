/** Inline “forward” arrow that flips with document `dir` (use inside links/CTAs). */
export default function ForwardArrow() {
  return (
    <span aria-hidden className="inline-block rtl:rotate-180">
      →
    </span>
  );
}
