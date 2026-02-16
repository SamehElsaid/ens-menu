
import Layout from "@/components/Dashboard/Layout";
import { type ReactNode } from "react";

interface ParentLayoutProps {
    children: ReactNode;
}

export default function ParentLayout({ children }: ParentLayoutProps) {




    return <Layout segment={null} isAdmin={true} >{children}</Layout>;
}
