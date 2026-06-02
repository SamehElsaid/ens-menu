import type { ReactNode } from "react";
import { getDashboardPageMetadata } from "@/lib/dashboardMetadata";

const META = { namespace: "Dashboard", key: "analytics" } as const;

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return getDashboardPageMetadata(locale, META);
}

export default function Layout({ children }: Props) {
  return children;
}
