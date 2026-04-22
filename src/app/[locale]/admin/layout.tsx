import Layout from "@/components/Dashboard/Layout";
import { AuthUserHydrate } from "@/components/Dashboard/AuthUserHydrate";
import { type ReactNode } from "react";

interface ParentLayoutProps {
  children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {
  return (
    <>
      <AuthUserHydrate />
      <Layout segment={null} isAdmin={true}>
        {children}
      </Layout>
    </>
  );
}
