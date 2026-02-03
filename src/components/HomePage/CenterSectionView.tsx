"use client";
import { useTranslations } from "next-intl";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Center, centers } from "@/modules/center";
import { CenterCard } from "../Card/CenterCard";

export default function CenterSectionView() {
  const t = useTranslations("homePage.centerSection");

  return (
    <section className=" ">
      <div className="relative  rounded-md overflow-hidden">
        <div className="relative z-10 space-y-10 py-10">
          <section className="">
            <div className="container mx-auto px-4">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">{t("subtitle")}</p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {t("title")}
                  </h2>
                </div>
                <button className="text-sm font-semibold text-primary underline underline-offset-4">
                  {t("showMore")}
                </button>
              </div>

              <div className="relative">
                <Swiper
                  modules={[Pagination, Navigation, Autoplay]}
                  spaceBetween={20}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".swiper-button-prev-custom",
                    nextEl: ".swiper-button-next-custom",
                  }}
                  breakpoints={{
                    640: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    1024: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                    1280: {
                      slidesPerView: 3,
                      spaceBetween: 20,
                    },
                  }}
                  className="pb-12"
                  loop={true}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: false,
                  }}
                >
                  {centers.map((center: Center) => (
                    <SwiperSlide key={center.id}>
                      <CenterCard center={center} />
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Custom Navigation Arrows */}
                <button
                  className="swiper-button-prev-custom absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-700 hover:text-white hover:bg-primary border border-slate-200 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous slide"
                >
                  <FaChevronLeft className="w-5 h-5" />
                </button>
                <button
                  className="swiper-button-next-custom absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center text-slate-700 hover:text-white hover:bg-primary border border-slate-200 hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Next slide"
                >
                  <FaChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
