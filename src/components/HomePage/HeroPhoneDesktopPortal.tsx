"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const HeroInteractivePhone = dynamic(
  () => import("@/components/HomePage/HeroInteractivePhone"),
  {
    ssr: false,
    loading: () => (
      <div
        className="mx-auto w-full max-w-[340px] animate-pulse rounded-[50px] bg-slate-100 dark:bg-slate-800"
        style={{ height: "560px" }}
        aria-hidden
      />
    ),
  },
);

export default function HeroPhoneDesktopPortal() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  if (!isDesktop) {
    return null;
  }

  return (
    <section
      id="hero-phone-desktop"
      aria-label="Menu preview"
      className="hidden bg-white py-16 lg:block dark:bg-[#0d1117]"
    >
      <div className="container mx-auto flex justify-center px-6">
        <HeroInteractivePhone />
      </div>
    </section>
  );
}
