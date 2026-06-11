"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
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

/* ─────────────────────── types ─────────────────────── */

interface ArticleListItem {
  id: number;
  titleAr: string;
  titleEn: string;
}

interface ArticleDetail extends ArticleListItem {
  descriptionAr: string;
  descriptionEn: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ListResponse {
  success: boolean;
  data: ArticleListItem[];
  pagination: Pagination;
}

interface DetailResponse {
  success: boolean;
  data: ArticleDetail;
}

const PAGE_LIMIT = 10;

/* ─────────────────────── inner component ───────────── */

function KnowledgeBaseInner() {
  const locale = useLocale();
  const t = useTranslations("knowledgeBase");
  const isRTL = locale === "ar";
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlId = searchParams.get("id");

  /* sidebar state */
  const [articles, setArticles] = useState<ArticleListItem[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sidebarPage, setSidebarPage] = useState(1);
  const [listLoading, setListLoading] = useState(true);

  /* article detail state */
  const [selectedId, setSelectedId] = useState<number | null>(
    urlId ? Number(urlId) : null,
  );
  const [article, setArticle] = useState<ArticleDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const firstLoad = useRef(true);

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
          if (firstLoad.current && list.length > 0 && !urlId) {
            firstLoad.current = false;
            const isDesktop = window.matchMedia("(min-width: 768px)").matches;
            if (isDesktop) {
              const firstId = list[0].id;
              setSelectedId(firstId);
              router.replace(`/knowledge-base?id=${firstId}`);
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
    fetchList(sidebarPage, debouncedSearch);
  }, [fetchList, sidebarPage, debouncedSearch]);

  /* ── sync URL id → selectedId ── */
  useEffect(() => {
    setSelectedId(urlId ? Number(urlId) : null);
  }, [urlId]);

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
    if (selectedId !== null) fetchDetail(selectedId);
  }, [fetchDetail, selectedId]);

  /* ── click article → update URL ── */
  const handleSelect = (id: number) => {
    if (id === selectedId) return;
    router.push(`/knowledge-base?id=${id}`);
  };

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
  return (
    <div
    dir={isRTL ? "rtl" : "ltr"}
    className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-[#090e18] pt-[88px] md:pt-[100px]"
  >
    {/* ══════════════════════ SIDEBAR ══════════════════════ */}
    <aside
      className={`w-full md:w-72 shrink-0 md:sticky md:top-[100px] md:self-start md:h-[calc(100vh-100px)] flex flex-col bg-white dark:bg-[#0d1117] border-b md:border-b-0 md:border-e border-slate-200 dark:border-slate-800 ${
        showingDetailOnMobile ? "hidden md:flex" : "flex"
      }`}
    >
      {/* ── Header ── */}
      <div className="px-4 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        {/* label row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center shrink-0">
              <IoLibraryOutline className="text-purple-600 dark:text-purple-400 text-base" />
            </div>
            <p className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              {t("sectionLabel")}
            </p>
          </div>
          {!listLoading && (
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/15 px-2 py-0.5 rounded-full border border-purple-100 dark:border-purple-500/20">
              {pagination.total}
            </span>
          )}
        </div>
  
        {/* search input */}
        <div className="relative">
          {listLoading ? (
            <FaSpinner className="absolute top-1/2 -translate-y-1/2 start-3 text-purple-400 text-sm animate-spin" />
          ) : (
            <IoSearchOutline className="absolute top-1/2 -translate-y-1/2 start-3 text-slate-400 text-sm pointer-events-none" />
          )}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full py-2 ps-8 pe-7 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute top-1/2 -translate-y-1/2 end-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <IoCloseOutline size={15} />
            </button>
          )}
        </div>
      </div>
  
      {/* ── Scrollable list ── */}
      <nav className="flex-1 overflow-y-auto p-2 max-h-[calc(100vh-250px)] md:max-h-none">
        {listLoading ? (
          <div className="space-y-1 p-1">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="h-9 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse"
                style={{ opacity: 1 - i * 0.09 }}
              />
            ))}
          </div>
        ) : articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <IoSearchOutline className="text-3xl text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {t("noResults")}
            </p>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {articles.map((item) => {
              const isActive = selectedId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleSelect(item.id)}
                    className={`w-full text-start text-sm rounded-lg px-3 py-2.5 transition-all duration-150 flex items-center gap-2.5 ${
                      isActive
                        ? "bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100"
                    }`}
                  >
                    {isActive ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400 shrink-0" />
                    ) : (
                      <IoDocumentTextOutline className="text-slate-400 dark:text-slate-600 shrink-0 text-[15px]" />
                    )}
                    <span className="line-clamp-2 leading-snug">
                      {getTitle(item)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
  
      {/* ── Sidebar pagination ── */}
      {pagination.totalPages > 1 && (
        <div className="shrink-0 px-3 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-[#0d1117]">
          <button
            onClick={() => setSidebarPage((p) => Math.max(1, p - 1))}
            disabled={sidebarPage <= 1 || listLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <IoChevronBackOutline size={16} />
          </button>
  
          <span className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {sidebarPage
            }</span>
            {" / "}
            {pagination.totalPages}
          </span>
  
          <button
            onClick={() =>
              setSidebarPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={sidebarPage >= pagination.totalPages || listLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <IoChevronForwardOutline size={16} />
          </button>
        </div>
      )}
    </aside>
  
    {/* ══════════════════════ MAIN ══════════════════════ */}
    <main
      className={`flex-1 min-w-0 overflow-x-hidden bg-white dark:bg-[#0d1117] md:bg-transparent md:dark:bg-transparent ${
        showingDetailOnMobile ? "block" : "hidden md:block"
      }`}
    >
      {/* mobile back bar */}
      {showingDetailOnMobile && (
        <div className="md:hidden sticky  z-20 bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <button
            type="button"
            onClick={handleMobileBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors cursor-pointer"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <IoArrowBack
              className={`text-base transition-transform duration-200 ${isRTL ? "rotate-180" : ""}`}
            />
            <span>{t("backToList")}</span>
          </button>
        </div>
      )}
  
      {/* loading skeleton */}
      {detailLoading && (
        <div className="px-4 sm:px-6 md:px-12 py-6 md:py-10 space-y-5">
          <div className="h-8 md:h-9 w-full max-w-md bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
          <div className="h-px bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-3 pt-2">
            {[100, 92, 96, 78, 88, 62, 82].map((w, i) => (
              <div
                key={i}
                className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"
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
          <div className="flex items-center justify-center h-[60vh]">
            <FaSpinner className="animate-spin text-purple-400 text-2xl" />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center mb-5">
              <IoLibraryOutline className="text-5xl text-purple-300 dark:text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">
              {t("emptyTitle")}
            </h2>
            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-xs">
              {t("emptyDescription")}
            </p>
          </div>
        ))}
  
      {/* article */}
      {!detailLoading && article && (
        <div className="md:bg-white md:dark:bg-[#0d1117] md:border md:border-slate-200 md:dark:border-slate-800 md:rounded-2xl md:m-6 lg:m-10 md:shadow-sm">
          {/* hero header */}
          <div className="border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 md:px-10 py-5 md:py-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-50 leading-tight mb-3 md:mb-4">
              {getTitle(article)}
            </h1>
  
            {/* dates */}
            {(article.createdAt || article.updatedAt) && (
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs text-slate-500 dark:text-slate-400">
                {article.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <IoCalendarOutline className="text-slate-400 text-sm" />
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      {t("createdAt")}:
                    </span>
                    <ViewTime data={article.createdAt} />
                  </span>
                )}
                {article.updatedAt && (
                  <span className="flex items-center gap-1.5">
                    <IoTimeOutline className="text-purple-400 text-sm" />
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      {t("updatedAt")}:
                    </span>
                    <span className="text-purple-600 dark:text-purple-400">
                      <ViewTime data={article.updatedAt} />
                    </span>
                  </span>
                )}
              </div>
            )}
          </div>
  
          {/* body */}
          <div
  dir={isRTL ? "rtl" : "ltr"}
  className="px-4 sm:px-6 md:px-10 pb-24 md:py-8 show-editor overflow-x-hidden [&_img]:max-w-full [&_img]:h-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto [&_.se-wrapper]:max-w-full"
>
  <ShowEditor initialTemplateName={getDescription(article)} />
</div>
        </div>
      )}
    </main>
  </div>
  );
}

/* ─────────────────────── page export ───────────────── */

export default function KnowledgeBasePage() {
  return (
    <Suspense>
      <KnowledgeBaseInner />
    </Suspense>
  );
}
