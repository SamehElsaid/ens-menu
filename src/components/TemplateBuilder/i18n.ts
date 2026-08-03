"use client";

import { useTranslations } from "next-intl";

/** Resolve component type label from templateBuilder.componentsMap */
export function useComponentLabel() {
  const t = useTranslations("templateBuilder");
  return (type: string, fallback?: string) => {
    const map = t.raw("componentsMap") as Record<string, string>;
    return map[type.replace(/\./g, "_")] ?? fallback ?? type;
  };
}
