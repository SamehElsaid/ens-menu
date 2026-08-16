"use client";

import { useCallback, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  FaBan,
  FaChartLine,
  FaEdit,
  FaExternalLinkAlt,
  FaEye,
  FaMousePointer,
  FaTrash,
} from "react-icons/fa";
import {
  IoAddOutline,
  IoLinkOutline,
  IoMegaphoneOutline,
} from "react-icons/io5";
import { FiAlertTriangle } from "react-icons/fi";
import LoadImage from "@/components/ImageLoad";
import AddAdvertisementModal from "@/components/Dashboard/AddAdvertisementModal";
import {
  Badge,
  Button,
  ConfirmDialog,
  DataTable,
  EmptyState,
  NoResultsState,
  PageHeader,
  PageShell,
  SearchInput,
  SegmentedControl,
  StatCard,
  StatGrid,
  Toolbar,
  type DataColumn,
} from "@/components/ui";
import { useDataTableLabels } from "@/hooks/useDataTableLabels";
import { useAdminAdvertisements } from "@/hooks/useAdminAdvertisements";
import { computeCtr } from "@/lib/fetchAdminAnalytics";
import { formatAppDate } from "@/lib/formatDateTime";
import type { AdminAdvertisement } from "@/types/Menu";
import { toSafeExternalUrl } from "@/lib/normalizeExternalUrl";

export type AdminAdvertisementsPageVariant = "overview" | "management";
type StatusFilter = "all" | "active" | "inactive";

interface Props {
  variant: AdminAdvertisementsPageVariant;
}

const PAGE_CONFIG = {
  overview: {
    tableId: "admin-advertisements",
    statColumns: 4 as const,
    eyebrow: true,
    searchable: false,
    inlineEditor: true,
  },
  management: {
    tableId: "admin-user-advertisements",
    statColumns: 3 as const,
    eyebrow: false,
    searchable: true,
    inlineEditor: false,
  },
} as const;

export default function AdminAdvertisementsDomainPage({ variant }: Props) {
  const config = PAGE_CONFIG[variant];
  const locale = useLocale();
  const t = useTranslations("adminAds");
  const tCommon = useTranslations("common");
  const tAdmin = useTranslations("adminDashboard");
  const router = useRouter();
  const tableLabels = useDataTableLabels();
  const isRTL = locale === "ar";
  const {
    advertisements: ads,
    statistics: stats,
    loading,
    refreshAdvertisements,
    loadingAdId,
    deleteAdvertisement,
    setAdvertisementActive,
  } = useAdminAdvertisements();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteModal, setDeleteModal] = useState<AdminAdvertisement | null>(
    null,
  );
  const [deactivateModal, setDeactivateModal] =
    useState<AdminAdvertisement | null>(null);
  const [editorAd, setEditorAd] = useState<AdminAdvertisement | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const getTitle = useCallback(
    (ad: AdminAdvertisement) =>
      isRTL && ad.titleAr ? ad.titleAr : ad.title || "",
    [isRTL],
  );
  const getContent = useCallback(
    (ad: AdminAdvertisement) =>
      isRTL && ad.contentAr ? ad.contentAr : ad.content || "",
    [isRTL],
  );

  const visibleAds = useMemo(() => {
    if (!config.searchable) return ads;
    const normalizedQuery = query.trim().toLowerCase();
    return ads.filter((ad) => {
      const active = ad.isActive ?? false;
      if (statusFilter === "active" && !active) return false;
      if (statusFilter === "inactive" && active) return false;
      return (
        !normalizedQuery ||
        getTitle(ad).toLowerCase().includes(normalizedQuery) ||
        getContent(ad).toLowerCase().includes(normalizedQuery)
      );
    });
  }, [ads, config.searchable, getContent, getTitle, query, statusFilter]);

  const openCreate = useCallback(() => {
    if (config.inlineEditor) {
      setEditorAd(null);
      setEditorOpen(true);
    } else {
      router.push("/admin/users/advertisements/new");
    }
  }, [config.inlineEditor, router]);

  const openEdit = useCallback(
    (ad: AdminAdvertisement) => {
      if (config.inlineEditor) {
        setEditorAd(ad);
        setEditorOpen(true);
      } else {
        router.push(`/admin/users/advertisements/${ad.id}`);
      }
    },
    [config.inlineEditor, router],
  );

  const columns = useMemo<DataColumn<AdminAdvertisement>[]>(() => {
    const shared: DataColumn<AdminAdvertisement>[] = [
      {
        id: "ad",
        header: t("advertisement"),
        primary: true,
        sortValue: getTitle,
        cell: (ad) => {
          const summary = getContent(ad)
            .split("\n")
            .map((line) => line.trim())
            .filter(Boolean)
            .join(" · ");
          return (
            <span className="flex min-w-0 items-start gap-2.5">
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line bg-surface-2 text-fg-subtle">
                {ad.imageUrl ? (
                  <LoadImage
                    src={ad.imageUrl}
                    alt=""
                    className="size-10 object-cover"
                    width={40}
                    height={40}
                    cover
                  />
                ) : (
                  <IoMegaphoneOutline aria-hidden />
                )}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-medium text-fg">
                  {getTitle(ad) || "—"}
                </span>
                {summary ? (
                  <span className="block truncate text-xs text-fg-muted">
                    {summary}
                  </span>
                ) : null}
              </span>
            </span>
          );
        },
      },
      {
        id: "status",
        header: config.searchable ? t("columns.status") : t("status.active"),
        cell: (ad) => (
          <Badge tone={ad.isActive ? "success" : "neutral"} dot>
            {ad.isActive ? t("status.active") : t("status.inactive")}
          </Badge>
        ),
      },
      {
        id: "views",
        header: t("views"),
        align: "end",
        numeric: true,
        sortValue: (ad) => ad.impressionCount || 0,
        cell: (ad) => (
          <span className="ui-figure text-[13px]" lang="en">
            {(ad.impressionCount || 0).toLocaleString("en-US")}
          </span>
        ),
      },
      {
        id: "clicks",
        header: t("clicks"),
        align: "end",
        numeric: true,
        sortValue: (ad) => ad.clickCount || 0,
        cell: (ad) => (
          <span className="ui-figure text-[13px]" lang="en">
            {(ad.clickCount || 0).toLocaleString("en-US")}
          </span>
        ),
      },
    ];
    if (variant === "overview") {
      shared.push(
        {
          id: "ctr",
          header: t("ctr"),
          align: "end",
          numeric: true,
          cell: (ad) => (
            <span className="ui-figure text-fg" lang="en">
              {computeCtr(ad.clickCount || 0, ad.impressionCount || 0)}%
            </span>
          ),
        },
        {
          id: "createdAt",
          header: t("createdAt"),
          hideOnMobile: true,
          cell: (ad) => (
            <span className="whitespace-nowrap text-xs text-fg-muted">
              {formatAppDate(ad.createdAt, locale, "")}
            </span>
          ),
        },
      );
    } else {
      shared.push({
        id: "link",
        header: t("hasLink"),
        hideOnMobile: true,
        cell: (ad) => {
          const safeLink = ad.linkUrl
            ? toSafeExternalUrl(ad.linkUrl)
            : null;
          return safeLink ? (
            <a
              href={safeLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex max-w-40 items-center gap-1 truncate font-mono text-[12px] text-brand hover:underline"
              dir="ltr"
            >
              <FaExternalLinkAlt className="size-2.5 shrink-0" />
              <span className="truncate">{ad.linkUrl}</span>
            </a>
          ) : (
            <span className="text-fg-subtle">—</span>
          );
        },
      });
    }
    const columnOrder =
      variant === "overview"
        ? ["ad", "status", "clicks", "views", "ctr", "createdAt"]
        : ["ad", "status", "views", "clicks", "link"];
    return columnOrder.flatMap((id) => {
      const column = shared.find((candidate) => candidate.id === id);
      return column ? [column] : [];
    });
  }, [config.searchable, getContent, getTitle, locale, t, variant]);

  const totalImpressions =
    stats.totalImpressions ||
    ads.reduce((sum, ad) => sum + (ad.impressionCount || 0), 0);
  const filtered = query.trim().length > 0 || statusFilter !== "all";

  return (
    <PageShell
      kind="table"
      header={
        <>
          <PageHeader
            eyebrow={config.eyebrow ? t("eyebrow") : undefined}
            title={t("title")}
            description={t("subtitle")}
            breadcrumbs={[
              { label: tAdmin("title"), href: "/admin" },
              { label: t("title") },
            ]}
            breadcrumbsLabel={tCommon("breadcrumb")}
            meta={
              variant === "overview" && !loading ? (
                <Badge>
                  <span lang="en">{ads.length}</span>{" "}
                  {ads.length === 1 ? t("advertisement") : t("advertisements")}
                </Badge>
              ) : undefined
            }
            actions={
              <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                {t("addNewAd")}
              </Button>
            }
          />
          <StatGrid columns={config.statColumns} ruled>
            <StatCard
              label={t("totalAds")}
              value={<span lang="en">{stats.total.toLocaleString("en-US")}</span>}
              icon={variant === "overview" ? <IoMegaphoneOutline /> : undefined}
              loading={loading}
            />
            <StatCard
              label={t("activeAds")}
              value={
                <span lang="en">{stats.totalActive.toLocaleString("en-US")}</span>
              }
              icon={variant === "overview" ? <FaChartLine /> : undefined}
              loading={loading}
            />
            <StatCard
              label={t("totalClicks")}
              value={
                <span lang="en">{stats.totalClicks.toLocaleString("en-US")}</span>
              }
              icon={variant === "overview" ? <FaMousePointer /> : undefined}
              loading={loading}
            />
            {variant === "overview" ? (
              <StatCard
                label={t("averageCtr")}
                value={
                  <span lang="en">
                    {computeCtr(stats.totalClicks, totalImpressions)}%
                  </span>
                }
                icon={<FaEye />}
                loading={loading}
              />
            ) : null}
          </StatGrid>
        </>
      }
      toolbar={
        config.searchable ? (
          <Toolbar
            search={
              <SearchInput
                value={query}
                onChange={setQuery}
                placeholder={tCommon("search")}
                label={tCommon("search")}
                clearLabel={tCommon("clearSearch")}
              />
            }
            filters={
              <SegmentedControl<StatusFilter>
                label={t("columns.status")}
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: t("filterAll"), count: ads.length },
                  {
                    value: "active",
                    label: t("status.active"),
                    count: ads.filter((ad) => ad.isActive).length,
                  },
                  {
                    value: "inactive",
                    label: t("status.inactive"),
                    count: ads.filter((ad) => !ad.isActive).length,
                  },
                ]}
              />
            }
          />
        ) : undefined
      }
    >
      <DataTable<AdminAdvertisement>
        columns={columns}
        rows={visibleAds}
        getRowKey={(ad) => String(ad.id)}
        caption={t("title")}
        loading={loading}
        tableId={config.tableId}
        stickyHeader
        densityControl
        columnControl={config.searchable}
        labels={tableLabels}
        empty={
          config.searchable && filtered ? (
            <NoResultsState
              title={tCommon("noResultsTitle")}
              description={tCommon("noResultsDescription")}
              onClear={() => {
                setQuery("");
                setStatusFilter("all");
              }}
              clearLabel={tCommon("clearFilters")}
            />
          ) : (
            <EmptyState
              icon={<IoMegaphoneOutline />}
              title={t("noAdsTitle")}
              description={t("noAdsDescription")}
              action={
                <Button startIcon={<IoAddOutline />} onClick={openCreate}>
                  {t("addNewAd")}
                </Button>
              }
            />
          )
        }
        rowActions={(ad) => {
          const rowLoading = loadingAdId === ad.id;
          const safeLink = ad.linkUrl
            ? toSafeExternalUrl(ad.linkUrl)
            : null;
          return (
            <span className="flex items-center justify-end gap-1">
              <Button
                variant={variant === "overview" ? "secondary" : "ghost"}
                size="sm"
                iconOnly
                aria-label={t("actions.edit")}
                title={t("actions.edit")}
                disabled={rowLoading}
                onClick={() => openEdit(ad)}
              >
                <FaEdit />
              </Button>
              {ad.isActive ? (
                <Button
                  variant={variant === "overview" ? "secondary" : "ghost"}
                  size="sm"
                  iconOnly
                  aria-label={t("actions.deactivate")}
                  title={t("actions.deactivate")}
                  disabled={rowLoading}
                  onClick={() => setDeactivateModal(ad)}
                >
                  <FaBan />
                </Button>
              ) : (
                <Button
                  variant={variant === "overview" ? "secondary" : "ghost"}
                  size="sm"
                  iconOnly
                  aria-label={t("actions.activate")}
                  title={t("actions.activate")}
                  loading={rowLoading}
                  onClick={() => void setAdvertisementActive(ad.id, true)}
                >
                  <FaEye />
                </Button>
              )}
              {variant === "overview" && safeLink ? (
                <Button
                  variant="ghost"
                  size="sm"
                  iconOnly
                  aria-label={t("actions.viewLink")}
                  title={t("actions.viewLink")}
                  disabled={rowLoading}
                  onClick={() =>
                    window.open(safeLink, "_blank", "noopener,noreferrer")
                  }
                >
                  <IoLinkOutline />
                </Button>
              ) : null}
              <Button
                variant="dangerGhost"
                size="sm"
                iconOnly
                aria-label={t("actions.delete")}
                title={t("actions.delete")}
                disabled={rowLoading}
                onClick={() => setDeleteModal(ad)}
              >
                <FaTrash />
              </Button>
            </span>
          );
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteModal)}
        onClose={() => setDeleteModal(null)}
        onConfirm={async () => {
          if (!deleteModal) return;
          await deleteAdvertisement(deleteModal.id, () => setDeleteModal(null));
        }}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirm", {
          title: deleteModal ? getTitle(deleteModal) : "",
        })}
        confirmLabel={t("actions.delete")}
        cancelLabel={t("actions.cancel")}
        loading={loadingAdId === deleteModal?.id}
        tone="danger"
        icon={<FiAlertTriangle />}
      />
      <ConfirmDialog
        open={Boolean(deactivateModal)}
        onClose={() => setDeactivateModal(null)}
        onConfirm={async () => {
          if (!deactivateModal) return;
          await setAdvertisementActive(deactivateModal.id, false, () =>
            setDeactivateModal(null),
          );
        }}
        title={t("deactivateConfirmTitle")}
        description={t("deactivateConfirm", {
          title: deactivateModal ? getTitle(deactivateModal) : "",
        })}
        confirmLabel={t("actions.deactivate")}
        cancelLabel={t("actions.cancel")}
        loading={loadingAdId === deactivateModal?.id}
        tone="brand"
        icon={<FiAlertTriangle />}
      />
      {config.inlineEditor && editorOpen ? (
        <AddAdvertisementModal
          adminMode
          ad={editorAd}
          onClose={() => {
            setEditorOpen(false);
            setEditorAd(null);
          }}
          onRefresh={refreshAdvertisements}
        />
      ) : null}
    </PageShell>
  );
}
