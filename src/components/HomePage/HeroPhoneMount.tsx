"use client";

import dynamic from "next/dynamic";

const HeroInteractivePhone = dynamic(
  () => import("@/components/HomePage/HeroInteractivePhone"),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto w-full max-w-[340px] rounded-[50px] bg-slate-100 dark:bg-slate-800"
        style={{ height: "560px" }}
        aria-hidden
      />
    ),
  },
);

export default function HeroPhoneMount() {
  return <HeroInteractivePhone />;
}
