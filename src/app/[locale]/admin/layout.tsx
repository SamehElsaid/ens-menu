"use client";

import Layout from "@/components/Dashboard/Layout";
import { AuthUserHydrate } from "@/components/Dashboard/AuthUserHydrate";
import { FcmTokenSync } from "@/components/Dashboard/FcmTokenSync";
import AuthSessionGate from "@/components/Global/AuthSessionGate";
import { type ReactNode } from "react";

interface ParentLayoutProps {
  children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <AuthSessionGate>
      <AuthUserHydrate />
      <FcmTokenSync />
      <Layout segment={null} isAdmin={true}>
        {children}
      </Layout>
    </AuthSessionGate>
  );
}
