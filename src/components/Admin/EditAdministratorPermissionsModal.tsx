"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaUserShield } from "react-icons/fa";
import { Button, Modal } from "@/components/ui";
import AdminPermissionsEditor from "@/components/Admin/AdminPermissionsEditor";
import {
  ADMIN_PERMISSION_KEYS,
  type AdminPermissionKey,
} from "@/types/AdminPermission";
import { axiosPatch } from "@/shared/axiosCall";
import { useApiAction } from "@/hooks/useApiAction";

type EditAdministratorPermissionsModalProps = {
  open: boolean;
  onClose: () => void;
  admin: {
    id: number;
    name: string;
    email: string;
    permissions?: AdminPermissionKey[] | null;
  } | null;
  isCurrentUser?: boolean;
  onSaved?: () => void;
};

export default function EditAdministratorPermissionsModal({
  open,
  onClose,
  admin,
  isCurrentUser = false,
  onSaved,
}: EditAdministratorPermissionsModalProps) {
  const locale = useLocale();
  const t = useTranslations("adminAdministrators.permissions");
  const { runApiAction } = useApiAction();
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>([
    ...ADMIN_PERMISSION_KEYS,
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !admin) return;
    setPermissions(admin.permissions ?? [...ADMIN_PERMISSION_KEYS]);
  }, [open, admin]);

  if (!admin) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        permissions:
          permissions.length >= ADMIN_PERMISSION_KEYS.length
            ? null
            : permissions,
      };
      await runApiAction(
        () =>
          axiosPatch<typeof payload, { id: number }>(
            `/admin/admins/${admin.id}/permissions`,
            locale,
            payload,
          ),
        {
          successToast: t("saveSuccess"),
          errorToast: ({ error }) => error,
          onSuccess: () => {
            onClose();
            onSaved?.();
            if (isCurrentUser) {
              window.location.reload();
            }
          },
        },
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("editTitle")}
      description={admin.name}
      icon={<FaUserShield />}
      iconTone="brand"
      size="md"
      dismissible={!saving}
      closeLabel={t("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            onClick={() => void handleSave()}
            loading={saving}
            disabled={permissions.length === 0}
          >
            {saving ? t("saving") : t("save")}
          </Button>
        </>
      }
    >
      <AdminPermissionsEditor value={permissions} onChange={setPermissions} />
    </Modal>
  );
}
