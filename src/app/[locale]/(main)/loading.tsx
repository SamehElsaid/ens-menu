import { getTranslations } from "next-intl/server";
import { SiteSpinner } from "@/components/site/Button";

/**
 * Shown while a public route's own data is on the wire.
 *
 * Deliberately not a skeleton: these pages differ too much for one placeholder
 * to resemble any of them, and a skeleton that guesses wrong reads as a broken
 * layout. The header and footer are already on screen from the layout, so all
 * this has to do is hold the content area's height and say that work is in
 * progress.
 */
export default async function MainLoading() {
  const t = await getTranslations("Landing.header");

  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center">
      <SiteSpinner className="size-7 text-site-brand" label={t("loading")} />
    </div>
  );
}
