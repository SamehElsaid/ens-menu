import { getTranslations } from "next-intl/server";
import RegisterForm from "@/components/RegisterForm";
import RegisterOnboardingVisual from "@/components/Auth/RegisterOnboardingVisual";
import { buildCtaMenuItems } from "@/lib/mockDemoProducts";
import { isRtlLocale } from "@/lib/localeDirection";

type RegisterPageViewProps = {
  locale: string;
};

export default async function RegisterPageView({ locale }: RegisterPageViewProps) {
  const t = await getTranslations({ locale, namespace: "registerPage" });
  const isRtl = isRtlLocale(locale);

  const menuItems = buildCtaMenuItems(
    {
      item1: t("menu.item1"),
      item2: t("menu.item2"),
      item3: t("menu.item3"),
    },
    isRtl,
  ).map(({ name, price, image }) => ({ name, price, image }));

  const trustBadges = [
    t("trust.free"),
    t("trust.noCard"),
    t("trust.fast"),
    t("trust.features"),
  ];

  const benefits = (["ai", "qr", "orders"] as const).map((id) => ({
    id,
    icon: id,
    title: t(`benefits.${id}.title`),
    description: t(`benefits.${id}.description`),
  }));

  const steps = [
    { id: "account", label: t("steps.account") },
    { id: "business", label: t("steps.business") },
    { id: "launch", label: t("steps.launch") },
  ];

  return (
    <div className="register-page relative flex flex-1 flex-col overflow-hidden pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pb-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_50%_0%,rgba(124,58,237,0.12),transparent_70%)]"
      />

      <div className="home-section-shell relative z-1">
        <div className="mx-auto max-w-6xl">
          {/* Mobile / tablet hero */}
          <div className="mb-6 text-center lg:hidden">
            <h1 className="text-[1.45rem] font-bold leading-tight tracking-[-0.02em] text-fg sm:text-[1.65rem]">
              {t("headline")}{" "}
              <span className="text-brand">{t("headlineAccent")}</span>
            </h1>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-fg-muted">
              {t("subtitle")}
            </p>
          </div>

          <div className="mb-5 lg:hidden">
            <RegisterOnboardingVisual
              compact
              headline={t("headline")}
              headlineAccent={t("headlineAccent")}
              subtitle={t("subtitle")}
              trustBadges={trustBadges}
              benefits={benefits}
              restaurantName={t("menu.restaurantName")}
              menuItems={menuItems}
              addLabel={t("menu.add")}
            />
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="register-page__form mx-auto w-full max-w-[440px] lg:max-w-none lg:justify-self-start">
              <div className="register-form-card rounded-2xl border border-line bg-surface p-5 shadow-sm sm:p-6">
                <div className="mb-5 hidden text-start lg:block">
                  <h2 className="text-xl font-semibold tracking-[-0.016em] text-fg">
                    {t("formTitle")}
                  </h2>
                  <p className="mt-1 text-[13px] text-fg-muted">
                    {t("formSubtitle")}
                  </p>
                </div>

                <RegisterForm steps={steps} />
              </div>
            </div>

            <RegisterOnboardingVisual
              headline={t("headline")}
              headlineAccent={t("headlineAccent")}
              subtitle={t("subtitle")}
              trustBadges={trustBadges}
              benefits={benefits}
              restaurantName={t("menu.restaurantName")}
              menuItems={menuItems}
              addLabel={t("menu.add")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
