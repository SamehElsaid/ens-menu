"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FaUserShield } from "react-icons/fa";
import { Button, Modal } from "@/components/ui";
import AdminPermissionsEditor from "@/components/Admin/AdminPermissionsEditor";
import {
  getAdminPermissionsByEmail,
  removeAdminPermissionsByEmail,
  setAdminPermissionsByEmail,
} from "@/lib/adminPermissions";
import {
  ADMIN_PERMISSION_KEYS,
  type AdminPermissionKey,
} from "@/types/AdminPermission";
import { toast } from "react-toastify";

type EditAdministratorPermissionsModalProps = {
  open: boolean;
  onClose: () => void;
  admin: { id: number; name: string; email: string } | null;
  isCurrentUser?: boolean;
};

export default function EditAdministratorPermissionsModal({
  open,
  onClose,
  admin,
  isCurrentUser = false,
}: EditAdministratorPermissionsModalProps) {
  const t = useTranslations("adminAdministrators.permissions");
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>([
    ...ADMIN_PERMISSION_KEYS,
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !admin) return;
    const stored = getAdminPermissionsByEmail(admin.email);
    setPermissions(stored ?? [...ADMIN_PERMISSION_KEYS]);
  }, [open, admin]);

  if (!admin) return null;

  const handleSave = () => {
    setSaving(true);
    try {
      if (permissions.length >= ADMIN_PERMISSION_KEYS.length) {
        removeAdminPermissionsByEmail(admin.email);
      } else {
        setAdminPermissionsByEmail(admin.email, permissions);
      }
      toast.success(t("saveSuccess"));
      onClose();
      if (isCurrentUser) {
        window.location.reload();
      }
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
            onClick={handleSave}
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
