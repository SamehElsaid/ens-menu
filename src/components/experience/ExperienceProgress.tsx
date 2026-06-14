"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/cn";
import { useExperience } from "./ExperienceContext";
import { useExperienceScenes } from "./useExperienceScenes";

export default function ExperienceProgress() {
  const t = useTranslations("experienceHome");
  const { activeScene, setActiveScene } = useExperience();
  const scenes = useExperienceScenes();

  const scrollToScene = (index: number) => {
    const el = document.querySelector(`[data-scene="${index}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveScene(index);
  };

  return (
    <nav
      aria-label={t("progressAria")}
      className="pointer-events-none fixed end-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 lg:flex"
    >
      {scenes.map((sceneIndex) => (
        <button
          key={sceneIndex}
          type="button"
          onClick={() => scrollToScene(sceneIndex)}
          aria-label={`Scene ${sceneIndex + 1}`}
          aria-current={activeScene === sceneIndex ? "step" : undefined}
          className={cn(
            "pointer-events-auto h-2 w-2 rounded-full transition-all duration-300",
            activeScene === sceneIndex
              ? "scale-125 bg-purple-600 dark:bg-purple-400"
              : "bg-slate-300/80 hover:bg-purple-400/60 dark:bg-slate-600",
          )}
        />
      ))}
    </nav>
  );
}
