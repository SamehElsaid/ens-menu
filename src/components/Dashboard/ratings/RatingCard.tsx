"use client";

import { useLocale, useTranslations } from "next-intl";
import { IoMailOutline, IoCallOutline } from "react-icons/io5";
import type { MenuRating } from "@/types/menuRating";
import { Card, CardFooter } from "@/components/ui";
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

/**
 * Score → edge colour.
 *
 * The score is printed as a figure on every card, so this is a second reading
 * of the same fact rather than the only one, and it is spent on a 2px inline
 * edge instead of a tinted header: a column of twenty cards can be triaged by
 * running down the left margin, and nothing competes with the comment text.
 */
const scoreEdge: Record<number, string> = {
  5: "before:bg-success",
  4: "before:bg-success",
  3: "before:bg-warning",
  2: "before:bg-danger",
  1: "before:bg-danger",
};

/**
 * One review.
 *
 * The previous card gave a gradient header, a ring-shadowed avatar and a
 * gradient pill more visual weight than the customer's actual words. Here the
 * comment is the content and gets the largest type; the score, name and date
 * are the ticket header above it, and contact details sit in the footer where
 * they read as actions rather than as more metadata.
 */
export default function RatingCard({ rating }: RatingCardProps) {
  const t = useTranslations("Ratings");
  const locale = useLocale();
  const name = rating.customerName?.trim() || t("anonymous");
  const comment = rating.comment?.trim();
  const phone = rating.customerPhone?.trim();
  const email = rating.customerEmail?.trim();
  const stars = Math.min(5, Math.max(1, Math.round(Number(rating.stars) || 0)));

  return (
    <Card
      as="article"
      padded="md"
      className={`flex h-full flex-col before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:rounded-s-xl before:content-[''] ${scoreEdge[stars] ?? scoreEdge[3]}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[13px] font-semibold text-fg">{name}</h3>
          <p className="ui-label mt-1 text-fg-subtle">
            {formatDate(rating.createdAt, locale)}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="ui-figure text-[15px] leading-none text-fg" lang="en">
            {stars}
            <span className="text-fg-subtle">/5</span>
          </p>
          <RatingStars stars={rating.stars} sizeClassName="h-3 w-3" />
        </div>
      </header>

      {comment ? (
        <blockquote className="mt-3 text-[13px] leading-relaxed whitespace-pre-wrap wrap-break-word text-fg">
          {comment}
        </blockquote>
      ) : (
        <p className="mt-3 text-[13px] text-fg-subtle">{t("noComment")}</p>
      )}

      {phone || email ? (
        <CardFooter className="mt-auto flex-wrap gap-x-3 gap-y-1">
          {phone ? (
            <a
              href={`tel:${phone}`}
              dir="ltr"
              className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-fg-muted transition-colors hover:text-brand"
            >
              <IoCallOutline className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{phone}</span>
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              dir="ltr"
              className="inline-flex min-w-0 items-center gap-1.5 text-[11px] text-fg-muted transition-colors hover:text-brand"
            >
              <IoMailOutline className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{email}</span>
            </a>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  );
}
