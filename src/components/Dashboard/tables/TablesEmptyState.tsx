"use client";

import { useTranslations } from "next-intl";
import { MdOutlineTableBar } from "react-icons/md";
import { IoAddCircleOutline } from "react-icons/io5";
import { Button, EmptyState } from "@/components/ui";

interface TablesEmptyStateProps {
  onAdd: () => void;
}

export default function TablesEmptyState({ onAdd }: TablesEmptyStateProps) {
  const t = useTranslations("Tables");

  return (
    <EmptyState
      className="dashboard-tables-empty"
      icon={<MdOutlineTableBar aria-hidden />}
      title={t("noTables")}
      description={t("noTablesDescription")}
      action={
        <Button onClick={onAdd} startIcon={<IoAddCircleOutline />}>
          {t("addFirstTable")}
        </Button>
      }
    />
  );
}
