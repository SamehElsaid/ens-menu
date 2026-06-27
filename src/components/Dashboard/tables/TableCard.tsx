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
  IoEllipseSharp,
  IoTrashOutline,
} from "react-icons/io5";

interface TableCardProps {
  table: MenuTable;
  menuSlug: string | undefined | null;
  qrCenterLogoSrc: string | null | undefined;
  locale: string;
  onEdit: (table: MenuTable) => void;
  onDelete: (table: MenuTable) => void;
}

const iconBtn =
  "inline-flex size-9 items-center justify-center rounded-xl border transition-colors active:scale-95 disabled:cursor-not-allowed disabled:opacity-40";

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
    <article className="dashboard-table-card group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_8px_rgba(15,23,42,0.06)] transition-shadow duration-200 hover:shadow-[0_4px_20px_rgba(124,58,237,0.08)] dark:border-slate-700/80 dark:bg-slate-800/95 dark:shadow-[0_1px_12px_rgba(0,0,0,0.25)] dark:hover:shadow-[0_4px_24px_rgba(124,58,237,0.12)]">
      <div className="flex flex-1 flex-col p-4 sm:p-4">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3
            className="min-w-0 truncate text-start text-base font-bold leading-tight text-slate-900 sm:text-[17px] dark:text-slate-50"
            dir={locale === "ar" ? "rtl" : "ltr"}
            title={table.tableNumber}
          >
            {t("tableCardTitle", { number: table.tableNumber })}
          </h3>
          <span
            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/25 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/25 dark:text-amber-300"
            }`}
          >
            <IoEllipseSharp
              className={`text-[5px] ${active ? "text-emerald-500" : "text-amber-500"}`}
              aria-hidden
            />
            {active ? t("active") : t("inactive")}
          </span>
        </div>

        <div className="mb-4 flex flex-1 flex-col items-center justify-center gap-1.5 py-1">
          {hasUrl ? (
            <>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-slate-200/90 bg-white p-2 shadow-sm ring-1 ring-slate-100 transition-all group-hover:border-primary/25 group-hover:ring-primary/10 dark:border-slate-600 dark:bg-slate-900 dark:ring-slate-700/80"
                title={t("qrOpensMenu")}
              >
                <StyledQrCode
                  value={url}
                  size={128}
                  displaySize={96}
                  centerLogoSrc={qrCenterLogoSrc}
                />
              </a>
              <p className="text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {t("qrForThisTable")}
              </p>
            </>
          ) : (
            <p className="px-2 text-center text-xs text-slate-500 dark:text-slate-400">
              {t("noMenuUrl")}
            </p>
          )}
        </div>

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-3 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => onEdit(table)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            <IoCreateOutline className="text-base" aria-hidden />
            {t("manageTable")}
          </button>

          <div className="flex items-center gap-1.5 justify-center">
            <button
              type="button"
              disabled={!hasUrl}
              onClick={downloadQr}
              title={t("downloadQr")}
              aria-label={t("downloadQr")}
              className={`${iconBtn} border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-primary/10`}
            >
              <IoDownloadOutline className="text-[17px]" />
            </button>
            <button
              type="button"
              disabled={!hasUrl}
              onClick={copyLink}
              title={t("copyMenuLink")}
              aria-label={t("copyMenuLink")}
              className={`${iconBtn} border-slate-200 bg-slate-50 text-slate-600 hover:border-primary/30 hover:bg-primary/5 hover:text-primary dark:border-slate-600 dark:bg-slate-700/50 dark:text-slate-200 dark:hover:bg-primary/10`}
            >
              <IoCopyOutline className="text-[17px]" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(table)}
              title={t("delete")}
              aria-label={t("delete")}
              className={`${iconBtn} border-red-200/80 bg-red-50 text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50`}
            >
              <IoTrashOutline className="text-[17px]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
