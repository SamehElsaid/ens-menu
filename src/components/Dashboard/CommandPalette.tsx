"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { FiCornerDownLeft, FiSearch } from "react-icons/fi";
import { IoHelpCircleOutline, IoStorefrontOutline } from "react-icons/io5";
import type { IconType } from "react-icons";
import { useRouter } from "@/i18n/navigation";
import { axiosGet } from "@/shared/axiosCall";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useAdminPermissions } from "@/hooks/useAdminPermissions";
import {
  localizedMenuName,
  useDashboardMenus,
} from "@/hooks/useDashboardMenus";
import { getMenuDashboardRef } from "@/lib/menuDashboardPath";
import {
  SCOPE_LABEL,
  collectDestinations,
  type ConsoleScope,
} from "@/lib/consoleNav";
import type { AdminPermissionKey } from "@/types/AdminPermission";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/components/ui/useDialog";

const RECENTS_KEY = "ens.console.command-recents";
const MAX_RECENTS = 5;

type CommandEntry = {
  id: string;
  label: string;
  /** Group heading translation key. */
  group: string;
  icon: IconType;
  href: string;
  /** Scope or venue name shown after the label. */
  hint?: string;
  /** Extra terms to match on. */
  terms: string;
};

type HelpArticle = { id: number; titleAr: string; titleEn: string };

/** Mirrors the slug the knowledge-base routes expect. */
function articleSlug(titleEn: string, id: number): string {
  const base = titleEn
    .toLowerCase()
    .replace(/[\u0600-\u06FF\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base ? `${base}-${id}` : `${id}`;
}

function readRecents(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    return Array.isArray(parsed)
      ? parsed.filter((v) => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

function pushRecent(id: string) {
  try {
    const next = [id, ...readRecents().filter((v) => v !== id)].slice(
      0,
      MAX_RECENTS,
    );
    window.localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
  } catch {
    /* A missing recents list is not worth failing navigation over. */
  }
}

/**
 * Command palette — CONSOLE-REDESIGN.md §3.
 *
 * The console has 46 destinations and, before this, no way to reach one by name.
 * Everything here is navigation: it moves you somewhere and lets that page's own
 * form take responsibility for any change. A palette that quietly mutates data
 * on `Enter` is a palette people stop trusting.
 */
export function CommandPalette({
  open,
  onClose,
  venueRef,
  canReachAdmin,
}: {
  open: boolean;
  onClose: () => void;
  venueRef: string | null;
  canReachAdmin: boolean;
}) {
  const isClient = useIsClient();

  /* Mounting on open rather than hiding a live dialog: every piece of state
     here — the query, the cursor, the recents snapshot — is meant to start
     fresh, and mount is where "fresh" is free. */
  if (!isClient || !open) return null;

  return (
    <PaletteDialog
      onClose={onClose}
      venueRef={venueRef}
      canReachAdmin={canReachAdmin}
    />
  );
}

function PaletteDialog({
  onClose,
  venueRef,
  canReachAdmin,
}: {
  onClose: () => void;
  venueRef: string | null;
  canReachAdmin: boolean;
}) {
  const locale = useLocale();
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const { isStaff, can } = useAuthorization();
  const { has: hasAdminPermission } = useAdminPermissions();
  const { menus } = useDashboardMenus();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recents] = useState<string[]>(readRecents);
  const [fetchedHelp, setFetchedHelp] = useState<HelpArticle[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  const trimmedQuery = query.trim();
  const helpQuery = trimmedQuery.length >= 2 ? trimmedQuery : "";
  /* Results for a query that has since been shortened are stale, so they are
     dropped on read rather than cleared through another render. */
  const help = useMemo(
    () => (helpQuery ? fetchedHelp : []),
    [helpQuery, fetchedHelp],
  );

  /**
   * Knowledge-base articles, folded in behind the same box.
   *
   * The header used to carry a second magnifying glass for these. Two search
   * affordances side by side make the operator choose before they have typed
   * anything, and the choice is one they cannot make correctly — they do not yet
   * know whether what they want is a page or an article.
   */
  useEffect(() => {
    if (!helpQuery) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      void axiosGet<{ data: HelpArticle[] }>(
        "/searchInformation",
        locale,
        undefined,
        { page: 1, limit: 4, search: helpQuery },
      )
        .then((res) => {
          if (cancelled) return;
          setFetchedHelp(res.status && res.data ? (res.data.data ?? []) : []);
        })
        .catch(() => {
          if (!cancelled) setFetchedHelp([]);
        });
    }, 200);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [helpQuery, locale]);

  const entries = useMemo<CommandEntry[]>(() => {
    const list: CommandEntry[] = [];

    const scopes: ConsoleScope[] = ["account"];
    if (venueRef) scopes.unshift("venue");
    if (canReachAdmin) scopes.push("admin");

    for (const destination of collectDestinations(scopes, venueRef)) {
      const { item, scope: destScope } = destination;

      if (destScope === "admin") {
        const key = item.key ?? "";
        const permission: Record<string, AdminPermissionKey> = {
          broadcast: "users",
          "domain-transfers": "users",
          vouchers: "promo",
          "administrators-log": "administrators",
        };
        const needed = permission[key] ?? (key as AdminPermissionKey);
        const open =
          key === "overview" || key === "personal" || key === "metadata";
        if (!open && !hasAdminPermission(needed)) continue;
      } else if (isStaff) {
        if (item.ownerOnly) continue;
        if (item.permission && !can(item.permission)) continue;
      }

      list.push({
        id: destination.id,
        label: t(item.label),
        group: "commandGroupGoTo",
        icon: item.icon,
        href: destination.href,
        hint: t(SCOPE_LABEL[destScope]),
        terms: (item.keywords ?? []).join(" "),
      });
    }

    for (const menu of menus) {
      const ref = getMenuDashboardRef(menu);
      if (!ref || ref === venueRef) continue;
      const name = localizedMenuName(menu, locale);
      list.push({
        id: `venue:${ref}`,
        label: name,
        group: "commandGroupVenues",
        icon: IoStorefrontOutline,
        href: `/dashboard/${ref}`,
        terms: "menu venue switch",
      });
    }

    return list;
  }, [
    venueRef,
    canReachAdmin,
    menus,
    locale,
    isStaff,
    can,
    hasAdminPermission,
    t,
  ]);

  const helpEntries = useMemo<CommandEntry[]>(
    () =>
      help.map((article) => ({
        id: `help:${article.id}`,
        label:
          (locale === "ar" ? article.titleAr : article.titleEn) ||
          article.titleEn,
        group: "commandGroupHelp",
        icon: IoHelpCircleOutline,
        href: `/knowledge-base/${articleSlug(article.titleEn, article.id)}`,
        terms: "help article guide",
      })),
    [help, locale],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) {
      const recentEntries = recents
        .map((id) => entries.find((e) => e.id === id))
        .filter((e): e is CommandEntry => Boolean(e))
        .map((e) => ({ ...e, group: "commandGroupRecent" }));

      const recentIds = new Set(recentEntries.map((e) => e.id));
      return [...recentEntries, ...entries.filter((e) => !recentIds.has(e.id))];
    }

    /* Label matches rank above keyword matches: someone typing "pay" wants
       Payments, not every page that happens to mention payment. */
    const scored = entries
      .map((entry) => {
        const label = entry.label.toLowerCase();
        if (label.startsWith(q)) return { entry, rank: 0 };
        if (label.includes(q)) return { entry, rank: 1 };
        if (entry.terms.toLowerCase().includes(q)) return { entry, rank: 2 };
        return null;
      })
      .filter((v): v is { entry: CommandEntry; rank: number } => Boolean(v))
      .sort((a, b) => a.rank - b.rank);

    /* Articles sit below destinations: someone who typed a page name wants the
       page, and help is what they fall back to when it is not there. */
    return [...scored.map((s) => s.entry), ...helpEntries];
  }, [entries, query, recents, helpEntries]);

  const run = useCallback(
    (entry: CommandEntry) => {
      pushRecent(entry.id);
      onClose();
      router.push(entry.href);
    },
    [onClose, router],
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => (results.length ? (i + 1) % results.length : 0));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) =>
          results.length ? (i - 1 + results.length) % results.length : 0,
        );
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        const entry = results[activeIndex];
        if (entry) run(entry);
      }
    },
    [results, activeIndex, run, onClose],
  );

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  let lastGroup: string | null = null;
  const rows: ReactNode[] = [];

  results.forEach((entry, index) => {
    if (entry.group !== lastGroup) {
      lastGroup = entry.group;
      rows.push(
        <p
          key={`group-${entry.group}-${index}`}
          role="presentation"
          className="ui-label px-3 pb-1 pt-3 text-fg-subtle first:pt-1"
        >
          {t(entry.group)}
        </p>,
      );
    }

    const active = index === activeIndex;
    rows.push(
      <button
        key={entry.id}
        type="button"
        role="option"
        id={`command-option-${index}`}
        aria-selected={active}
        data-active={active ? "true" : "false"}
        onClick={() => run(entry)}
        onPointerMove={() => setActiveIndex(index)}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2 text-start",
          active ? "bg-brand-soft text-brand-soft-fg" : "text-fg-muted",
        )}
      >
        <entry.icon
          className={cn(
            "size-4 shrink-0",
            active ? "text-brand-soft-fg" : "text-fg-subtle",
          )}
          aria-hidden
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-[13px]",
            active && "font-semibold",
          )}
        >
          {entry.label}
        </span>
        {entry.hint ? (
          <span className="ui-label shrink-0 text-fg-subtle">{entry.hint}</span>
        ) : null}
        {active ? (
          <FiCornerDownLeft className="size-3.5 shrink-0" aria-hidden />
        ) : null}
      </button>,
    );
  });

  return createPortal(
    <div className="fixed inset-0 z-[1100]" role="presentation">
      <div
        className="absolute inset-0 bg-overlay motion-safe:animate-[ui-fade-in_var(--dur-pop)_var(--ease-settle)]"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("commandPlaceholder")}
        className={cn(
          "absolute inset-x-3 top-[12vh] mx-auto flex max-h-[70vh] w-full max-w-xl flex-col overflow-hidden",
          "rounded-2xl border border-line bg-raised shadow-2xl",
          "motion-safe:animate-[ui-pop-in_var(--dur-pop)_var(--ease-enter)]",
        )}
        onKeyDown={onKeyDown}
      >
        <div className="flex shrink-0 items-center gap-2.5 border-b border-line px-3.5 py-3">
          <FiSearch className="size-4 shrink-0 text-fg-subtle" aria-hidden />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              /* A new query means a new first result, so the cursor goes back
                 to the top with it rather than one render later. */
              setActiveIndex(0);
            }}
            placeholder={t("commandPlaceholder")}
            aria-label={t("commandPlaceholder")}
            role="combobox"
            aria-expanded
            aria-controls="command-listbox"
            aria-activedescendant={
              results.length ? `command-option-${activeIndex}` : undefined
            }
            autoComplete="off"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-fg-subtle"
          />
        </div>

        <div
          ref={listRef}
          id="command-listbox"
          role="listbox"
          aria-label={t("commandGroupGoTo")}
          className="min-h-0 flex-1 overflow-y-auto py-1 [scrollbar-width:thin]"
        >
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-fg">
                {t("commandNoResults")}
              </p>
              <p className="mt-1 text-[13px] text-fg-subtle">
                {t("commandNoResultsHint")}
              </p>
            </div>
          ) : (
            rows
          )}
        </div>

        <div className="hidden shrink-0 items-center gap-4 border-t border-line bg-surface-2/60 px-3.5 py-2 sm:flex">
          <Hint keys="↑ ↓" label={t("commandHintNavigate")} />
          <Hint keys="↵" label={t("commandHintSelect")} />
          <Hint keys="esc" label={t("commandHintClose")} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-fg-subtle">
      <kbd className="rounded border border-line bg-surface px-1.5 font-mono text-[10px] leading-4 text-fg-muted">
        {keys}
      </kbd>
      {label}
    </span>
  );
}

/** `Cmd/Ctrl+K` from anywhere in the console. */
export function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setOpen((prev) => !prev);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return {
    open,
    openPalette: useCallback(() => setOpen(true), []),
    closePalette: useCallback(() => setOpen(false), []),
  };
}

export default CommandPalette;
