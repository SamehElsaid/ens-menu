"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useDashboardPageTitle } from "@/hooks/useDashboardPageTitle";

const DashboardTitleContext = createContext<string | undefined>(undefined);

export function DashboardTitleProvider({ children }: { children: ReactNode }) {
  const pageTitle = useDashboardPageTitle({ enabled: true });
  return (
    <DashboardTitleContext.Provider value={pageTitle}>
      {children}
    </DashboardTitleContext.Provider>
  );
}

export function useDashboardTitle(): string | undefined {
  return useContext(DashboardTitleContext);
}
