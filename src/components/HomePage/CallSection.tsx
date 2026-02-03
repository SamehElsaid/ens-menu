/* eslint-disable @next/next/no-img-element */

import { useTranslations } from "next-intl";

export default function CallSection() {
  const t = useTranslations("homePage.callSection");

  const homeServices = [
    {
      id: "home-visit",
      title: t("homeVisit.title"),
      description: t("homeVisit.description"),
      cta: t("homeVisit.cta"),
      image:
        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "doctor-call",
      title: t("doctorCall.title"),
      description: t("doctorCall.description"),
      cta: t("doctorCall.cta"),
      image:
        "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
    },
    {
      id: "book-online",
      title: "book-online",
      description: "book-online description",
      cta: "book-online cta",
      image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=600&q=80",
    },
  ];

  return (
    <section className="py-12 container ">

      <div className="relative  rounded-md overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute  inset-0 bg-linear-to-br from-secondary/10 via-secondary/5 to-secondary/0" />

        {/* Decorative Elements */}
        <div className="absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-linear-to-br from-[#ef4444]/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/4 h-80 w-80 -translate-x-1/2 rounded-full bg-linear-to-tr from-[#00b5ff]/10 to-transparent blur-3xl" />

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-size-[4rem_4rem] opacity-30" />


        {/* Content Container */}
        <div className="relative z-10 space-y-10 py-10">
          <section className="">

            <div className="container mx-auto space-y-6 px-4">
              <div className="flex flex-col gap-6 rounded-3xl bg-white p-8 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-800">
                    {t("questionTitle")}
                  </p>
                  <p className="mt-2 text-slate-500">
                    {t("questionDescription")}
                  </p>
                </div>
                <button className="self-start rounded-full bg-[#e7f1ff] px-6 py-3 text-sm font-semibold text-[#0055d4] transition hover:bg-[#d7e8ff] md:self-auto">
                  {t("askNow")}
                </button>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {homeServices.map((service) => (
                  <div
                    key={service.id}
                    className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm md:flex-row"
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-slate-800">
                        {service.title}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {service.description}
                      </p>
                      <button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0055d4]">
                        {service.cta}
                        <span aria-hidden="true">↗</span>
                      </button>
                    </div>
                    <div className="h-32 w-full overflow-hidden rounded-2xl md:w-40">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

