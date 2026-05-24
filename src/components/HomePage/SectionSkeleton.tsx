type SectionSkeletonProps = {
  height: string;
  id?: string;
};

export default function SectionSkeleton({ height, id }: SectionSkeletonProps) {
  return (
    <div
      id={id}
      aria-hidden
      className="home-section-skeleton w-full animate-pulse bg-slate-100 dark:bg-[#15203c]"
      style={{ minHeight: height }}
    />
  );
}
