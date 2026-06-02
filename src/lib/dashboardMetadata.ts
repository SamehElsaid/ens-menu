import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export type DashboardMetadataRef = {
  namespace: string;
  key: string;
};

export async function getDashboardPageMetadata(
  locale: string,
  ref: DashboardMetadataRef,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: ref.namespace });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { title: t(ref.key as any) };
}
