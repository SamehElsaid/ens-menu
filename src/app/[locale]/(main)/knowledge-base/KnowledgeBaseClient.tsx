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
import { SiteSpinner } from "@/components/site";
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

  /* Focus moves to the article heading when the reader picks a different
     article — but never on the first paint, which would yank focus away from
     wherever the visitor actually landed. */
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstArticleRender = useRef(true);
  const articleId = article?.id ?? null;

  useEffect(() => {
    if (articleId === null) return;
    if (firstArticleRender.current) {
      firstArticleRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [articleId]);

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
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <p className="s-ticket inline-flex items-center gap-2 text-site-muted">
              <IoLibraryOutline className="size-4" aria-hidden />
              {t("sectionLabel")}
            </p>
            {!listLoading && (
              <span className="font-site-mono text-site-sm font-semibold text-site-ink tabular-nums">
                {pagination.total}
              </span>
            )}
          </div>

          {/* Search carries the site's field rule: a 2px inline-start edge that
              states rest, hover, focus and error. No coloured blur ring. */}
          <div className="relative">
            <span className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-site-muted">
              {listLoading ? (
                <SiteSpinner className="size-4" />
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
              className="s-field h-11 w-full rounded-site-control border border-site-line bg-site-bg ps-10 pe-9 text-site-sm text-site-ink placeholder:text-site-muted focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label={t("noResults")}
                className="absolute end-2.5 top-1/2 -translate-y-1/2 p-1 text-site-muted transition-colors hover:text-site-ink"
              >
                <IoCloseOutline size={16} aria-hidden />
              </button>
            )}
          </div>
        </div>

        {/* ── Scrollable list ── */}
        <nav className="max-h-[26rem] flex-1 overflow-y-auto md:max-h-none">
          {listLoading ? (
            /* Skeletons rather than an entrance animation on the results. The
               list already costs a 500ms debounce plus a round trip; making the
               reader then wait out a reveal before they can read what came back
               is the one thing this page must not do. Shimmer says "working",
               and then the content is simply there. */
            <div className="space-y-px p-3">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="s-skeleton h-10"
                  style={{ opacity: 1 - i * 0.09 }}
                />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="px-5 py-12">
              <IoSearchOutline
                className="mb-3 size-6 text-site-muted"
                aria-hidden
              />
              <p className="text-site-sm text-site-muted">{t("noResults")}</p>
            </div>
          ) : (
            /* Divided rows, and the open article is marked by a brand rule on
               its inline-start edge — the same signal the dashboard's navigation
               uses for the current item. A tinted pill could not survive next to
               a long title wrapping to three lines. */
            <ul>
              {articles.map((item) => {
                const isActive = selectedId === item.id;
                const slug = toSlug(item.titleEn, item.id);
                return (
                  <li key={item.id}>
                    <LinkTo
                      href={`/knowledge-base/${slug}`}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full items-start gap-2.5 border-b border-site-line border-s-2 px-4 py-3 text-start text-site-sm transition-colors duration-(--dur-tint) ease-(--ease-settle) ${
                        isActive
                          ? "border-s-site-brand bg-site-bg font-semibold text-site-ink"
                          : "border-s-transparent text-site-fg hover:bg-site-bg hover:text-site-ink"
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
          <div className="flex shrink-0 items-stretch justify-between border-t border-site-line">
            <button
              type="button"
              onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
              disabled={sidebarPage <= 1 || listLoading}
              aria-label={t("backToList")}
              className="flex size-11 items-center justify-center border-e border-site-line text-site-fg transition-colors hover:bg-site-ink hover:text-site-ground disabled:pointer-events-none disabled:opacity-35"
            >
              <IoChevronBackOutline size={16} className="rtl:rotate-180" />
            </button>

            <span className="s-ticket flex items-center px-4 text-site-muted">
              <span className="text-site-ink">{sidebarPage}</span>
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
              className="flex size-11 items-center justify-center border-s border-site-line text-site-fg transition-colors hover:bg-site-ink hover:text-site-ground disabled:pointer-events-none disabled:opacity-35"
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
        {/* Reading progress, and it is the only thing on this page that reports
            something the layout does not already show: how much of a long help
            article is left. A `scroll()` timeline, so it is the scroll position
            rather than a sample of it — no listener, no state, off the main
            thread. Two placements because there are two layouts: on a phone it
            rides the bottom edge of the sticky back bar, which is already the
            thing pinned under the header. */}
        {showingDetailOnMobile && (
          <div className="sticky top-(--s-header-h) z-20 border-b border-site-line bg-site-bg px-5 py-3 md:hidden">
            <button
              type="button"
              onClick={handleMobileBack}
              className="s-ticket inline-flex items-center gap-2 text-site-ink transition-colors duration-(--dur-tint) ease-(--ease-settle) hover:text-site-brand motion-safe:active:scale-[0.98]"
            >
              <IoArrowBack className="size-4 rtl:rotate-180" aria-hidden />
              <span>{t("backToList")}</span>
            </button>
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-0.5 bg-site-line"
            >
              <span className="s-progress-rule block h-full bg-site-brand" />
            </span>
          </div>
        )}

        {article ? (
          <div
            aria-hidden
            className="sticky top-(--s-header-h) z-10 hidden h-0.5 bg-site-line md:block"
          >
            <span className="s-progress-rule block h-full bg-site-brand" />
          </div>
        ) : null}

        {/* loading skeleton */}
        {detailLoading && (
          <div className="mx-auto max-w-3xl space-y-5 px-5 py-10 md:px-10 md:py-14">
            <div className="s-skeleton h-9 w-full max-w-md rounded-site-sm" />
            <div className="h-px bg-site-line" />
            <div className="space-y-3 pt-2">
              {[100, 92, 96, 78, 88, 62, 82].map((w, i) => (
                <div
                  key={i}
                  className="s-skeleton h-4 rounded"
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
              <SiteSpinner className="size-6 text-site-brand" label={t("sectionLabel")} />
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-5 py-16 md:px-10 md:py-20">
              <span className="flex size-12 items-center justify-center bg-site-ink text-site-ground">
                <IoLibraryOutline className="size-6" aria-hidden />
              </span>
              {/* The page's only heading while no article is open — the
                  article's own title takes the h1 once one is. */}
              <h1 className="mt-6 text-site-h2">{t("emptyTitle")}</h1>
              <p className="mt-4 max-w-md text-site-lead text-site-fg">
                {t("emptyDescription")}
              </p>
            </div>
          ))}

        {/* article */}
        {!detailLoading && article && (
          /* Keyed on the article, which is what makes both of these work: a
              fresh node per article gives `@starting-style` a real "before" to
              crossfade from on desktop, and re-runs the inline slide on mobile
              where the same change is a navigation between two views rather
              than a swap between two visible panes.

              `data-sheet-side="end"` resolves the slide direction against the
              document direction, so the article enters from the trailing edge in
              both English and Arabic. */
          <article
            key={article.id}
            data-sheet-side="end"
            className="s-panel-enter mx-auto max-w-3xl px-5 py-10 md:animate-none md:px-10 md:py-16 motion-safe:animate-[ui-slide-in-inline_var(--dur-sheet)_var(--ease-enter)]"
          >
            <header className="border-b-2 border-site-ink pb-7">
              <p className="s-ticket text-site-muted">{t("sectionLabel")}</p>
              {/* Focus lands here on an article change, so a keyboard or screen
                  reader user is moved into what they just chose instead of being
                  left in the sidebar. `-1` keeps it out of the tab order. */}
              <h1 ref={headingRef} tabIndex={-1} className="mt-4 text-site-h2">
                {getTitle(article)}
              </h1>

              {(article.createdAt || article.updatedAt) && (
                <div className="s-ticket mt-6 flex flex-wrap gap-x-8 gap-y-2 text-site-muted">
                  {article.createdAt && (
                    <span className="flex items-center gap-2">
                      <IoCalendarOutline className="size-3.5" aria-hidden />
                      {t("createdAt")}: <ViewTime data={article.createdAt} />
                    </span>
                  )}
                  {article.updatedAt && (
                    <span className="flex items-center gap-2">
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
