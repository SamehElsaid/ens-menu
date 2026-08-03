"use client";

/**
 * Fullscreen editor — skip dashboard chrome from parent admin layout
 * by rendering outside the padded content area via fixed overlay.
 * Parent AdminAccessGuard still wraps this route.
 */
export default function TemplateEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 overflow-hidden">
      {children}
    </div>
  );
}
