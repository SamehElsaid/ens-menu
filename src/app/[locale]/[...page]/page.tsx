import { getTranslations } from "next-intl/server";
import LinkTo from "@/components/Global/LinkTo";

export default async function NotFoundPage() {
  const t = await getTranslations("NotFound");

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 py-16 overflow-hidden text-center">
      {/* Background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -start-32 h-96 w-96 rounded-full opacity-20 blur-3xl"
        style={{ background: "var(--primary)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -end-32 h-96 w-96 rounded-full opacity-10 blur-3xl"
        style={{ background: "var(--primary)" }}
      />

      <div className="relative z-10 max-w-lg w-full space-y-8">
        {/* SVG illustration */}
        <div className="flex justify-center">
          <svg
            width="220"
            height="160"
            viewBox="0 0 220 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
          >
            {/* Page base */}
            <rect x="50" y="10" width="120" height="140" rx="10" fill="currentColor" className="text-slate-100 dark:text-slate-800" />
            {/* Torn corner */}
            <path d="M150 10 L170 10 L150 30 Z" fill="currentColor" className="text-slate-200 dark:text-slate-700" />
            {/* Lines on page */}
            <rect x="70" y="45" width="80" height="8" rx="4" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
            <rect x="70" y="63" width="60" height="8" rx="4" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
            <rect x="70" y="81" width="70" height="8" rx="4" fill="currentColor" className="text-slate-300 dark:text-slate-600" />
            {/* Big X / broken mark */}
            <circle cx="110" cy="115" r="18" fill="currentColor" className="text-primary opacity-20" />
            <line x1="100" y1="105" x2="120" y2="125" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-primary" />
            <line x1="120" y1="105" x2="100" y2="125" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" className="text-primary" />
          </svg>
        </div>

        {/* 404 number */}
        <div className="relative">
          <p
            className="text-[7rem] leading-none font-extrabold select-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, var(--primary) 0%, color-mix(in oklab, var(--primary) 60%, #60a5fa) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </p>
          {/* Glow under number */}
          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 mx-auto h-4 w-32 rounded-full blur-xl opacity-40"
            style={{ background: "var(--primary)" }}
          />
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("title")}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-base">
            {t("body")}
          </p>
        </div>

        {/* CTA */}
        <LinkTo
          href="/"
          className="btn-gradient-primary inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          {t("backHome")}
        </LinkTo>
      </div>
    </div>
  );
}
