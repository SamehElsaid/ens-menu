"use client";

import { useEffect } from "react";
import { ExperienceProvider } from "./ExperienceContext";
import ExperienceProgress from "./ExperienceProgress";
import AiScene from "./scenes/AiScene";
import ArrivalScene from "./scenes/ArrivalScene";
import CartScene from "./scenes/CartScene";
import MenuScene from "./scenes/MenuScene";
import RevealScene from "./scenes/RevealScene";
import ScanScene from "./scenes/ScanScene";

export default function ExperienceHome() {
  useEffect(() => {
    document.documentElement.classList.add("experience-scroll");
    return () => {
      document.documentElement.classList.remove("experience-scroll");
    };
  }, []);

  return (
    <ExperienceProvider>
      <div className="experience-home relative w-full">
        <ExperienceProgress />
        <ArrivalScene />
        <ScanScene />
        <MenuScene />
        <AiScene />
        <CartScene />
        <RevealScene />
      </div>
    </ExperienceProvider>
  );
}
