"use client";

import HeroProductThumb from "@/components/HomePage/HeroProductThumb";
import { cn } from "@/lib/cn";

export type CtaMenuItem = {
  name: string;
  price: string;
  image: string;
};

type CtaPhoneMockupProps = {
  restaurantName: string;
  items: CtaMenuItem[];
  addLabel: string;
  className?: string;
};

function QrMini({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn("text-slate-900", className)} aria-hidden>
      <rect width="64" height="64" fill="white" rx="4" />
      <rect x="5" y="5" width="16" height="16" fill="currentColor" />
      <rect x="43" y="5" width="16" height="16" fill="currentColor" />
      <rect x="5" y="43" width="16" height="16" fill="currentColor" />
      <rect x="28" y="28" width="5" height="5" fill="currentColor" />
      <rect x="40" y="40" width="8" height="8" fill="currentColor" />
    </svg>
  );
}

export default function CtaPhoneMockup({
  restaurantName,
  items,
  addLabel,
  className,
}: CtaPhoneMockupProps) {
  return (
    <div
      className={cn(
        "cta-phone-stage relative mx-auto w-full max-w-[13.5rem] sm:max-w-[15rem] lg:max-w-[17.5rem]",
        className,
      )}
    >
      <div
        aria-hidden
        className="cta-phone-pedestal pointer-events-none absolute inset-x-[12%] bottom-0 h-8 rounded-[100%] bg-purple-500/25 blur-2xl"
      />
      <div
        aria-hidden
        className="cta-phone-ring pointer-events-none absolute inset-x-[8%] bottom-1 h-3 rounded-full border border-purple-400/50 bg-purple-500/10 shadow-[0_0_28px_6px_rgba(124,58,237,0.35)]"
      />

      <div className="cta-qr-float absolute -end-3 top-[14%] z-20 hidden w-[4.5rem] rounded-xl border border-white/15 bg-[#0f1219]/95 p-1.5 shadow-[0_16px_40px_-12px_rgba(124,58,237,0.45)] backdrop-blur-md sm:-end-6 sm:top-[18%] sm:block sm:w-[5.25rem] sm:p-2">
        <p className="text-center text-[6px] font-bold tracking-wider text-purple-400">ENSMENU</p>
        <QrMini className="mx-auto mt-1 h-11 w-11 sm:h-12 sm:w-12" />
        <p className="mt-1 text-center text-[5.5px] font-medium text-slate-400">Powered by AI</p>
      </div>

      <div className="cta-phone-glow pointer-events-none absolute inset-0 rounded-[2.2rem] bg-purple-500/20 blur-3xl" />

      <div className="cta-phone-device relative mx-auto overflow-hidden rounded-[2rem] border border-white/15 bg-[#0a0c12] p-1.5 shadow-[0_28px_70px_-24px_rgba(124,58,237,0.55)]">
        <div className="overflow-hidden rounded-[1.65rem] bg-[#11141c]">
          <div className="border-b border-white/8 bg-[#151922] px-3 py-2.5 text-center">
            <p className="truncate text-[11px] font-semibold text-white">{restaurantName}</p>
          </div>
          <ul className="space-y-2.5 p-3">
            {items.map((item) => (
              <li
                key={item.name}
                className="flex items-center gap-2.5 rounded-xl border border-white/6 bg-white/[0.03] p-2"
              >
                <HeroProductThumb src={item.image} alt={item.name} />
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate text-[10px] font-medium text-white">{item.name}</p>
                  <p className="text-[9px] font-semibold tabular-nums text-purple-300">
                    {item.price}
                  </p>
                </div>
                <span className="shrink-0 rounded-md bg-purple-600 px-1.5 py-0.5 text-[8px] font-semibold text-white">
                  {addLabel}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
