"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type ReactNode,
} from "react";

/**
 * Page-owned chrome for the console shell.
 *
 * The sticky header is a two-level frame: a global utility row and a page
 * context row. Pages keep using `PageHeader` as their API; when they render
 * inside this provider the header content is lifted into the shell so the
 * title, description and actions sit with the navigation rather than floating
 * as a second header inside the scrollable column.
 *
 * Meta is kept in a per-provider store (not React state) so `setPageMeta`
 * only notifies `ConsoleHeader`. Putting ReactNodes in context state used to
 * re-render the whole shell → `PageHeader` got new element props → effect
 * called `setPageMeta` again → maximum update depth.
 */
export type ConsolePageMeta = {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  eyebrow?: ReactNode;
  /** Optional DOM id for the chrome title (onboarding / deep links). */
  anchorId?: string;
};

type PageMetaStore = {
  meta: ConsolePageMeta | null;
  listeners: Set<() => void>;
};

type ConsoleChromeValue = {
  setPageMeta: (meta: ConsolePageMeta) => void;
  clearPageMeta: () => void;
  subscribe: (onStoreChange: () => void) => () => void;
  getSnapshot: () => ConsolePageMeta | null;
};

const ConsoleChromeContext = createContext<ConsoleChromeValue | null>(null);

const emptySubscribe = () => () => {};
const emptySnapshot = () => null;

export function ConsoleChromeProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<PageMetaStore | null>(null);
  if (storeRef.current === null) {
    storeRef.current = { meta: null, listeners: new Set() };
  }

  const setPageMeta = useCallback((meta: ConsolePageMeta) => {
    const store = storeRef.current!;
    store.meta = meta;
    store.listeners.forEach((listener) => listener());
  }, []);

  const clearPageMeta = useCallback(() => {
    const store = storeRef.current!;
    if (store.meta === null) return;
    store.meta = null;
    store.listeners.forEach((listener) => listener());
  }, []);

  const subscribe = useCallback((onStoreChange: () => void) => {
    const store = storeRef.current!;
    store.listeners.add(onStoreChange);
    return () => {
      store.listeners.delete(onStoreChange);
    };
  }, []);

  const getSnapshot = useCallback(() => storeRef.current!.meta, []);

  const value = useMemo(
    () => ({ setPageMeta, clearPageMeta, subscribe, getSnapshot }),
    [setPageMeta, clearPageMeta, subscribe, getSnapshot],
  );

  return (
    <ConsoleChromeContext.Provider value={value}>
      {children}
    </ConsoleChromeContext.Provider>
  );
}

export function useConsoleChrome(): ConsoleChromeValue {
  const ctx = useContext(ConsoleChromeContext);
  if (!ctx) {
    throw new Error("useConsoleChrome must be used within ConsoleChromeProvider");
  }
  return ctx;
}

export function useConsoleChromeOptional(): ConsoleChromeValue | null {
  return useContext(ConsoleChromeContext);
}

/** Subscribe to lifted page meta — only re-renders the consumer (e.g. header). */
export function useConsolePageMeta(): ConsolePageMeta | null {
  const ctx = useContext(ConsoleChromeContext);
  return useSyncExternalStore(
    ctx?.subscribe ?? emptySubscribe,
    ctx?.getSnapshot ?? emptySnapshot,
    emptySnapshot,
  );
}
