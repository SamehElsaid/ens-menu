"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { IoCloseOutline } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";
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

  if (!open || !admin) return null;

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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <FaUserShield className="text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                {t("editTitle")}
              </h2>
              <p className="text-sm text-gray-500 truncate">{admin.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("close")}
          >
            <IoCloseOutline className="text-xl" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <AdminPermissionsEditor
            value={permissions}
            onChange={setPermissions}
          />
        </div>

        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            disabled={saving || permissions.length === 0}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-semibold disabled:opacity-50"
          >
            {saving ? t("saving") : t("save")}
          </button>
        </div>
      </div>
    </div>
  );
}
