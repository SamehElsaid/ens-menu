"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { Button, Field, Input, Modal } from "@/components/ui";
import StaffPermissionsEditor from "./StaffPermissionsEditor";
import type { MenuStaffRole } from "@/types/Menu";
import { roleDisplayName } from "@/shared/roleDisplayName";
import {
  IoShieldCheckmarkOutline,
  IoAddCircleOutline,
} from "react-icons/io5";

interface AddRoleModalProps {
  role?: MenuStaffRole | null;
  /**
   * `duplicate` seeds the form from `role` but saves a brand new role — the way
   * to get an editable version of a read-only default role.
   */
  mode?: "edit" | "duplicate";
  onClose: () => void;
  onSaved?: () => void;
}

interface RoleErrorBody {
  errorEn?: string;
  errorAr?: string;
  error?: string;
  message?: string;
}

export default function AddRoleModal({
  role = null,
  mode = "edit",
  onClose,
  onSaved,
}: AddRoleModalProps) {
  const t = useTranslations("Roles.modal");
  const locale = useLocale();
  const isDuplicate = mode === "duplicate" && Boolean(role);
  const isEdit = Boolean(role?.id) && !isDuplicate;

  const [name, setName] = useState(() => {
    if (!role) return "";
    return isDuplicate ? t("copyName", { name: role.name }) : role.name;
  });
  const [nameEn, setNameEn] = useState(() => {
    const source = role?.nameEn?.trim();
    if (!source) return "";
    return isDuplicate ? t("copyName", { name: source }) : source;
  });
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? [],
  );
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSaving, setIsSaving] = useState(false);

  const onSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError(t("nameRequired"));
      return;
    }
    setNameError(undefined);
    setIsSaving(true);
    try {
      const payload = {
        name: trimmed,
        nameEn: nameEn.trim(),
        permissions,
      };
      const result = isEdit
        ? await axiosPatch<typeof payload, RoleErrorBody>(
            `/dashboard/staff-roles/${role!.id}`,
            locale,
            payload,
          )
        : await axiosPost<typeof payload, RoleErrorBody>(
            "/dashboard/staff-roles",
            locale,
            payload,
          );

      if (result.status) {
        toast.success(isEdit ? t("editSuccess") : t("createSuccess"));
        onSaved?.();
        onClose();
      } else {
        const body = result.data;
        const msg =
          (locale === "ar" ? body?.errorAr : body?.errorEn) ??
          body?.error ??
          body?.message;
        toast.error(msg || (isEdit ? t("editError") : t("createError")));
      }
    } catch {
      toast.error(isEdit ? t("editError") : t("createError"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={
        isDuplicate ? t("duplicateTitle") : isEdit ? t("editTitle") : t("title")
      }
      description={
        isDuplicate
          ? t("duplicateSubtitle", { name: roleDisplayName(role!, locale) })
          : t("subtitle")
      }
      icon={<IoShieldCheckmarkOutline className="size-5" />}
      dismissible={!isSaving}
      closeLabel={t("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void onSubmit()}
            loading={isSaving}
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {isEdit ? t("save") : t("create")}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <Field label={t("nameLabel")} required error={nameError}>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(undefined);
            }}
            placeholder={t("namePlaceholder")}
            data-autofocus
          />
        </Field>

        <Field label={t("nameEnLabel")} hint={t("nameEnHint")}>
          <Input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={t("nameEnPlaceholder")}
          />
        </Field>

        <div className="rounded-xl bg-surface-2 p-4">
          <StaffPermissionsEditor
            value={permissions}
            onChange={setPermissions}
            disabled={isSaving}
          />
        </div>
      </div>
    </Modal>
  );
}
