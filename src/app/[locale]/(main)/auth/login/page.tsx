import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/LoginForm";
import LoginOnboardingVisual from "@/components/Auth/LoginOnboardingVisual";
import { axiosGet } from "@/shared/axiosCall";

type LoginPageViewProps = {
  locale: string;
};

export default async function LoginPageView({ locale }: LoginPageViewProps) {
  const t = await getTranslations({ locale, namespace: "loginPage" });
  const promo = await axiosGet<{ data: { text: string; boolean: boolean } }>(
    "/promo",
    locale,
  );
  const rawText =
    promo.status && promo.data?.data?.text ? promo.data.data.text : "";
  const promoEnabled = (promo.status && promo.data?.data?.boolean) ?? false;

  let promoText = rawText;
  try {
    const parsed = JSON.parse(rawText) as { ar?: string; en?: string };
    promoText = (locale === "ar" ? parsed.ar : parsed.en) ?? rawText;
  } catch {
    // plain string fallback
  }

  const trustBadges = [t("trust.secure"), t("trust.cloud"), t("trust.fast")];
  const features = [t("features.qr"), t("features.orders")];

  return (
    <div className="login-page relative flex flex-col overflow-x-hidden lg:flex-1">
      <div
        aria-hidden
        className="login-page__gradient pointer-events-none absolute inset-x-0 top-0 hidden h-56 bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,58,237,0.14),transparent_68%)] md:block dark:bg-[radial-gradient(ellipse_at_50%_-10%,rgba(124,58,237,0.2),transparent_68%)]"
      />

      <div className="login-page__shell relative z-1 flex w-full min-w-0 flex-col justify-start pb-3 pt-12 sm:px-5 sm:pb-6 sm:pt-18 lg:flex-1 lg:justify-center lg:px-6 lg:pb-6 lg:pt-18">
        <div className="login-page__container mx-auto flex w-full min-w-0 max-w-216 flex-col gap-4 lg:gap-0">
          <section
            aria-label={t("headline")}
            className="login-page__welcome lg:hidden"
          >
            <LoginOnboardingVisual
              variant="compact"
              headline={t("headline")}
              headlineAccent={t("headlineAccent")}
              subtitle={t("subtitle")}
              trustBadges={trustBadges}
            />
          </section>

          <div className="login-auth-card">
            <div className="login-auth-card__brand hidden lg:block">
              <LoginOnboardingVisual
                headline={t("headline")}
                headlineAccent={t("headlineAccent")}
                subtitle={t("subtitle")}
                trustBadges={trustBadges}
                features={features}
              />
            </div>

            <div className="login-auth-card__form">
              {promoEnabled && promoText && (
                <div className="login-promo-banner mb-4 space-y-0.5 rounded-lg border border-purple-200 bg-purple-50 px-3.5 py-2.5 text-start text-[13px] text-purple-900 dark:border-purple-500/35 dark:bg-purple-950/40 dark:text-purple-200">
                  {promoText
                    .split("\n")
                    .filter((line) => line.trim())
                    .map((line) => (
                      <p key={line}>{line.trim()}</p>
                    ))}
                </div>
              )}

              <div className="login-auth-card__form-header mb-4 text-start sm:mb-5">
                <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg md:text-xl dark:text-white">
                  {t("formTitle")}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 sm:mt-1 sm:text-[13px] dark:text-slate-400">
                  {t("formSubtitle")}
                </p>
              </div>

              <Suspense fallback={null}>
                <LoginForm />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
