"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { axiosPost } from "@/shared/axiosCall";
import { Alert } from "@/components/ui";
import { updateMenuGroupMembership } from "@/lib/menuGroupActions";
import type { Menu } from "@/types/Menu";
import type { MenuGroupSummary } from "@/lib/menuDeliveryGroups";
import { menusAvailableToJoinGroup } from "@/lib/menuDeliveryGroups";
import {
  MenuGroupEmptyHint,
  MenuGroupGroupOption,
  MenuGroupMenuPreview,
  MenuGroupModalFooter,
  MenuGroupModalShell,
  MenuGroupPickItem,
  MenuGroupPickList,
  MenuGroupSectionLabel,
} from "@/components/Dashboard/MenuGroupUi";

type AddMenuToGroupModalProps = {
  menu: Menu;
  groups: MenuGroupSummary[];
  getMenuName: (menu: Menu) => string;
  onClose: () => void;
  onSaved: () => void;
};

export default function AddMenuToGroupModal({
  menu,
  groups,
  getMenuName,
  onClose,
  onSaved,
}: AddMenuToGroupModalProps) {
  const t = useTranslations("Menus.addToGroupModal");
  const locale = useLocale();

  const [selectedGroupId, setSelectedGroupId] = useState<number>(
    groups.length === 1 ? groups[0]!.id : 0,
  );
  const [isSaving, setIsSaving] = useState(false);

  const canSubmit = selectedGroupId > 0 && !isSaving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const res = await axiosPost<{ menuId: number }, { group?: { id: number } }>(
        `/menu-groups/${selectedGroupId}/menus`,
        locale,
        { menuId: menu.id },
      );

      if (res.status) {
        toast.success(t("success"));
        onSaved();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  const menuName = getMenuName(menu);

  return (
    <MenuGroupModalShell
      title={t("title")}
      subtitle={t("description", { name: menuName })}
      onClose={onClose}
      closeLabel={t("cancel")}
      maxWidth="md"
      footer={
        <MenuGroupModalFooter
          cancelLabel={t("cancel")}
          submitLabel={t("submit")}
          onCancel={onClose}
          onSubmit={handleSubmit}
          loading={isSaving}
          disabled={!canSubmit}
        />
      }
    >
      <MenuGroupMenuPreview menu={menu} name={menuName} />

      <MenuGroupSectionLabel>{t("pickGroup")}</MenuGroupSectionLabel>
      <div className="flex flex-col gap-2">
        {groups.map((group) => (
          <MenuGroupGroupOption
            key={group.id}
            name={group.name}
            memberCount={t("memberCount", { count: group.menuIds.length })}
            selected={selectedGroupId === group.id}
            onSelect={() => setSelectedGroupId(group.id)}
            nameAttr="menuGroupPick"
          />
        ))}
      </div>
    </MenuGroupModalShell>
  );
}

type ManageMenuGroupModalProps = {
  group: MenuGroupSummary;
  menus: Menu[];
  getMenuName: (menu: Menu) => string;
  onClose: () => void;
  onSaved: () => void;
};

export function ManageMenuGroupModal({
  group,
  menus,
  getMenuName,
  onClose,
  onSaved,
}: ManageMenuGroupModalProps) {
  const t = useTranslations("Menus.manageGroupModal");
  const locale = useLocale();

  const addableMenus = useMemo(
    () => menusAvailableToJoinGroup(menus),
    [menus],
  );

  const [selectedIds, setSelectedIds] = useState<number[]>(() => [
    ...group.menuIds,
  ]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleMenu = (menuId: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId);
      }
      return [...prev, menuId];
    });
  };

  const allSelectable = useMemo(() => {
    const inGroup = menus.filter((m) => group.menuIds.includes(m.id));
    return [...inGroup, ...addableMenus];
  }, [menus, group.menuIds, addableMenus]);

  const hasChanges =
    selectedIds.length !== group.menuIds.length ||
    selectedIds.some((id) => !group.menuIds.includes(id));

  const willDissolveGroup = selectedIds.length < 2;
  const canSubmit = !isSaving && hasChanges && (selectedIds.length >= 2 || willDissolveGroup);

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSaving(true);
    try {
      const res = await updateMenuGroupMembership(
        locale,
        group.id,
        selectedIds,
      );

      if (res.status) {
        toast.success(willDissolveGroup ? t("successDissolved") : t("success"));
        onSaved();
        onClose();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MenuGroupModalShell
      title={t("title", { name: group.name })}
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
      {addableMenus.length === 0 ? (
        <MenuGroupEmptyHint>{t("noMoreMenusHint")}</MenuGroupEmptyHint>
      ) : null}
      <MenuGroupPickList>
        {allSelectable.map((menuItem) => (
          <MenuGroupPickItem
            key={menuItem.id}
            menu={menuItem}
            name={getMenuName(menuItem)}
            selected={selectedIds.includes(menuItem.id)}
            onToggle={() => toggleMenu(menuItem.id)}
            badge={
              group.menuIds.includes(menuItem.id) ? t("inGroupBadge") : undefined
            }
          />
        ))}
      </MenuGroupPickList>
      {willDissolveGroup && hasChanges ? (
        <Alert tone="warning" className="mt-3">
          {t("dissolveWarning")}
        </Alert>
      ) : null}
    </MenuGroupModalShell>
  );
}
