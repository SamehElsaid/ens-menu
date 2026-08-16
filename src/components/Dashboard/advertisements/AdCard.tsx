"use client";

import { useTranslations } from "next-intl";
import LoadImage from "@/components/ImageLoad";
import { Advertisement } from "@/types/Menu";
import { adRowMetrics } from "@/lib/adMetrics";
import { toSafeExternalUrl } from "@/lib/normalizeExternalUrl";
import { Badge, Button, Card } from "@/components/ui";
import {
  IoCreateOutline,
  IoImageOutline,
  IoLinkOutline,
  IoPauseOutline,
  IoPlayOutline,
  IoTrashOutline,
} from "react-icons/io5";

interface AdCardProps {
  ad: Advertisement;
  locale: string;
  title: string;
  contentPreview?: string;
  togglingId?: number | null;
  onEdit: (ad: Advertisement) => void;
  onDelete: (ad: Advertisement) => void;
  onToggleActive?: (ad: Advertisement) => void;
}

/**
 * One campaign.
 *
 * Live is the state that matters here, so it is the only thing spending the
 * brand accent: an active ad carries the inline brand edge and a solid badge
 * with a status dot, a paused one is plain. The three figures used to sit in
 * three tinted boxes, which made a paused ad with no impressions look as busy
 * as a running one; they are now a plain figure row, and the actions live
 * behind a divider so the card has a body and a footer rather than one
 * undifferentiated block.
 */
export default function AdCard({
  ad,
  locale,
  title,
  contentPreview,
  togglingId = null,
  onEdit,
  onDelete,
  onToggleActive,
}: AdCardProps) {
  const t = useTranslations("Advertisements.page");
  const isRTL = locale === "ar";
  const metrics = adRowMetrics(ad);
  const isActive = Boolean(ad.isActive);
  const isToggling = togglingId != null && togglingId === ad.id;
  const imageSrc = ad.imageUrl ?? (ad as { image?: string }).image ?? "";
  const link = ad.linkUrl ? (toSafeExternalUrl(ad.linkUrl) ?? undefined) : undefined;

  const figures = [
    {
      id: "impressions",
      label: t("columns.impressions"),
      value: metrics.impressionCount.toLocaleString("en-US"),
    },
    {
      id: "clicks",
      label: t("columns.clicks"),
      value: metrics.clickCount.toLocaleString("en-US"),
    },
    { id: "ctr", label: t("columns.ctr"), value: `${metrics.ctr}%` },
  ];

  return (
    <Card
      as="article"
      padded="none"
      active={isActive}
      className="flex h-full flex-col overflow-hidden"
    >
      <div className="dashboard-card-media relative aspect-video overflow-hidden border-b border-line bg-surface-3">
        {imageSrc ? (
          <div className="absolute inset-0">
            <LoadImage
              src={imageSrc}
              alt={title}
              width={800}
              height={450}
              cover
              className="h-full w-full object-cover"
              wrapperClassName="dashboard-card-media__fill"
            />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1.5 text-fg-subtle">
            <IoImageOutline className="size-7" aria-hidden />
            <span className="ui-label">{t("columns.image")}</span>
          </div>
        )}
        <span className="absolute start-2 top-2">
          <Badge tone={isActive ? "accent" : "neutral"} variant="solid" dot>
            {isActive ? t("active") : t("paused")}
          </Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3
          className="truncate text-[13px] font-semibold text-fg"
          dir={isRTL ? "rtl" : "ltr"}
          title={title}
        >
          {title || "—"}
        </h3>
        {contentPreview && contentPreview !== "—" ? (
          <p
            className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {contentPreview}
          </p>
        ) : null}
        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex max-w-full items-center gap-1 text-[11px] text-brand hover:underline"
            dir="ltr"
            title={link}
          >
            <IoLinkOutline className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{link}</span>
          </a>
        ) : null}

        <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-line bg-line">
          {figures.map((figure) => (
            <div key={figure.id} className="bg-surface px-2 py-1.5">
              <dt className="ui-label truncate text-fg-subtle">
                {figure.label}
              </dt>
              <dd className="ui-figure mt-0.5 text-[15px] text-fg" lang="en">
                {figure.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Not `CardFooter`: that primitive cancels the padding of a padded card,
          and this card is unpadded so its media can bleed to the rule. */}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-line bg-surface-2/40 px-3 py-2">
        {onToggleActive ? (
          <Button
            variant={isActive ? "secondary" : "primary"}
            size="sm"
            onClick={() => onToggleActive(ad)}
            loading={isToggling}
            startIcon={
              isActive ? (
                <IoPauseOutline aria-hidden />
              ) : (
                <IoPlayOutline aria-hidden />
              )
            }
          >
            {isActive ? t("pause") : t("activate")}
          </Button>
        ) : null}
        <span className="ms-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            iconOnly
            aria-label={t("edit")}
            title={t("edit")}
            onClick={() => onEdit(ad)}
          >
            <IoCreateOutline aria-hidden />
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            aria-label={t("delete")}
            title={t("delete")}
            onClick={() => onDelete(ad)}
          >
            <IoTrashOutline aria-hidden />
          </Button>
        </span>
      </div>
    </Card>
  );
}
