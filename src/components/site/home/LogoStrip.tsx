"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useViewportPause } from "@/motion/useViewportPause";
import type { HomepageFeaturedLogo } from "@/lib/homepageFeaturedLogos";
import { fetchHomepageFeaturedLogosClient } from "@/lib/homepageFeaturedLogos";
import { publicMenuLinkUrl, resolvePublicMenuSlug } from "@/lib/publicMenuUrl";
import { cn } from "@/lib/cn";
import { DEFAULT_MENU_ITEM_IMAGE_SRC } from "@/components/menuItemImage";

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

function probeImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = new window.Image();
    probe.onload = () => resolve(true);
    probe.onerror = () => resolve(false);
    probe.src = src;
  });
}

/**
 * One venue mark. Starts on the bundled placeholder and only swaps to the real
 * logo after a preload succeeds — a dead URL never reaches the DOM as `<img src>`.
 */
function LogoTile({
  logo,
  name,
  decorative,
}: {
  logo: string | null | undefined;
  name: string;
  decorative: boolean;
}) {
  const src = logo?.trim() ?? "";
  /* The effect only ever records a URL that loaded; which URL is shown is
     derived from that. Storing the displayed URL instead would mean writing
     state synchronously whenever `src` cleared, to say something the render
     already knows. */
  const [verified, setVerified] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;

    let cancelled = false;
    void probeImage(src).then((ok) => {
      if (!cancelled && ok) setVerified(src);
    });

    return () => {
      cancelled = true;
    };
  }, [src]);

  const displaySrc =
    src && verified === src ? src : DEFAULT_MENU_ITEM_IMAGE_SRC;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={displaySrc}
      alt={decorative ? "" : name}
      width={72}
      height={72}
      loading="lazy"
      decoding="async"
      className="size-full object-cover"
      onError={(event) => {
        const img = event.currentTarget;
        if (img.dataset.fallback === "1") return;
        img.dataset.fallback = "1";
        img.src = DEFAULT_MENU_ITEM_IMAGE_SRC;
      }}
    />
  );
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
  /* This strip is the only permanently animating thing on the site, which makes
     it the only one worth gating: an infinite translate is a composited layer
     and a battery cost that would otherwise be paid while the band sits three
     screens above the viewport, or while the tab is in the background. */
  const marqueeRef = useViewportPause<HTMLDivElement>();

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
    /* Caption beside the strip, not above it. The band is proof, not a section:
       giving it a centred heading and its own vertical rhythm made it read as
       one of the page's five movements, which it is not. */
    <section
      aria-labelledby="trusted-by"
      data-home-section="logos"
      className="border-y border-site-line bg-site-tint"
    >
      <div className="mx-auto flex w-full max-w-(--s-max) flex-col gap-6 px-(--s-gutter) py-10 lg:flex-row lg:items-center lg:gap-10">
        <p
          id="trusted-by"
          className="s-ticket shrink-0 text-site-muted lg:max-w-[13rem]"
        >
          {t("title")}
        </p>

        <div
          ref={marqueeRef}
          className={cn(
            "min-w-0 flex-1 overflow-hidden",
            scrolls && "s-marquee s-edge-fade",
          )}
          dir="ltr"
        >
          {settled ? (
            <ul
              className={cn(
                "items-center",
                scrolls ? "s-marquee-track" : "flex flex-wrap",
              )}
            >
              {track.map((item, index) => {
                const href = publicMenuLinkUrl(
                  resolvePublicMenuSlug(null, item.slug),
                );
                const decorative = index >= logos.length;
                const name = venueName(item.slug);
                /* Rounded plates with air between them: the strip is a row of
                   venues, and shared edges made it read as one table. */
                const tileClass =
                  "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-site-card border border-site-line bg-site-bg transition-colors duration-(--dur-settle) ease-(--ease-settle) hover:border-site-brand-line";

                const tile = (
                  <LogoTile
                    logo={item.logo}
                    name={name}
                    decorative={decorative}
                  />
                );

                return (
                  <li
                    key={`${item.id}-${index}`}
                    aria-hidden={decorative}
                    className="pe-3"
                  >
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
            <div className="flex" aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  /* `motion-safe:` matters here: Tailwind's `animate-pulse`
                     carries no reduced-motion guard of its own, so without it
                     eight elements keep pulsing for a visitor who asked for
                     stillness. The placeholder is legible without the pulse. */
                  className="me-3 size-16 shrink-0 rounded-site-card border border-site-line bg-site-line/60 motion-safe:animate-pulse"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LogoStrip;
