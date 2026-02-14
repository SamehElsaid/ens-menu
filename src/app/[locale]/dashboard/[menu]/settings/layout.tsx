"use client";
import SettingNavigationSwiper from "@/components/SettingNavigationSwiper";
import { useState } from "react";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <div>
      <SettingNavigationSwiper setLoading={setLoading} loading={loading}  />
      {children}
    </div>
  )
}