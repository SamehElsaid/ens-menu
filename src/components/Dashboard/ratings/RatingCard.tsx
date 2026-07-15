"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  IoMailOutline,
  IoCallOutline,
  IoChatbubbleEllipsesOutline,
  IoPersonOutline,
} from "react-icons/io5";
import type { MenuRating } from "@/types/menuRating";
import RatingStars from "./RatingStars";

type RatingCardProps = {
  rating: MenuRating;
};

function formatDate(value: string, locale: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const starTone: Record<number, string> = {
  5: "from-emerald-500 to-emerald-600 shadow-emerald-500/25",
  4: "from-amber-400 to-amber-500 shadow-amber-500/25",
  3: "from-orange-400 to-orange-500 shadow-orange-500/25",
  2: "from-rose-400 to-rose-500 shadow-rose-500/25",
  1: "from-rose-500 to-rose-600 shadow-rose-500/25",
};

export default function RatingCard({ rating }: RatingCardProps) {
  const t = useTranslations("Ratings");
  const locale = useLocale();
  const name = rating.customerName?.trim() || t("anonymous");
  const comment = rating.comment?.trim();
  const phone = rating.customerPhone?.trim();
  const email = rating.customerEmail?.trim();
  const stars = Math.min(5, Math.max(1, Math.round(Number(rating.stars) || 0)));
  const tone = starTone[stars] ?? starTone[3];

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-300/60 hover:shadow-[0_10px_28px_rgba(245,158,11,0.12)] dark:border-slate-700/80 dark:bg-slate-800/95 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)] dark:hover:border-amber-700/45 dark:hover:shadow-[0_10px_28px_rgba(0,0,0,0.35)]">
      <div className="relative bg-linear-to-br from-amber-500/12 via-orange-50/80 to-yellow-50/50 px-4 pb-5 pt-4 dark:from-amber-500/15 dark:via-slate-900 dark:to-amber-950/35">
        <div className="absolute end-3 top-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full bg-linear-to-r px-2.5 py-1 text-xs font-bold text-white shadow-md ${tone}`}
          >
            {rating.stars}/5
          </span>
        </div>

        <div className="flex items-center gap-3 pe-16">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 ring-2 ring-white dark:text-amber-400 dark:ring-slate-800">
            <IoPersonOutline className="text-xl" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
              {name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {formatDate(rating.createdAt, locale)}
            </p>
          </div>
        </div>

        <div className="mt-3">
          <RatingStars stars={rating.stars} sizeClassName="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {comment ? (
          <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 dark:border-slate-700/70 dark:bg-slate-900/40">
            <p className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              <IoChatbubbleEllipsesOutline
                className="mt-0.5 shrink-0 text-amber-500/80"
                aria-hidden
              />
              <span className="whitespace-pre-wrap wrap-break-word">
                {comment}
              </span>
            </p>
          </div>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            {t("noComment")}
          </p>
        )}

        {(phone || email) && (
          <div className="mt-auto flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
            {phone ? (
              <a
                href={`tel:${phone}`}
                dir="ltr"
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-primary"
              >
                <IoCallOutline className="shrink-0 text-sm" aria-hidden />
                <span className="truncate">{phone}</span>
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-primary/30 hover:text-primary dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:text-primary"
              >
                <IoMailOutline className="shrink-0 text-sm" aria-hidden />
                <span className="truncate">{email}</span>
              </a>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
