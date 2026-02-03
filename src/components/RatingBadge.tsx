function RatingBadge({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full  bg-white/90 px-3 py-1 text-sm font-semibold ">
      <svg
        className="h-4 w-4 text-yellow-400"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 2.5 14.9 9l6.6.5-5 4.3 1.5 6.5L12 16.7 6 20.3 7.5 13.8l-5-4.3 6.6-.5z" />
      </svg>
      {rating.toFixed(1)}
    </span>
  );
}
export default RatingBadge;
