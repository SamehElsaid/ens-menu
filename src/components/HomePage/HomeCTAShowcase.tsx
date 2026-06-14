"use client";

import { Link } from "@/i18n/navigation";

export type HomeCTAShowcaseProps = {
  title: string;
  description: string;
  ctaLabel: string;
};

export default function HomeCTAShowcase({
  title,
  description,
  ctaLabel,
}: HomeCTAShowcaseProps) {
  return (
    <div className="home-pre-footer-cta mx-auto flex max-w-2xl flex-col items-center px-1 text-center">
      <h2 className="text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
        {title}
      </h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate-400 sm:mt-3.5 sm:text-base">
        {description}
      </p>
      <div className="relative mt-8 w-full sm:mt-9 lg:mt-10 lg:w-auto">
        <span
          aria-hidden
          className="home-pre-footer-cta__glow pointer-events-none absolute left-1/2 top-1/2 -z-10 h-16 w-[min(100%,18rem)] -translate-x-1/2 -translate-y-1/2 rounded-full lg:w-[14rem]"
        />
        <Link
          href="/auth/register"
          prefetch={false}
          className="home-cta-btn-primary flex w-full items-center justify-center rounded-full px-8 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_40px_-10px_rgba(124,58,237,0.55)] transition-transform hover:scale-[1.02] lg:mx-auto lg:inline-flex lg:min-w-[15.5rem] lg:w-auto"
        >
          {ctaLabel}
        </Link>
      </div>
    </div>
  );
}
