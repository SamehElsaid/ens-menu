"use client";

import Layout from "@/components/Dashboard/Layout";
import { AuthUserHydrate } from "@/components/Dashboard/AuthUserHydrate";
import { FcmTokenSync } from "@/components/Dashboard/FcmTokenSync";
import AdminAccessGuard from "@/components/Admin/AdminAccessGuard";
import { type ReactNode } from "react";

interface ParentLayoutProps {
  children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <>
      <AuthUserHydrate />
      <FcmTokenSync />
      <Layout segment={null} isAdmin={true}>
        <AdminAccessGuard>{children}</AdminAccessGuard>
      </Layout>
    </>
  );
}
