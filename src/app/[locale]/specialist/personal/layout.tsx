"use client";

import { ReactNode } from "react";
import PersonalLayout from "@/components/dashboardControls/PersonalLayout";

function LayoutPersonal({ children }: { children: ReactNode }) {
  return (
      <PersonalLayout type="specialist">{children}</PersonalLayout>
  );
}

export default LayoutPersonal;
