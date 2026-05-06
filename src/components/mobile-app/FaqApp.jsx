"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiChevronDown,
  FiShield,
  FiZap,
  FiUsers,
  FiMonitor,
} from "react-icons/fi";

const icons = [FiShield, FiZap, FiUsers, FiMonitor];

const FaqApp = () => {
  const t = useTranslations("Landing.FaqApp");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const items = t.raw("items");
  const [open, setOpen] = useState(0);

  return (
    <section className="relative py-12 bg-white dark:bg-[#0d1117] overflow-hidden">
      
      {/* Glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-violet-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[0%] right-[5%] w-[30%] h-[30%] bg-indigo-500/10 blur-[100px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            const isOpen = open === i;
            const isFeatured = i === 0;

            return (
              <motion.div
                key={i}
                layout
                onClick={() => setOpen(isOpen ? null : i)}
                className={`group relative cursor-pointer rounded-3xl border p-6 transition-all duration-300 ${
                  isOpen
                    ? "bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-500/10 dark:to-indigo-500/10 border-violet-300 dark:border-violet-500/40 shadow-2xl shadow-violet-500/20 ring-2 ring-violet-500/20"
                    : isFeatured
                    ? "bg-gradient-to-br from-white to-violet-50/40 dark:from-slate-900 dark:to-violet-500/5 border-violet-300/70 dark:border-violet-500/30 ring-2 ring-violet-500/15 shadow-xl shadow-violet-500/15 scale-[1.02] hover:scale-[1.03] hover:shadow-2xl hover:shadow-violet-500/30 hover:-translate-y-1"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-1 hover:border-violet-200 dark:hover:border-violet-500/40"
                }`}
              >
                {/* Most Asked Badge */}
                {isFeatured && (
                  <span
                    className={`absolute -top-3 z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.15em] shadow-lg shadow-violet-500/40 ring-2 ring-white dark:ring-slate-900 ${
                      isRTL ? "left-4" : "right-4"
                    }`}
                  >
                    <span className="size-1.5 rounded-full bg-white animate-pulse" />
                    {t("mostAsked")}
                  </span>
                )}

                {/* Top */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-3 rounded-xl shrink-0 transition-colors duration-300 ${
                        isOpen || isFeatured
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
                          : "bg-slate-100 dark:bg-slate-800 text-violet-500 group-hover:bg-violet-100 dark:group-hover:bg-violet-500/20"
                      }`}
                    >
                      <Icon size={20} />
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-md leading-snug">
                      {item.q}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    className={`shrink-0 ${
                      isOpen ? "text-violet-600 dark:text-violet-400" : "text-slate-400 group-hover:text-violet-500"
                    }`}
                  >
                    <FiChevronDown size={20} />
                  </motion.div>
                </div>

                {/* Answer */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 text-slate-600 dark:text-slate-400 leading-relaxed text-sm"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqApp;