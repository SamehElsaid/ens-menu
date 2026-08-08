"use client";

import { type MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  StyledQrCode,
  downloadStyledQrPng,
} from "@/components/Global/StyledQrCode";
import { MenuTable } from "@/types/Menu";
import {
  safeTableFilenameSegment,
  tablePublicMenuUrl,
} from "@/lib/tableQrUtils";
import {
  IoCopyOutline,
  IoCreateOutline,
  IoDownloadOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { Badge, Button, Card } from "@/components/ui";

interface TableCardProps {
  table: MenuTable;
  menuSlug: string | undefined | null;
  qrCenterLogoSrc: string | null | undefined;
  locale: string;
  onEdit: (table: MenuTable) => void;
  onDelete: (table: MenuTable) => void;
}

export default function TableCard({
  table,
  menuSlug,
  qrCenterLogoSrc,
  locale,
  onEdit,
  onDelete,
}: TableCardProps) {
  const t = useTranslations("Tables");
  const active = table.isActive;
  const url = tablePublicMenuUrl(menuSlug, table.tableNumber);
  const hasUrl = Boolean(url);

  const copyLink = () => {
    if (!url) return;
    void navigator.clipboard.writeText(url).then(() => {
      toast.success(t("linkCopied"));
    });
  };

  const downloadQr = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!url) return;
    const name = `table-${safeTableFilenameSegment(table.tableNumber)}-qr.png`;
    void downloadStyledQrPng({
      value: url,
      filename: name,
      size: 640,
      centerLogoSrc: qrCenterLogoSrc,
    }).then(() => {
      toast.success(t("qrDownloaded"));
    });
  };

  return (
    <Card
      as="article"
      interactive
      className="dashboard-table-card flex h-full flex-col"
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          className="min-w-0 truncate text-start text-sm font-semibold text-fg"
          dir={locale === "ar" ? "rtl" : "ltr"}
          title={table.tableNumber}
        >
          {t("tableCardTitle", { number: table.tableNumber })}
        </h3>
        <Badge tone={active ? "success" : "warning"} dot>
          {active ? t("active") : t("inactive")}
        </Badge>
      </div>

      <div className="my-4 flex flex-1 flex-col items-center justify-center gap-2">
        {hasUrl ? (
          <>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line bg-surface p-2 transition-colors hover:border-brand-line"
              title={t("qrOpensMenu")}
            >
              <StyledQrCode
                value={url}
                size={128}
                displaySize={96}
                centerLogoSrc={qrCenterLogoSrc}
              />
            </a>
            <p className="text-center text-[13px] text-fg-muted">
              {t("qrForThisTable")}
            </p>
          </>
        ) : (
          <p className="px-2 text-center text-[13px] text-fg-muted">
            {t("noMenuUrl")}
          </p>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-line pt-3">
        <Button
          size="sm"
          fullWidth
          onClick={() => onEdit(table)}
          startIcon={<IoCreateOutline />}
        >
          {t("manageTable")}
        </Button>

        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            disabled={!hasUrl}
            onClick={downloadQr}
            title={t("downloadQr")}
            aria-label={t("downloadQr")}
          >
            <IoDownloadOutline className="size-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            iconOnly
            disabled={!hasUrl}
            onClick={copyLink}
            title={t("copyMenuLink")}
            aria-label={t("copyMenuLink")}
          >
            <IoCopyOutline className="size-4" />
          </Button>
          <Button
            variant="dangerGhost"
            size="sm"
            iconOnly
            onClick={() => onDelete(table)}
            title={t("delete")}
            aria-label={t("delete")}
          >
            <IoTrashOutline className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
