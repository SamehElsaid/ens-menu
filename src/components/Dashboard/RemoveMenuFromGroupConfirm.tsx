"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import type { Menu } from "@/types/Menu";
import { resolveMenuGroupMeta } from "@/lib/menuDeliveryGroups";
import { updateMenuGroupMembership } from "@/lib/menuGroupActions";
import {
  MenuGroupModalFooter,
  MenuGroupModalShell,
  MenuGroupMenuPreview,
} from "@/components/Dashboard/MenuGroupUi";

type RemoveMenuFromGroupConfirmProps = {
  menu: Menu;
  menus: Menu[];
  getMenuName: (menu: Menu) => string;
  onClose: () => void;
  onRemoved: () => void;
};

export default function RemoveMenuFromGroupConfirm({
  menu,
  menus,
  getMenuName,
  onClose,
  onRemoved,
}: RemoveMenuFromGroupConfirmProps) {
  const t = useTranslations("Menus.removeFromGroupModal");
  const locale = useLocale();
  const [isSaving, setIsSaving] = useState(false);

  const groupMeta = resolveMenuGroupMeta(menu);
  const menuName = getMenuName(menu);
  const groupName = groupMeta.groupName ?? "";
  const memberCount = groupMeta.memberCount ?? 0;
  const willDissolveGroup = memberCount <= 2;

  const handleConfirm = async () => {
    if (!groupMeta.groupId || isSaving) return;
    setIsSaving(true);
    try {
      const groupMenuIds = menus
        .filter((m) => m.menuGroupId === groupMeta.groupId)
        .map((m) => m.id);
      const remainingIds = groupMenuIds.filter((id) => id !== menu.id);

      const res = await updateMenuGroupMembership(
        locale,
        groupMeta.groupId,
        remainingIds,
      );

      if (res.status) {
        toast.success(willDissolveGroup ? t("successDissolved") : t("success"));
        onRemoved();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MenuGroupModalShell
      title={t("title")}
      subtitle={
        willDissolveGroup
          ? t("descriptionDissolve", { name: menuName, group: groupName })
          : t("description", { name: menuName, group: groupName })
      }
      onClose={onClose}
      closeLabel={t("cancel")}
      maxWidth="md"
      footer={
        <MenuGroupModalFooter
          cancelLabel={t("cancel")}
          submitLabel={t("submit")}
          onCancel={onClose}
          onSubmit={handleConfirm}
          loading={isSaving}
          disabled={isSaving}
        />
      }
    >
      <MenuGroupMenuPreview menu={menu} name={menuName} />
    </MenuGroupModalShell>
  );
}
