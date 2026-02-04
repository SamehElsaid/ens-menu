import { useTranslations, useLocale } from "next-intl";
import { FeatureCardProps } from "@/types/types";
import { features } from "@/modules/FeatureSection/data";

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="p-8 rounded-[35px] bg-white dark:bg-[#15203c] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-100/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-purple-100/50 dark:hover:shadow-purple-900/50 transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50/50 dark:bg-purple-500/10 rounded-bl-[100px] -mr-12 -mt-12 transition-all group-hover:scale-150 group-hover:bg-purple-100/50 dark:group-hover:bg-purple-500/20"></div>
    <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 relative z-10">
      <Icon size={28} />
    </div>
    <h3 className="text-[18px]! font-bold mb-4 text-slate-900 dark:text-white relative z-10">
      {title}
    </h3>
    <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed font-medium relative z-10">
      {description}
    </p>
  </div>
);

export const Features = () => {
  const t = useTranslations("Landing.features");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const featuresList = features.map((feature) => ({
    id: feature.id,
    title: t(`items.${feature.translationKey}.title`),
    description: t(`items.${feature.translationKey}.description`),
    icon: feature.icon,
  }));

  return (
    <section id="features" className="py-24 bg-white dark:bg-[#0d1117]">
      <div className="container mx-auto px-6">
        <div
          className={`flex flex-col md:flex-row justify-between items-end mb-16 gap-6 ${
            isRTL ? "md:flex-row-reverse" : ""
          }`}
        >
          <div className="flex gap-2">
            <div className="w-12 h-1.5 rounded-full bg-purple-600"></div>
            <div className="w-4 h-1.5 rounded-full bg-purple-200 dark:bg-purple-800"></div>
            <div className="w-4 h-1.5 rounded-full bg-purple-200 dark:bg-purple-800"></div>
          </div>
          <div
            className={`max-w-2xl ${
              isRTL ? "text-right md:text-right" : "text-left md:text-left"
            }`}
          >
            <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">
              {t("title")}{" "}
            </h2>
            <p className="text-md text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t("description")}
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuresList.map((feature) => (
            <FeatureCard
              key={feature.id}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
