import { getTranslations } from "next-intl/server";
import HomeCTAShowcase from "@/components/HomePage/HomeCTAShowcase";

type HomeCTASectionProps = {
  locale: string;
};

export default async function HomeCTASection({ locale }: HomeCTASectionProps) {
  const t = await getTranslations({ locale, namespace: "homeCtaSection" });

  return (
    <section id="home-cta" className="home-cta-section relative overflow-x-clip">
      <div className="home-section-shell relative z-[1] py-12 sm:py-16 lg:py-24 xl:py-28">
        <HomeCTAShowcase
          title={t("preFooter.title")}
          description={t("preFooter.description")}
          ctaLabel={t("preFooter.cta")}
        />
      </div>
    </section>
  );
}
