"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useExperience } from "./ExperienceContext";

type ExperienceSceneProps = {
  index: number;
  children: ReactNode;
  className?: string;
  /** Shorter on mobile for faster pacing */
  height?: "full" | "compact" | "tall";
  id?: string;
};

const heightClass = {
  full: "min-h-[100dvh]",
  compact: "min-h-[52dvh] lg:min-h-[100dvh]",
  tall: "min-h-[100dvh] lg:min-h-[100dvh]",
};

export default function ExperienceScene({
  index,
  children,
  className,
  height = "full",
  id,
}: ExperienceSceneProps) {
  const ref = useRef<HTMLElement>(null);
  const { setActiveScene } = useExperience();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          setActiveScene(index);
        }
      },
      { threshold: [0.45, 0.6] },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [index, setActiveScene]);

  return (
    <section
      ref={ref}
      id={id}
      data-scene={index}
      className={cn(
        "experience-scene relative flex w-full snap-start snap-always flex-col",
        heightClass[height],
        className,
      )}
    >
      {children}
    </section>
  );
}
