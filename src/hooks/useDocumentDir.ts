"use client";

import { useLocale } from "next-intl";
import { getDir, type TextDirection } from "@/lib/localeDirection";

/** Client hook: document direction from active locale (inherits html[dir] when in sync). */
export function useDocumentDir(): TextDirection {
  return getDir(useLocale());
}
