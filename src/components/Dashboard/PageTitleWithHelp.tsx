"use client";

import type { ReactNode } from "react";

type PageTitleWithHelpProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitleWithHelp({
  children,
  className = "",
}: PageTitleWithHelpProps) {
  return (
    <div className={className.trim() || undefined}>{children}</div>
  );
}
