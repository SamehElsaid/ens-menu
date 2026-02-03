import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useLocale } from "next-intl";

interface StepNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  backLabel?: string;
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onBack,
  isNextDisabled = false,
  nextLabel = "Next",
  backLabel = "Back",
}: StepNavigationProps) {
  const locale = useLocale();
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={onBack}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
           "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200/60"
        }`}
      >
        <FaArrowLeft className={`${locale === "ar" ? "rotate-180" : ""}`} />
        {backLabel}
      </button>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full transition-all duration-300 ${
              index + 1 === currentStep
                ? "w-10 bg-linear-to-r from-primary to-secondary shadow-sm"
                : index + 1 < currentStep
                ? "w-4 bg-primary/70"
                : "w-2 bg-gray-300"
            }`}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isNextDisabled}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
          isNextDisabled
            ? "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
            : "btn-gradient-primary shadow-md hover:shadow-lg"
        }`}
      >
        {nextLabel}
        <FaArrowRight className={`${locale === "ar" ? "rotate-180" : ""}`} />
      </button>
    </div>
  );
}
