import Image from "next/image";
import { useTranslations } from "next-intl";
import { FiSearch } from "react-icons/fi";
import {
  mockDemoProductImages,
  mockDemoProductPrices,
  type MockDemoProductId,
} from "@/lib/mockDemoProducts";
import { cn } from "@/lib/cn";

/**
 * The guest-facing menu, rendered as the product actually renders it: a phone,
 * a category strip, photographed dishes, a price and an add control.
 *
 * This is the page's central proof. It is built from the same demo dishes the
 * rest of the product's demos use, and it is a demonstration of the interface
 * rather than a claim about a customer — no venue name, no invented review.
 */

const ITEMS: MockDemoProductId[] = [
  "grilledChicken",
  "orangeJuice",
  "cheesecake",
  "potatoWedges",
];

export function PhoneMenu({
  className,
  priority,
}: {
  className?: string;
  priority?: boolean;
}) {
  const t = useTranslations("site.demo");

  return (
    <div
      className={cn(
        "relative aspect-[300/610] shrink-0 rounded-[2.5rem] border-[6px] border-site-ink-bg bg-site-ink-bg p-0 shadow-site-lg",
        className,
      )}
      aria-label={t("previewLabel")}
      role="img"
    >
      {/* Screen. `s-daylight` pins it light: a guest's phone does not follow
          this visitor's theme. */}
      <div className="s-daylight relative flex size-full flex-col overflow-hidden rounded-[2rem] bg-site-bg">
        <div className="flex items-center justify-between px-4 pt-3 pb-1 text-[10px] font-semibold text-site-ink/60">
          <span dir="ltr">9:41</span>
          <span aria-hidden className="flex items-center gap-1">
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
            <span className="h-1 w-1 rounded-full bg-site-ink/30" />
          </span>
        </div>

        <div className="px-4 pt-2 pb-3">
          <p className="text-[10px] font-semibold tracking-[0.1em] text-site-brand uppercase">
            {t("tableLabel")}
          </p>
          {/* Not a heading: the whole mock is one `role="img"`, and a venue
              that does not exist should not appear in the page outline. */}
          <p className="mt-0.5 font-site-display text-[17px] font-extrabold text-site-ink">
            {t("venueName")}
          </p>
          <div className="mt-2.5 flex items-center gap-2 rounded-full bg-site-tint px-3 py-2 text-[11px] text-site-muted">
            <FiSearch className="size-3.5" aria-hidden />
            {t("searchPlaceholder")}
          </div>
        </div>

        <div className="flex gap-1.5 overflow-hidden px-4 pb-3">
          {[t("catAll"), t("catGrills"), t("catDrinks"), t("catDesserts")].map(
            (cat, i) => (
              <span
                key={cat}
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold",
                  i === 0
                    ? "bg-site-brand text-site-bg-ink"
                    : "bg-site-tint text-site-muted",
                )}
              >
                {cat}
              </span>
            ),
          )}
        </div>

        {/* `s-enter-rows` staggers these into place on load, transform-only so
            the first row's priority image is painted immediately. The phone
            already clips, so the travel is contained by its own screen. */}
        <ul className="s-enter-rows flex-1 space-y-2.5 overflow-hidden px-4 pb-4">
          {ITEMS.map((id, index) => (
            <li
              key={id}
              data-home="dish-row"
              className="flex items-center gap-3 rounded-2xl border border-site-line bg-site-bg p-2 shadow-site-sm"
            >
              <Image
                src={mockDemoProductImages[id]}
                alt=""
                width={96}
                height={96}
                priority={priority && index === 0}
                loading={priority && index === 0 ? undefined : "lazy"}
                sizes="56px"
                className="size-14 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-semibold text-site-ink">
                  {t(`items.${id}`)}
                </p>
                <p className="mt-0.5 text-[11px] font-bold text-site-brand">
                  {mockDemoProductPrices[id]} {t("currency")}
                </p>
              </div>
              <span
                aria-hidden
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-site-brand text-[15px] leading-none font-bold text-site-bg-ink"
              >
                +
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-site-line px-4 py-3">
          <div className="flex h-10 items-center justify-center rounded-xl bg-site-ink-bg text-[12px] font-semibold text-white">
            {t("orderButton")}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhoneMenu;
