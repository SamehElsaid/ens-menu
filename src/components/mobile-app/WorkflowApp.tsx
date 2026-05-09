"use client";

import { useTranslations } from "next-intl";
import { FiBell, FiShoppingCart, FiCoffee, FiBarChart2 } from "react-icons/fi";

const icons = [FiBell, FiShoppingCart, FiCoffee, FiBarChart2] as const;

type WorkflowStep = { title: string; desc: string };

const WorkflowApp = () => {
  const t = useTranslations("Landing.WorkflowApp");

  const stepsRaw = t.raw("steps");
  const steps: WorkflowStep[] = Array.isArray(stepsRaw) ? (stepsRaw as WorkflowStep[]) : [];

  if (steps.length === 0) return null;

  return (
    <section className="relative py-12 bg-white dark:bg-[#0d1117] overflow-hidden">
      <div className="container mx-auto px-6 relative z-10 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
            {t("subtitle")}
          </p>
        </div>

        {/* Flow */}
        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-violet-500/30 via-indigo-500/30 to-transparent -translate-y-1/2" />

          {steps.map((step: WorkflowStep, i: number) => {
            const Icon = icons[i];

            return (
              <div
                key={i}
                className="relative flex flex-col items-center text-center"
              >
                {/* Circle */}
                <div className="relative z-10 w-16 h-16 flex items-center justify-center rounded-2xl bg-linear-to-br from-violet-600 to-indigo-600 text-white shadow-lg">
                  <Icon size={22} />
                </div>

                {/* Content */}
                <h3 className="mt-6 font-bold text-slate-900 dark:text-white">
                  {step.title}
                </h3>

                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkflowApp;
