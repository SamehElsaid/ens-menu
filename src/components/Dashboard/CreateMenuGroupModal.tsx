"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { axiosPost } from "@/shared/axiosCall";
import { Field, Input } from "@/components/ui";
import type { Menu } from "@/types/Menu";
import { menusAvailableForGroup } from "@/lib/menuDeliveryGroups";
import {
  MenuGroupEmptyHint,
  MenuGroupModalFooter,
  MenuGroupModalShell,
  MenuGroupPickItem,
  MenuGroupPickList,
  MenuGroupSectionLabel,
} from "@/components/Dashboard/MenuGroupUi";

type CreateMenuGroupModalProps = {
  menus: Menu[];
  getMenuName: (menu: Menu) => string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateMenuGroupModal({
  menus,
  getMenuName,
  onClose,
  onCreated,
}: CreateMenuGroupModalProps) {
  const t = useTranslations("Menus.createGroupModal");
  const locale = useLocale();

  const availableMenus = useMemo(
    () => menusAvailableForGroup(menus),
    [menus],
  );

  const [name, setName] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMenu = (menuId: number) => {
    setSelectedIds((prev) =>
      prev.includes(menuId)
        ? prev.filter((id) => id !== menuId)
        : [...prev, menuId],
    );
  };

  const canSubmit =
    name.trim().length > 0 && selectedIds.length >= 2 && !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const res = await axiosPost<
        { name: string; menuIds: number[] },
        { group?: { id: number } }
      >("/menu-groups", locale, {
        name: name.trim(),
        menuIds: selectedIds,
      });

      if (res.status) {
        toast.success(t("success"));
        onCreated();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MenuGroupModalShell
      title={t("title")}
      subtitle={t("description")}
      onClose={onClose}
      closeLabel={t("cancel")}
      footer={
        <MenuGroupModalFooter
          cancelLabel={t("cancel")}
          submitLabel={t("submit")}
          onCancel={onClose}
          onSubmit={handleSubmit}
          loading={isSaving}
          disabled={!canSubmit}
          selectedCount={selectedIds.length}
          selectedCountLabel={t("selectedCount", { count: selectedIds.length })}
        />
      }
    >
      <div className="flex flex-col gap-5">
        <Field label={t("nameLabel")}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            data-autofocus
          />
        </Field>

        <div>
          <MenuGroupSectionLabel>{t("menusLabel")}</MenuGroupSectionLabel>

          {availableMenus.length < 2 ? (
            <MenuGroupEmptyHint>{t("needMoreMenus")}</MenuGroupEmptyHint>
          ) : (
            <MenuGroupPickList>
              {availableMenus.map((menu) => (
                <MenuGroupPickItem
                  key={menu.id}
                  menu={menu}
                  name={getMenuName(menu)}
                  selected={selectedIds.includes(menu.id)}
                  onToggle={() => toggleMenu(menu.id)}
                />
              ))}
            </MenuGroupPickList>
          )}
        </div>
      </div>
    </MenuGroupModalShell>
  );
}
