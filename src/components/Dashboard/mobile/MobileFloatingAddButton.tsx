"use client";

import { IoAdd } from "react-icons/io5";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";

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
    <Button
      id={id}
      type="button"
      onClick={onClick}
      aria-label={label}
      startIcon={<IoAdd className="size-5" />}
      className={cn(
        "dashboard-mobile-fab fixed z-40 end-4 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] md:hidden",
        "rounded-lg shadow-md",
      )}
    >
      {label}
    </Button>
  );
}
