"use client";

import type { ReactNode } from "react";
import OnboardingPageHelp from "./OnboardingPageHelp";

type PageTitleWithHelpProps = {
  children: ReactNode;
  className?: string;
};

export default function PageTitleWithHelp({
  children,
  className = "",
}: PageTitleWithHelpProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`.trim()}>
      {children}
      <OnboardingPageHelp />
    </div>
  );
}
