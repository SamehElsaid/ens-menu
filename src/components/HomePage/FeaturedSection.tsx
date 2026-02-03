
import { Doctor, doctors } from "@/modules/doctor";
import { useTranslations } from "next-intl";
import DoctorCard from "../Card/DoctorCard";

function useCategories() {
  const t = useTranslations("homePage.featuredSection.categories");
  return [
    t("all"),
    t("teeth"),
    t("digestive"),
    t("psychiatric"),
    t("rheumatism"),
    t("bones"),
    t("vascular"),
    t("ent"),
    t("nutrition"),
    t("pediatricSurgery"),
    t("kidney"),
  ];
}

export default function FeaturedSection() {
  const t = useTranslations("homePage.featuredSection");
  const categories = useCategories();

  return (
    <section className="py-12 container">
      <div className="relative  rounded-md overflow-hidden">
            <div className="relative z-10 space-y-10 py-10">
          <section>
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

              <div className="mb-8 flex flex-wrap gap-3">
                {categories.map((category, index) => (
                  <button
                    key={category}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                      index === 0
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-slate-200 bg-white text-slate-600 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {doctors.map((doctor: Doctor) => (
                  <DoctorCard key={doctor.id} doctor={doctor} />
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

