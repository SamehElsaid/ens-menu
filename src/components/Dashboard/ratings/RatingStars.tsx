"use client";

import { IoStar, IoStarOutline } from "react-icons/io5";

type RatingStarsProps = {
  stars: number;
  sizeClassName?: string;
};

export default function RatingStars({
  stars,
  sizeClassName = "h-4 w-4",
}: RatingStarsProps) {
  const value = Math.min(5, Math.max(0, Math.round(Number(stars) || 0)));

  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) =>
        n <= value ? (
          <IoStar key={n} className={`${sizeClassName} text-amber-400`} />
        ) : (
          <IoStarOutline
            key={n}
            className={`${sizeClassName} text-slate-300 dark:text-slate-600`}
          />
        ),
      )}
    </span>
  );
}
