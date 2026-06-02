import type { ReactNode } from "react";
import SettingsClientLayout from "@/components/Dashboard/SettingsClientLayout";
import { getDashboardPageMetadata } from "@/lib/dashboardMetadata";

type Props = { children: ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return getDashboardPageMetadata(locale, {
    namespace: "Dashboard",
    key: "Settings",
  });
}

export default function SettingsLayout({ children }: Props) {
  return <SettingsClientLayout>{children}</SettingsClientLayout>;
}
