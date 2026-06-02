import type { ReactNode } from "react";
import DashboardClientLayout from "@/components/Dashboard/DashboardClientLayout";
import { getDashboardPageMetadata } from "@/lib/dashboardMetadata";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: LayoutProps) {
  const { locale } = await params;
  return getDashboardPageMetadata(locale, { namespace: "Menus", key: "title" });
}

export default function DashboardLayout({ children }: LayoutProps) {
  return <DashboardClientLayout>{children}</DashboardClientLayout>;
}
