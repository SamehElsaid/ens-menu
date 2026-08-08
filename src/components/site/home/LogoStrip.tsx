"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { HomepageFeaturedLogo } from "@/lib/homepageFeaturedLogos";
import { fetchHomepageFeaturedLogosClient } from "@/lib/homepageFeaturedLogos";
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import { cn } from "@/lib/cn";

/** Below this many venues the strip is a static row rather than a marquee. */
const MARQUEE_MINIMUM = 6;

/**
 * Below this many venues the strip does not appear at all. A band captioned
 * "trusted by" holding one logo argues against itself; better to say nothing
 * than to make the product look unused.
 */
const STRIP_MINIMUM = 3;

/** The API returns a slug, not a display name. Humanise it so a screen reader
 *  announces "Cafe Lina" rather than "cafe-lina". */
function venueName(slug: string) {
  return slug.replace(/-/g, " ").trim();
}

/**
 * Venues already running on ENSMENU.
 *
 * The only social proof on the page that is real: these logos come from the
 * API, and each tile links to that venue's live menu — a visitor can click
 * through and see the product working for someone else. Nothing here is
 * authored, so if the API returns too few the section removes itself rather
 * than showing placeholders.
 */
export function LogoStrip({
  initialLogos = [],
}: {
  initialLogos?: HomepageFeaturedLogo[];
}) {
  const t = useTranslations("site.trustedBy");
  const [logos, setLogos] = useState(initialLogos);
  const [settled, setSettled] = useState(initialLogos.length > 0);

  useEffect(() => {
    if (initialLogos.length > 0) return;
    let cancelled = false;
    fetchHomepageFeaturedLogosClient()
      .then((items) => {
        if (!cancelled) setLogos(items);
      })
      .finally(() => {
        if (!cancelled) setSettled(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialLogos.length]);

  if (settled && logos.length < STRIP_MINIMUM) return null;

  /* A marquee needs enough tiles to fill the viewport twice over; below that it
     loops visibly and reads as a bug, so a short list is laid out as a plain
     centred row instead. */
  const scrolls = logos.length >= MARQUEE_MINIMUM;
  const track = scrolls ? [...logos, ...logos] : logos;

  return (
    <section
      aria-labelledby="trusted-by"
      className="border-y border-site-line bg-site-tint py-12 sm:py-14"
    >
      <p
        id="trusted-by"
        className="px-(--s-gutter) text-center text-site-xs font-semibold tracking-[0.08em] text-site-muted uppercase"
      >
        {t("title")}
      </p>

      <div
        className={cn(
          "mt-8 overflow-hidden",
          scrolls && "s-marquee s-edge-fade",
        )}
        dir="ltr"
      >
        {settled ? (
          <ul
            className={cn(
              "items-center gap-3 px-3 sm:gap-4",
              scrolls
                ? "s-marquee-track"
                : "flex flex-wrap justify-center gap-4",
            )}
          >
            {track.map((item, index) => {
              const href = publicMenuLinkUrl(
                resolvePublicMenuSlug(null, item.slug),
              );
              const decorative = index >= logos.length;
              const name = venueName(item.slug);
              const tile = (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logo}
                  alt={decorative ? "" : name}
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover"
                />
              );
              const tileClass =
                "flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-site-card border border-site-line bg-site-bg shadow-site-sm transition-[transform,box-shadow] duration-200 hover:shadow-site motion-safe:hover:-translate-y-1";

              return (
                <li key={`${item.id}-${index}`} aria-hidden={decorative}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      tabIndex={decorative ? -1 : undefined}
                      className={tileClass}
                    >
                      {tile}
                    </a>
                  ) : (
                    <span className={tileClass}>{tile}</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex justify-center gap-4 px-3" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="size-[4.5rem] shrink-0 animate-pulse rounded-site-card bg-site-line"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default LogoStrip;
