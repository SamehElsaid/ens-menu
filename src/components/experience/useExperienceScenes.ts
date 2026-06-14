"use client";

import { useEffect, useState } from "react";

/** Desktop includes AI scene (index 3); mobile skips it — AI lives in the menu bar. */
export const DESKTOP_SCENES = [0, 1, 2, 3, 4, 5] as const;
export const MOBILE_SCENES = [0, 1, 2, 4, 5] as const;

export function useExperienceScenes() {
  const [scenes, setScenes] = useState<readonly number[]>(DESKTOP_SCENES);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      setScenes(mq.matches ? DESKTOP_SCENES : MOBILE_SCENES);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return scenes;
}
