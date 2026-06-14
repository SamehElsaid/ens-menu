"use client";

import { IoAdd } from "react-icons/io5";

interface MobileFloatingAddButtonProps {
  label: string;
  onClick: () => void;
  id?: string;
}

export default function MobileFloatingAddButton({
  label,
  onClick,
  id,
}: MobileFloatingAddButtonProps) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={label}
      className="dashboard-mobile-fab fixed z-40 end-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] inline-flex min-h-[3.25rem] items-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-white shadow-[0_8px_30px_rgba(124,58,237,0.45)] transition-all duration-200 active:scale-[0.96] hover:opacity-95 md:hidden"
    >
      <span className="flex size-8 items-center justify-center rounded-xl bg-white/20">
        <IoAdd className="text-xl" aria-hidden />
      </span>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
