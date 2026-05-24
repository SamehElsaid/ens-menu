import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import HeroBackground from "@/components/HomePage/HeroBackground";
import HeroLinaImage from "@/components/HomePage/HeroLinaImage";

type HeroContentProps = {
  locale: string;
};

export default async function HeroContent({ locale }: HeroContentProps) {
  const t = await getTranslations({ locale, namespace: "heroSection" });
  const isRTL = locale === "ar";

  return (
    <section
      id="hero"
      className="hero-section relative flex min-h-[70vh] items-center overflow-hidden bg-white pt-28  lg:min-h-[92vh] lg:pt-30  dark:bg-[#0d1117]"
    >
      <HeroBackground />
      <div className="container relative z-10 mx-auto px-6">
        <div className="mx-auto flex-col-reverse lg:flex-row flex w-full  justify-between  items-center text-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-purple-100 bg-purple-50 px-5 py-2 text-sm font-bold text-purple-700 shadow-sm dark:border-purple-500/30 dark:bg-purple-500/20 dark:text-purple-400">
              <span>{t("badge")}</span>
              <span>🚀</span>
            </div>

            <h1 className="mb-6 text-2xl font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-3xl lg:text-4xl dark:text-white">
              {t("title1")}{" "}
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent dark:from-purple-400 dark:to-indigo-400">
                {t("title2")}
              </span>
            </h1>

            <p className="mb-8 max-w-xl text-base leading-relaxed font-medium text-slate-600 sm:text-lg dark:text-slate-300">
              {t("description")}
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/auth/login"
                prefetch={false}
                className="inline-flex items-center gap-3 rounded-full bg-linear-to-r from-purple-600 to-purple-700 px-8 py-4 text-base font-bold text-white shadow-2xl shadow-purple-300/40 transition-transform hover:scale-[1.02] dark:from-purple-500 dark:to-purple-600 dark:shadow-purple-900/50"
              >
                <span>{t("cta")}</span>
                <span aria-hidden>{isRTL ? "←" : "→"}</span>
              </Link>
            </div>
          </div>

          <HeroLinaImage alt={t("linaAlt")} />
        </div>
      </div>
    </section>
  );
}
