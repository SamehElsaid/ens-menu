import type { ReactNode } from "react";
import { getDashboardPageMetadata } from "@/lib/dashboardMetadata";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string; menu: string }>;
};

export async function generateMetadata({ params }: LayoutProps) {
  const { locale } = await params;
  return getDashboardPageMetadata(locale, {
    namespace: "Dashboard",
    key: "Overview",
  });
}

export default function MenuDashboardLayout({ children }: LayoutProps) {
  return children;
}
