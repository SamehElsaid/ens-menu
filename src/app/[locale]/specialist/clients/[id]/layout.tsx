import LayoutClient from "@/components/Dashboard/LayoutClient";
import { ReactNode } from "react";

interface LayoutClientPageProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}
export default function LayoutClientPage({
  children,
  params,
}: LayoutClientPageProps) {
  return <LayoutClient params={params}>{children}</LayoutClient>;
}
