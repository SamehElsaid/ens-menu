"use client";

import { useTranslations } from "next-intl";
import { PhoneFrame, ScreenMenu } from "./story/screens";

/**
 * The guest menu, in a phone, standing still.
 *
 * The hero's static proof and the first frame of the story are deliberately the
 * same component: when the travelling phone in `StoryPhone` takes over, it
 * covers this one pixel for pixel, so the handoff is invisible. This is also
 * the whole hero for a visitor with JavaScript off or reduced motion on.
 */
export function PhoneMenu({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  const t = useTranslations("site.demo");

  return (
    <PhoneFrame label={t("previewLabel")} className={className}>
      <ScreenMenu priority={priority} />
    </PhoneFrame>
  );
}

export default PhoneMenu;
