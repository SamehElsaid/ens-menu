"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useLocale } from "next-intl";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const isArabic = locale === "ar";

  useEffect(() => {
    Sentry.captureException(error, {
      tags: { error_boundary: "admin" },
    });
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold">
        {isArabic ? "تعذر تحميل الإدارة" : "The admin page failed to load"}
      </h1>
      <p>
        {isArabic
          ? "حدث خطأ أثناء تحميل هذه الصفحة."
          : "Something went wrong while loading this page."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-lg bg-black px-5 py-2 text-white"
      >
        {isArabic ? "إعادة المحاولة" : "Try again"}
      </button>
    </main>
  );
}
