"use client";

import { useState } from "react";
import { DEFAULT_MENU_ITEM_IMAGE_SRC } from "@/components/menuItemImage";

type HeroProductThumbProps = {
  src: string;
  alt: string;
};

export default function HeroProductThumb({ src, alt }: HeroProductThumbProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={DEFAULT_MENU_ITEM_IMAGE_SRC}
          alt=""
          aria-hidden
          className="h-full w-full object-cover opacity-60"
        />
      </div>
    );
  }

  return (
    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover object-center"
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  );
}
