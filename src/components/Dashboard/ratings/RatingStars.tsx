"use client";

import { IoStar, IoStarHalf, IoStarOutline } from "react-icons/io5";

type RatingStarsProps = {
  stars: number;
  sizeClassName?: string;
  /** When true, show half stars for fractional averages. */
  precise?: boolean;
};

export default function RatingStars({
  stars,
  sizeClassName = "h-4 w-4",
  precise = false,
}: RatingStarsProps) {
  const raw = Math.min(5, Math.max(0, Number(stars) || 0));
  const value = precise ? Math.round(raw * 2) / 2 : Math.round(raw);

  return (
    <span className="inline-flex items-center gap-0.5" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => {
        if (value >= n) {
          return <IoStar key={n} className={`${sizeClassName} text-accent`} />;
        }
        if (precise && value >= n - 0.5) {
          return (
            <IoStarHalf key={n} className={`${sizeClassName} text-accent`} />
          );
        }
        return (
          <IoStarOutline
            key={n}
            className={`${sizeClassName} text-fg-subtle/50`}
          />
        );
      })}
    </span>
  );
}
