import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";

export const CTA = () => {
  const t = useTranslations("Landing.cta");
  const tFooter = useTranslations("Landing.footer");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <section id="contact" className="bg-white py-20 dark:bg-[#0d1117]">
      <div className="container mx-auto px-6">
        <div className="bg-linear-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 rounded-[60px] p-12 lg:p-20 text-center text-white shadow-[0_30px_60px_-15px_rgba(124,58,237,0.5)] dark:shadow-[0_30px_60px_-15px_rgba(168,85,247,0.4)] relative overflow-hidden">
          {/* Blur circles */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

          {/* Content */}
          <h2 className="relative z-10 mb-6 text-3xl font-extrabold lg:text-5xl">
            {t("title")}
          </h2>
          <p className="relative z-10 mx-auto mb-10 max-w-2xl text-base font-medium leading-relaxed text-purple-100 md:text-lg dark:text-purple-200">
            {t("description")}
          </p>

          {/* CTA Buttons */}
          <div
            className={`flex flex-wrap justify-center gap-4 relative z-10 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            <div>
              <Link
                href={`/auth/login`}
                className="inline-block px-10 py-5 bg-white text-purple-700 rounded-full font-black text-md shadow-2xl hover:bg-purple-50 transition-all"
              >
                {t("button")}
              </Link>
            </div>
            <button className="px-10 py-5 bg-purple-800/50 text-white rounded-full font-black text-md border border-purple-400 backdrop-blur-md hover:bg-purple-700/50 transition-all">
              {tFooter("contactUs")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
