"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type HomeDelayedFooterProps = {
  children: React.ReactNode;
};

export default function HomeDelayedFooter({ children }: HomeDelayedFooterProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const sentinel = document.getElementById("home-footer-reveal");
    if (!sentinel) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { rootMargin: "120px 0px 0px 0px", threshold: 0 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        id="home-footer-reveal"
        aria-hidden
        className="pointer-events-none h-[min(68vh,600px)] w-full"
      />
      <div
        className={cn(
          "transition-[opacity,transform] duration-700 ease-out",
          visible
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        {children}
      </div>
    </>
  );
}
