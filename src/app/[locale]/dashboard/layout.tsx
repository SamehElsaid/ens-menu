"use client";
import Layout from "@/components/Dashboard/Layout";
import { useSelectedLayoutSegment } from "next/navigation";
import { ReactNode } from "react";

export default function ParentLayout({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment();
  
  return <Layout segment={segment} >{children}</Layout>;
}
