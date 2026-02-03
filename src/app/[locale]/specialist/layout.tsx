import Layout from "@/components/Dashboard/Layout";
import { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}
