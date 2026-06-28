"use client";

import { useEffect, useState, useRef } from "react";
import { useLocale } from "next-intl";
import { FiSend, FiZap } from "react-icons/fi";

// Target: one week from June 28 2026
const LAUNCH_TARGET = new Date("2026-07-14T00:00:00");

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(): TimeLeft {
  const diff = LAUNCH_TARGET.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

interface SegmentProps {
  value: number;
  label: string;
  prevValue: number;
}

function Segment({ value, label, prevValue }: SegmentProps) {
  const [animKey, setAnimKey] = useState(0);
  const prev = useRef(prevValue);

  useEffect(() => {
    if (prev.current !== value) {
      setAnimKey((k) => k + 1);
      prev.current = value;
    }
  }, [value]);

  return (
    <div className="flex flex-col items-center gap-2 sm:gap-3">
      <div className="relative">
        {/* Glow ring */}
        <div className="absolute -inset-1.5 rounded-2xl bg-linear-to-br from-violet-500/40 via-indigo-500/30 to-blue-500/20 blur-md" />

        <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center">
          {/* Shine line */}
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-slate-800/60 to-slate-900/80" />
          {/* Divider */}
          <div className="absolute top-1/2 left-3 right-3 h-px bg-black/30" />

          <span
            key={animKey}
            className="relative z-10 text-2xl sm:text-3xl md:text-4xl font-black text-white tabular-nums leading-none animate-tick"
          >
            {pad(value)}
          </span>
        </div>
      </div>

      <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase text-violet-600/70">
        {label}
      </span>
    </div>
  );
}

function Colon() {
  return (
    <div className="flex flex-col gap-1.5 mb-7 sm:mb-8">
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse [animation-delay:0.3s]" />
    </div>
  );
}

export default function CountdownLaunch() {
  const locale = useLocale();
  const isRTL = locale === "ar";

  const [time, setTime] = useState<TimeLeft>(getTimeLeft);
  const prevTime = useRef<TimeLeft>(time);

  useEffect(() => {
    const id = setInterval(() => {
      prevTime.current = { ...time };
      setTime(getTimeLeft());
    }, 1000);
    return () => clearInterval(id);
  });

  const labels =
    isRTL
      ? { days: "أيام", hours: "ساعات", minutes: "دقائق", seconds: "ثواني" }
      : { days: "Days", hours: "Hours", minutes: "Mins", seconds: "Secs" };

  const isLaunched =
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0;

  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-white">
      {/* Background layer */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-linear-to-r from-transparent via-violet-300/60 to-transparent" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-1 bg-linear-to-r from-transparent via-indigo-300/40 to-transparent" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-violet-100/60 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-100/50 blur-[100px]" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(139,92,246,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="container mx-auto px-6 relative z-10 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-black uppercase tracking-widest mb-8 shadow-sm">
          <FiSend className="animate-bounce" size={14} />
          {isRTL ? "الإطلاق قريبًا" : "Launching Soon"}
        </div>

        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight leading-tight ${isRTL ? "font-arabic" : ""}`}
        >
          {isRTL ? (
            <>
              تطبيق الموظفين يُطلق خلال{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-500">
                أسبوع
              </span>
            </>
          ) : (
            <>
              Staff App launching in{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-violet-600 to-indigo-500">
                one week
              </span>
            </>
          )}
        </h2>

        <p className="text-slate-500 text-base sm:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          {isRTL
            ? "كن من أوائل المستخدمين وجرّب تجربة إدارة مطعمك من موبايلك."
            : "Be among the first to manage your restaurant right from your pocket."}
        </p>

        {isLaunched ? (
          <div className="inline-flex items-center gap-3 px-8 py-5 rounded-2xl bg-linear-to-r from-violet-600 to-indigo-600 text-white text-xl font-black shadow-2xl shadow-violet-500/30 animate-pulse">
            <FiZap size={24} />
            {isRTL ? "انطلق! 🚀" : "We're Live! 🚀"}
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 sm:gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <Segment value={time.days} prevValue={prevTime.current.days} label={labels.days} />
            <Colon />
            <Segment value={time.hours} prevValue={prevTime.current.hours} label={labels.hours} />
            <Colon />
            <Segment value={time.minutes} prevValue={prevTime.current.minutes} label={labels.minutes} />
            <Colon />
            <Segment value={time.seconds} prevValue={prevTime.current.seconds} label={labels.seconds} />
          </div>
        )}

        {/* Progress bar */}
        <div className="mt-12 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-slate-500 font-bold mb-2">
            <span>{isRTL ? "الآن" : "Now"}</span>
            <span>{isRTL ? "الإطلاق" : "Launch"}</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-linear-to-r from-violet-600 via-indigo-500 to-blue-500 transition-all duration-1000 ease-linear shadow-lg shadow-violet-500/40"
              style={{
                width: `${Math.max(
                  0,
                  100 -
                    ((LAUNCH_TARGET.getTime() - Date.now()) /
                      (7 * 24 * 60 * 60 * 1000)) *
                      100
                ).toFixed(2)}%`,
              }}
            />
          </div>
        </div>

        {/* Decorative dots */}
        <div className="mt-12 flex items-center justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-violet-500/40"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes tick {
          0%   { opacity: 0; transform: translateY(-6px) scale(0.92); }
          60%  { opacity: 1; transform: translateY(1px) scale(1.04); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-tick { animation: tick 0.35s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>
    </section>
  );
}
