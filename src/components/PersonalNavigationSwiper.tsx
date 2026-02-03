"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef } from "react";

import { Swiper as SwiperType } from "swiper/types";
import { navigationItems, parentNavigationItems, PersonalNavigationItem } from "@/modules/personal";
import LinkTo from "./Global/LinkTo";

export default function PersonalNavigationSwiper({
  setLoading,
  loading,
  type = "specialist",
  }: {
  setLoading: (loading: React.SetStateAction<boolean>) => void;
  loading: boolean;
  type?: "specialist" | "parent";
}) {
  const t = useTranslations("");
  const pathname = usePathname();
  const swiperRef = useRef<SwiperType>(null);

  const isActive = useCallback(
    (href: string) => {
      return pathname === href || pathname?.startsWith(href + "/");
    },
    [pathname]
  );

  useEffect(() => {
    // Find active slide index and scroll to it
    const activeIndex = navigationItems.findIndex(
      (item: PersonalNavigationItem) => isActive(item.href)
    );
    if (activeIndex !== -1 && swiperRef.current) {
      swiperRef.current.slideTo(activeIndex);
    }
  }, [isActive]);

  const navigationItemsData = type === "specialist" ? navigationItems : parentNavigationItems;  

  return (
    <div className="relative mb-6">
      <div className="relative">
        <Swiper
          modules={[Navigation, FreeMode]}
          spaceBetween={10}
          slidesPerView="auto"
          freeMode={true}
          navigation={{
            prevEl: ".personal-nav-prev",
            nextEl: ".personal-nav-next",
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          className="personal-navigation-swiper"
        >
          {navigationItemsData.map((item) => (
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
                {t(`personal.${item.key}`) || item.label}
              </LinkTo>
            </SwiperSlide>
          ))}
        </Swiper>

        
      </div>
    </div>
  );
}
