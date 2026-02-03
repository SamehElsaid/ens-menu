"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { usePathname } from "@/i18n/navigation";
import { useCallback, useEffect, useRef } from "react";
import { Swiper as SwiperType } from "swiper/types";
import { clientNavigationItems, ClientNavigationItem } from "@/modules/client";
import LinkTo from "./Global/LinkTo";

interface ClientNavigationSwiperProps {
  setLoading: (loading: React.SetStateAction<boolean>) => void;
  loading: boolean;
  clientId: string;
}

export default function ClientNavigationSwiper({
  setLoading,
  loading,
  clientId,
}: ClientNavigationSwiperProps) {
  const pathname = usePathname();
  const swiperRef = useRef<SwiperType>(null);

  const isActive = useCallback(
    (href: string) => {
      const normalizedPathname = pathname?.replace(/\/$/, "") || "";
      const normalizedHref = href.replace(/\/$/, "");

      // For overview route, match exactly (no sub-routes)
      if (normalizedHref === `/specialist/client/${clientId}`) {
        return normalizedPathname === normalizedHref;
      }
      // For other routes, match if pathname starts with the href
      return (
        normalizedPathname === normalizedHref ||
        normalizedPathname.startsWith(normalizedHref + "/")
      );
    },
    [pathname, clientId]
  );

  useEffect(() => {
    // Find active slide index and scroll to it
    const activeIndex = clientNavigationItems.findIndex(
      (item: ClientNavigationItem) => isActive(item.href)
    );
    if (activeIndex !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(activeIndex);
    }
  }, [isActive]);

  // Update hrefs with clientId
  const navigationItemsWithId = clientNavigationItems.map((item) => ({
    ...item,
    href: `/specialist/clients/${clientId}/${item.key}`,
  }));

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={10}
          slidesPerView="auto"
          freeMode={true}
          navigation={{
            prevEl: ".client-nav-prev",
            nextEl: ".client-nav-next",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="client-navigation-swiper"
        >
          {navigationItemsWithId.map((item) => (
            <SwiperSlide key={item.href} style={{ width: "auto" }}>
              <LinkTo
                disabled={loading}
                href={item.href}
                onClick={() => (!isActive(item.href) ? setLoading(true) : null)}
                className={`
                  inline-block px-4 md:px-6 py-2.5 rounded-lg font-medium text-sm md:text-base
                  transition-all duration-200 whitespace-nowrap
                  ${
                    isActive(item.href)
                      ? "bg-primary text-white shadow-md"
                      : "bg-primary/10 text-primary"
                  }
                `}
              >
                {item.label}
              </LinkTo>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
