"use client";

import { useTranslations } from "next-intl";
import { FaGooglePlay, FaApple } from "react-icons/fa";

const GOOGLE_PLAY_URL =
  "https://play.google.com/store/apps/details?id=com.ensmenu.ens_owner_app";

const CtaOwnerApp = () => {
  const t = useTranslations("Landing.OwnerApp");

  return (
    <section className="py-24 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-white/5 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-black/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
          {t("ctaTitle")}
        </h2>
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm text-white backdrop-blur-sm">
            <span className="size-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
            <span dir="ltr" className="font-semibold tracking-tight">
              Android
            </span>
            <span className="text-white/35" aria-hidden>
              ·
            </span>
            <span className="text-violet-100">{t("ctaAndroidStatus")}</span>
          </span>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/70">
            <span className="size-1.5 shrink-0 rounded-full bg-white/35" aria-hidden />
            <span dir="ltr" className="font-semibold tracking-tight">
              iOS
            </span>
            <span className="text-white/25" aria-hidden>
              ·
            </span>
            <span>{t("ctaIosStatus")}</span>
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Google Play */}
          <a
            href={GOOGLE_PLAY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-4 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold hover:scale-[1.03] transition-all shadow-2xl shadow-black/30 active:scale-95 min-w-[210px]"
          >
            <FaGooglePlay
              size={26}
              className="text-green-600 shrink-0 group-hover:scale-110 transition-transform"
            />
            <div className="text-start border-s border-slate-200 ps-4">
              <span className="block text-[10px] opacity-50 font-semibold uppercase tracking-[0.2em] leading-none mb-1">
                GET IT ON
              </span>
              <span className="block text-base font-black tracking-tight">
                {t("googlePlay")}
              </span>
            </div>
          </a>

          {/* Apple — coming soon */}
          <div className="relative flex items-center gap-4 px-8 py-4 bg-white/10 text-white/50 rounded-2xl font-bold border border-white/20 cursor-not-allowed min-w-[210px] select-none">
            <FaApple size={28} className="shrink-0 opacity-50" />
            <div className="text-start border-s border-white/20 ps-4">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] leading-none mb-1 opacity-60">
                DOWNLOAD ON THE
              </span>
              <span className="block text-base font-black tracking-tight">
                App Store
              </span>
            </div>
            <span className="absolute -top-2.5 -end-2 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-900 rounded-full shadow-md">
              {t("appleComingSoon")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CtaOwnerApp;
