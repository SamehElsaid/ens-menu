"use client";

/**
 * Fullscreen editor — skips the admin layout's padded content area by rendering
 * as a fixed overlay. The parent AdminAccessGuard still wraps this route.
 *
 * The dark ground is DESIGN.md §14.3: the builder is a tool inside the tool and
 * keeps its own dark chrome so the canvas it edits is the brightest thing on
 * screen. It takes `--app-bg` rather than a palette grey, which means the
 * builder's ground is the same purple-tinted deep neutral as the product's own
 * dark theme instead of a second, bluer dark.
 *
 * `dark` scopes the token layer to its dark values for this subtree only. The
 * builder is dark whatever theme the app is in, so without it `--accent` would
 * resolve to the light-ground purple (`--brand-600`), which is too saturated to
 * read as type on these panels, rather than the dark-ground one (`#BF92FF`).
 * The dark variant is class-based (`&:where(.dark, .dark *)`), so `dark:`
 * utilities inside the builder also activate here even while the rest of the app
 * is in light mode — which is what a permanently dark tool wants.
 */
export default function TemplateEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark fixed inset-0 z-100 overflow-hidden bg-app">
      {children}
    </div>
  );
}
