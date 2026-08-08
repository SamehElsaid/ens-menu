"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import LinkTo from "@/components/Global/LinkTo";
import {
  IoSearchOutline,
  IoCloseOutline,
  IoLibraryOutline,
  IoDocumentTextOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoArrowBack,
} from "react-icons/io5";
import { FaSpinner } from "react-icons/fa";
import { axiosGet } from "@/shared/axiosCall";
import ViewTime from "@/shared/ViewTime";
import ShowEditor from "@/components/Custom/ShowEditor";
import {
  PAGE_LIMIT,
  type ArticleDetail,
  type ArticleListItem,
  type KbPagination as Pagination,
} from "./fetchKb";

/* ─────────────────────── types ─────────────────────── */

interface ListResponse {
  success: boolean;
  data: ArticleListItem[];
  pagination: Pagination;
}

interface DetailResponse {
  success: boolean;
  data: ArticleDetail;
}

export { PAGE_LIMIT };

/** Converts a title + id into a URL-friendly slug, e.g. "Default Template-68" → "default-template-68" */
function toSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, "-") // replace Arabic chars & spaces with dash
    .replace(/[^a-z0-9-]/g, "") // remove any remaining non-URL chars
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
  return base ? `${base}-${id}` : `${id}`;
}

/* ─────────────────────── inner component ───────────── */

function KnowledgeBaseInner({
  initialId,
  initialArticle,
  initialArticles,
  initialPagination,
}: {
  initialId?: number;
  /** SSR-fetched article for `initialId`, so the raw HTML already contains the real body. */
  initialArticle?: ArticleDetail | null;
  /** SSR-fetched first page of the list, so the sidebar isn't empty in the raw HTML. */
  initialArticles?: ArticleListItem[];
  initialPagination?: Pagination;
}) {
  const locale = useLocale();
  const t = useTranslations("knowledgeBase");
  const isRTL = locale === "ar";
  const router = useRouter();

  /* sidebar state */
  const [articles, setArticles] = useState<ArticleListItem[]>(
    initialArticles ?? [],
  );
  const [pagination, setPagination] = useState<Pagination>(
    initialPagination ?? {
      total: 0,
      page: 1,
      limit: PAGE_LIMIT,
      totalPages: 1,
    },
  );
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const [listLoading, setListLoading] = useState(!initialArticles);

  /* article detail state */
  const [selectedId, setSelectedId] = useState<number | null>(
    initialId ?? null,
  );
  const [article, setArticle] = useState<ArticleDetail | null>(
    initialArticle ?? null,
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const firstLoad = useRef(true);
  const skipInitialListFetch = useRef(Boolean(initialArticles));
  const skipInitialDetailFetch = useRef(Boolean(initialArticle));

  /* ── debounce search → reset page ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setSidebarPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── fetch list (server-side search + pagination) ── */
  const fetchList = useCallback(
    async (page: number, keyword: string) => {
      setListLoading(true);
      try {
        const params: Record<string, unknown> = { page, limit: PAGE_LIMIT };
        if (keyword.trim()) params.search = keyword.trim();

        const res = await axiosGet<ListResponse>(
          "/searchInformation",
          locale,
          undefined,
          params,
        );

        if (res.status && res.data) {
          const list = res.data.data ?? [];
          setArticles(list);
          if (res.data.pagination) setPagination(res.data.pagination);

          /* auto-select first article on very first load if no URL id */
          if (firstLoad.current && list.length > 0 && !initialId) {
            firstLoad.current = false;
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            if (isDesktop) {
              const first = list[0];
              setSelectedId(first.id);
              router.replace(
                `/knowledge-base/${toSlug(first.titleEn, first.id)}`,
              );
            }
          } else {
            firstLoad.current = false;
          }
        }
      } catch {
        /* silent */
      } finally {
        setListLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  useEffect(() => {
    if (skipInitialListFetch.current) {
      skipInitialListFetch.current = false;
      return;
    }
    fetchList(sidebarPage, debouncedSearch);
  }, [fetchList, sidebarPage, debouncedSearch]);

  /* ── sync initialId → selectedId when navigating between articles ── */
  useEffect(() => {
    setSelectedId(initialId ?? null);
    if (initialId && initialArticle && initialArticle.id === initialId) {
      setArticle(initialArticle);
      skipInitialDetailFetch.current = true;
    }
  }, [initialId, initialArticle]);

  /* ── fetch article detail by ID ── */
  const fetchDetail = useCallback(
    async (id: number) => {
      setDetailLoading(true);
      setArticle(null);
      try {
        const res = await axiosGet<DetailResponse>(
          `/searchInformation/${id}`,
          locale,
        );
        if (res.status && res.data?.data) setArticle(res.data.data);
      } catch {
        /* silent */
      } finally {
        setDetailLoading(false);
      }
    },
    [locale],
  );

  useEffect(() => {
    if (selectedId === null) return;
    if (skipInitialDetailFetch.current) {
      skipInitialDetailFetch.current = false;
      return;
    }
    fetchDetail(selectedId);
  }, [fetchDetail, selectedId]);

  const handleMobileBack = () => {
    setSelectedId(null);
    setArticle(null);
    router.replace("/knowledge-base");
  };

  const showingDetailOnMobile = selectedId !== null;

  const getTitle = useCallback(
    (item: { titleAr: string; titleEn: string }) =>
      isRTL && item.titleAr ? item.titleAr : item.titleEn,
    [isRTL],
  );

  const getDescription = (item: ArticleDetail) =>
    isRTL && item.descriptionAr ? item.descriptionAr : item.descriptionEn;

  /* ─────────────────────── render ────────────────────── */
  /**
   * Docs layout: a persistent index rail beside one article. Every behaviour
   * here — server-side search, pagination, the SSR'd first article, the
   * mobile list/detail swap — is unchanged from before the redesign; only the
   * surface is, and it is drawn entirely in the public token layer.
   */
  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="flex flex-1 flex-col md:flex-row"
    >
      {/* ══════════════════════ SIDEBAR ══════════════════════ */}
      <aside
        className={`flex w-full shrink-0 flex-col border-b border-site-line bg-site-tint md:sticky md:top-(--s-header-h) md:h-[calc(100dvh-var(--s-header-h))] md:w-80 md:border-e md:border-b-0 ${
          showingDetailOnMobile ? "hidden md:flex" : "flex"
        }`}
      >
        {/* ── Header ── */}
        <div className="shrink-0 border-b border-site-line px-5 pt-6 pb-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 text-site-xs font-semibold tracking-[0.08em] text-site-brand uppercase">
              <IoLibraryOutline className="size-4" aria-hidden />
              {t("sectionLabel")}
            </p>
            {!listLoading && (
              <span className="text-site-xs text-site-muted tabular-nums">
                {pagination.total}
              </span>
            )}
          </div>

          {/* search input */}
          <div className="relative">
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-site-muted">
              {listLoading ? (
                <FaSpinner className="size-4 animate-spin" aria-hidden />
              ) : (
                <IoSearchOutline className="size-4" aria-hidden />
              )}
            </span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="h-11 w-full rounded-site-control border border-site-line bg-site-bg ps-10 pe-9 text-site-sm text-site-ink transition-[border-color,box-shadow] duration-150 placeholder:text-site-muted focus:border-site-brand focus:ring-2 focus:ring-site-brand/18 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={t("noResults")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-site-muted transition-colors hover:text-site-ink"
              >
                <IoCloseOutline size={16} aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable list ── */}
        <nav className="max-h-[26rem] flex-1 overflow-y-auto p-3 md:max-h-none">
          {listLoading ? (
            <div className="space-y-1.5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-site-sm bg-site-line"
                  style={{ opacity: 1 - i * 0.09 }}
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
              <IoSearchOutline
                className="mb-3 size-7 text-site-muted"
                aria-hidden
              />
              <p className="text-site-sm text-site-muted">{t("noResults")}</p>
            </div>
          ) : (
            <ul className="space-y-0.5">
              {articles.map((item) => {
                const isActive = selectedId === item.id;
                const slug = toSlug(item.titleEn, item.id);
                return (
                  <li key={item.id}>
                    <LinkTo
                      href={`/knowledge-base/${slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-start gap-2.5 rounded-site-sm px-3 py-2.5 text-start text-site-sm transition-colors duration-150 ${
                        isActive
                          ? "bg-site-brand-tint font-semibold text-site-brand-deep"
                          : "text-site-fg hover:bg-site-bg hover:text-site-ink"
                      }`}
                    >
                      <IoDocumentTextOutline
                        className={`mt-0.5 size-4 shrink-0 ${
                          isActive ? "text-site-brand" : "text-site-muted"
                        }`}
                        aria-hidden
                      />
                      <span className="line-clamp-2 leading-snug">
                        {getTitle(item)}
                      </span>
                    </LinkTo>
                  </li>
                );
              })}
            </ul>
          )}
        </nav>

        {/* ── Sidebar pagination ── */}
        {pagination.totalPages > 1 && (
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-site-line px-4 py-3">
            <button
              type="button"
              onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
              disabled={sidebarPage <= 1 || listLoading}
              aria-label={t("backToList")}
              className="flex size-9 items-center justify-center rounded-site-sm text-site-fg transition-colors hover:bg-site-bg hover:text-site-ink disabled:pointer-events-none disabled:opacity-35"
            >
              <IoChevronBackOutline size={16} className="rtl:rotate-180" />
            </button>

            <span className="text-site-xs text-site-muted tabular-nums">
              <span className="font-semibold text-site-ink">{sidebarPage}</span>
              {" / "}
              {pagination.totalPages}
            </span>

            <button
              type="button"
              onClick={() =>
                setSidebarPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={sidebarPage >= pagination.totalPages || listLoading}
              aria-label={t("sectionLabel")}
              className="flex size-9 items-center justify-center rounded-site-sm text-site-fg transition-colors hover:bg-site-bg hover:text-site-ink disabled:pointer-events-none disabled:opacity-35"
            >
              <IoChevronForwardOutline size={16} className="rtl:rotate-180" />
            </button>
          </div>
        )}
      </aside>

      {/* ══════════════════════ MAIN ══════════════════════ */}
      <main
        className={`min-w-0 flex-1 overflow-x-hidden bg-site-bg ${
          showingDetailOnMobile ? "block" : "hidden md:block"
        }`}
      >
        {/* mobile back bar */}
        {showingDetailOnMobile && (
          <div className="sticky top-(--s-header-h) z-20 border-b border-site-line bg-site-bg/92 px-5 py-3 backdrop-blur-sm md:hidden">
            <button
              type="button"
              onClick={handleMobileBack}
              className="inline-flex items-center gap-2 text-site-sm font-semibold text-site-brand transition-colors hover:text-site-brand-hover"
            >
              <IoArrowBack className="size-4 rtl:rotate-180" aria-hidden />
              <span>{t("backToList")}</span>
            </button>
          </div>
        )}

        {/* loading skeleton */}
        {detailLoading && (
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-10 md:px-10 md:py-14">
            <div className="h-9 w-full max-w-md animate-pulse rounded-site-sm bg-site-line" />
            <div className="h-px bg-site-line" />
            <div className="space-y-3 pt-2">
              {[100, 92, 96, 78, 88, 62, 82].map((w, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded bg-site-line"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        )}

        {/* empty state */}
        {!detailLoading &&
          !article &&
          (listLoading ? (
            <div className="flex h-[60vh] items-center justify-center">
              <FaSpinner
                className="size-6 animate-spin text-site-brand"
                aria-hidden
              />
            </div>
          ) : (
            <div className="flex h-[60vh] flex-col items-center justify-center px-6 text-center">
              <span className="mb-6 flex size-16 items-center justify-center rounded-full bg-site-brand-tint text-site-brand">
                <IoLibraryOutline className="size-7" aria-hidden />
              </span>
              {/* The page's only heading while no article is open — the
                  article's own title takes the h1 once one is. */}
              <h1 className="text-site-h3">{t("emptyTitle")}</h1>
              <p className="mt-3 max-w-sm text-site-body text-site-fg">
                {t("emptyDescription")}
              </p>
            </div>
          ))}

        {/* article */}
        {!detailLoading && article && (
          <article className="mx-auto max-w-3xl px-5 py-10 md:px-10 md:py-16">
            <header className="border-b border-site-line pb-7">
              <h1 className="text-site-h2">{getTitle(article)}</h1>

              {(article.createdAt || article.updatedAt) && (
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-site-xs text-site-muted">
                  {article.createdAt && (
                    <span className="flex items-center gap-1.5">
                      <IoCalendarOutline className="size-3.5" aria-hidden />
                      {t("createdAt")}: <ViewTime data={article.createdAt} />
                    </span>
                  )}
                  {article.updatedAt && (
                    <span className="flex items-center gap-1.5">
                      <IoTimeOutline className="size-3.5" aria-hidden />
                      {t("updatedAt")}: <ViewTime data={article.updatedAt} />
                    </span>
                  )}
                </div>
              )}
            </header>

            <div
              dir={isRTL ? "rtl" : "ltr"}
              className="show-editor kb-article mt-8 overflow-x-hidden text-site-body text-site-fg [&_.se-wrapper]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto"
            >
              <ShowEditor initialTemplateName={getDescription(article)} />
            </div>
          </article>
        )}
      </main>
    </div>
  );
}

export { KnowledgeBaseInner };
export default KnowledgeBaseInner;
