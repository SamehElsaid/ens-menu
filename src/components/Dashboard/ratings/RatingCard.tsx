"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  IoMailOutline,
  IoCallOutline,
  IoPersonOutline,
  IoChatbubbleEllipsesOutline,
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

export default function RatingCard({ rating }: RatingCardProps) {
  const t = useTranslations("Ratings");
  const locale = useLocale();
  const name = rating.customerName?.trim() || t("anonymous");
  const comment = rating.comment?.trim();
  const phone = rating.customerPhone?.trim();
  const email = rating.customerEmail?.trim();

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-amber-300/50 hover:shadow-xl dark:border-slate-700/80 dark:bg-slate-800/95 dark:hover:border-amber-700/40">
      <div className="bg-linear-to-br from-amber-500/10 via-orange-50/70 to-yellow-50/40 px-4 py-4 dark:from-amber-500/15 dark:via-slate-900 dark:to-amber-950/30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <IoPersonOutline className="text-lg" aria-hidden />
              </span>
              <div className="min-w-0">
                <h3 className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                  {name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatDate(rating.createdAt, locale)}
                </p>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-end">
            <RatingStars stars={rating.stars} sizeClassName="h-4 w-4" />
            <p className="mt-1 text-xs font-semibold tabular-nums text-slate-600 dark:text-slate-300">
              {rating.stars}/5
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 px-4 py-4">
        {comment ? (
          <p className="flex gap-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            <IoChatbubbleEllipsesOutline
              className="mt-0.5 shrink-0 text-slate-400"
              aria-hidden
            />
            <span className="whitespace-pre-wrap wrap-break-word">{comment}</span>
          </p>
        ) : (
          <p className="text-sm italic text-slate-400 dark:text-slate-500">
            {t("noComment")}
          </p>
        )}

        {(phone || email) && (
          <div className="mt-auto space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-700">
            {phone ? (
              <a
                href={`tel:${phone}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              >
                <IoCallOutline className="shrink-0" aria-hidden />
                <span className="truncate">{phone}</span>
              </a>
            ) : null}
            {email ? (
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary dark:text-slate-300"
              >
                <IoMailOutline className="shrink-0" aria-hidden />
                <span className="truncate">{email}</span>
              </a>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}
