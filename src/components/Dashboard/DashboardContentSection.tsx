import type { ReactNode } from "react";

type DashboardContentSectionProps = {
  children: ReactNode;
};

export function DashboardContentSection({
  children,
}: DashboardContentSectionProps) {
  return (
    <section className="">
      <div className="">{children}</div>
    </section>
  );
}
