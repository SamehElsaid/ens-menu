import type { ReactNode } from "react";
import { getDashboardPageMetadata } from "@/lib/dashboardMetadata";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return getDashboardPageMetadata(locale, {
    namespace: "Dashboard",
    key: "Advertisements",
  });
}

export default function Layout({ children }: Props) {
  return children;
}
