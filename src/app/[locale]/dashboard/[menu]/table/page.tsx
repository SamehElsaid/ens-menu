"use client";

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type MouseEvent,
} from "react";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { axiosGet } from "@/shared/axiosCall";
import AddTableModal from "@/components/Dashboard/AddTableModal";
import DeleteTableConfirm from "@/components/Dashboard/DeleteTableConfirm";
import DataTable from "@/components/Custom/DataTable";
import LinkTo from "@/components/Global/LinkTo";
import { MenuTable } from "@/types/Menu";
import { useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import {
  IoAddCircleOutline,
  IoCopyOutline,
  IoDownloadOutline,
  IoEllipseSharp,
  IoCreateOutline,
  IoTrashOutline,
} from "react-icons/io5";

function buildPublicMenuBaseUrl(slug: string | undefined | null): string {
  if (!slug) return "";
  return `https://${slug}${process.env.NEXT_PUBLIC_MENU_URL || ""}`.replace(
    /^https:\/\//,
    "https://",
  );
}

function tablePublicMenuUrl(
  slug: string | undefined | null,
  tableNumber: string,
): string {
  const base = buildPublicMenuBaseUrl(slug);
  if (!base) return "";
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}table=${encodeURIComponent(tableNumber)}`;
}

function safeTableFilenameSegment(tableNumber: string): string {
  return String(tableNumber)
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 80) || "table";
}

async function downloadQrImageFile(qrSrc: string, filename: string) {
  try {
    const res = await fetch(qrSrc, { mode: "cors" });
    if (!res.ok) throw new Error("fetch failed");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  } catch {
    const link = document.createElement("a");
    link.href = qrSrc;
    link.download = filename;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export default function TablesPage() {
  const t = useTranslations("Tables");
  const locale = useLocale();
  const params = useParams();
  const menuSlug = useAppSelector((s) => s.menuData.menu?.slug);
  const menuId =
    typeof params.menu === "string"
      ? params.menu
      : ((params.menu as string[])?.[0] ?? "");

  const [tables, setTables] = useState<MenuTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTable, setEditingTable] = useState<MenuTable | null>(null);
  const [deletingTable, setDeletingTable] = useState<MenuTable | null>(null);
  const [refreshing, setRefreshing] = useState(0);

  const fetchTables = useCallback(async () => {
    if (!menuId) return;
    try {
      setLoading(true);
      const result = await axiosGet<MenuTable[] | { tables: MenuTable[] }>(
        `/menus/${menuId}/tables`,
        locale,
      );
      if (result.status && result.data) {
        const raw = result.data as { tables?: MenuTable[] };
        const list = Array.isArray(result.data)
          ? result.data
          : (raw?.tables ?? []);
        setTables(list);
      } else {
        setTables([]);
      }
    } finally {
      setLoading(false);
    }
  }, [menuId, locale]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables, refreshing]);

  const handleEdit = useCallback((row: MenuTable) => {
    setEditingTable(row);
  }, []);

  const handleDelete = useCallback((row: MenuTable) => {
    setDeletingTable(row);
  }, []);

  const refreshList = useCallback(() => {
    setRefreshing((r) => r + 1);
  }, []);

  const closeAddModal = useCallback(() => {
    setShowAddModal(false);
    setEditingTable(null);
  }, []);

  const columnDefs = useMemo<ColDef<MenuTable>[]>(
    () => [
      {
        headerName: t("tableNumber"),
        field: "tableNumber",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<MenuTable>) => (
          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {params.data?.tableNumber ?? "—"}
          </h3>
        ),
      },
      {
        headerName: t("seats"),
        field: "seats",
        width: 100,
        valueFormatter: (p) =>
          p.value != null && p.value > 0 ? String(p.value) : "—",
      },
      {
        headerName: t("status"),
        field: "isActive",
        width: 120,
        cellRenderer: (params: ICellRendererParams<MenuTable>) => {
          const row = params.data;
          if (!row) return null;
          const active = row.isActive;
          return (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                active
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
              }`}
            >
              <IoEllipseSharp
                className={`text-[8px] ${active ? "text-green-500 dark:text-green-400" : "text-amber-500 dark:text-amber-400"}`}
              />
              {active ? t("active") : t("inactive")}
            </span>
          );
        },
      },
      {
        headerName: t("qrCode"),
        field: "tableNumber",
        width: 172,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<MenuTable>) => {
          const row = params.data;
          if (!row?.tableNumber) return null;
          const url = tablePublicMenuUrl(menuSlug, row.tableNumber);
          if (!url) {
            return (
              <span
                className="text-xs text-slate-500 dark:text-slate-400 leading-snug max-w-36"
                title={t("noMenuUrl")}
              >
                —
              </span>
            );
          }
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(url)}`;
          const copy = () => {
            void navigator.clipboard.writeText(url).then(() => {
              toast.success(t("linkCopied"));
            });
          };
          const download = (e: MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            const name = `table-${safeTableFilenameSegment(row.tableNumber)}-qr.png`;
            void downloadQrImageFile(qrSrc, name).then(() => {
              toast.success(t("qrDownloaded"));
            });
          };
          return (
            <div className="flex items-center gap-2 py-1">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-slate-200 dark:border-slate-600 overflow-hidden bg-white"
                title={t("qrOpensMenu")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- external QR API */}
                <img
                  src={qrSrc}
                  alt={t("qrCode")}
                  width={64}
                  height={64}
                  className="block w-16 h-16"
                />
              </a>
              <div className="flex flex-col gap-1 shrink-0">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    copy();
                  }}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30"
                  title={t("copyMenuLink")}
                  aria-label={t("copyMenuLink")}
                >
                  <IoCopyOutline className="text-lg" />
                </button>
                <button
                  type="button"
                  onClick={download}
                  className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30"
                  title={t("downloadQrImage")}
                  aria-label={t("downloadQrImage")}
                >
                  <IoDownloadOutline className="text-lg" />
                </button>
              </div>
            </div>
          );
        },
      },
      {
        headerName: t("action"),
        width: 120,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<MenuTable>) => {
          const row = params.data;
          if (!row) return null;
          return (
            <div className="flex items-center gap-2 h-full">
              <button
                type="button"
                title={t("edit")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(row);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 hover:text-primary transition-colors"
              >
                <IoCreateOutline className="text-lg" />
              </button>
              <button
                type="button"
                title={t("delete")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(row);
                }}
                className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-300 transition-colors"
              >
                <IoTrashOutline className="text-lg" />
              </button>
            </div>
          );
        },
      },
    ],
    [t, handleEdit, handleDelete, menuSlug],
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            {t("title")}
          </h1>
          <p className="text-slate-500 mt-1 dark:text-slate-400">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LinkTo
            href={`/dashboard/${menuId}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-primary/30 dark:hover:border-primary/50 text-sm font-medium transition-all"
          >
            {locale === "ar" ? "الرجوع للصفحة الرئيسية" : "Back to main page"}
          </LinkTo>
          <button
            type="button"
            onClick={() => {
              setEditingTable(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold shadow-lg hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <IoAddCircleOutline className="text-xl" />
            {t("addTable")}
          </button>
        </div>
      </div>

      <DataTable<MenuTable>
        rowData={tables}
        columnDefs={columnDefs}
        loading={loading}
        locale={locale}
        showRowNumbers={true}
        pagination={true}
        paginationPageSize={10}
      />

      {(showAddModal || editingTable) && menuId && (
        <AddTableModal
          menuId={menuId}
          table={editingTable}
          onClose={closeAddModal}
          onRefresh={refreshList}
        />
      )}

      {deletingTable && menuId && (
        <DeleteTableConfirm
          menuId={menuId}
          table={deletingTable}
          displayLabel={deletingTable.tableNumber}
          onClose={() => setDeletingTable(null)}
          onDeleted={refreshList}
        />
      )}
      <div className="pb-10" />
    </>
  );
}
