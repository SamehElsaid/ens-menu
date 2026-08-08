"use client";

import { useState } from "react";
import { Controller, Resolver, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { IoPersonOutline } from "react-icons/io5";
import { FaUserShield } from "react-icons/fa";
import { Button, Field, Input, Modal } from "@/components/ui";
import {
  createAdministratorSchema,
  type AdministratorFormSchema,
} from "@/schemas/administratorSchema";
import AdminPermissionsEditor from "@/components/Admin/AdminPermissionsEditor";
import {
  setAdminPermissionsByEmail,
  removeAdminPermissionsByEmail,
} from "@/lib/adminPermissions";
import {
  ADMIN_PERMISSION_KEYS,
  type AdminPermissionKey,
} from "@/types/AdminPermission";

type AddAdministratorFormData = AdministratorFormSchema;

interface AddAdministratorModalProps {
  onClose: () => void;
  onRefresh?: () => void;
}

const ADMIN_FORM_ID = "add-administrator-form";

export default function AddAdministratorModal({
  onClose,
  onRefresh,
}: AddAdministratorModalProps) {
  const locale = useLocale();
  const t = useTranslations("adminAdministrators.addModal");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations(""); // Root-level translations for schema
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermissionKey[]>([
    ...ADMIN_PERMISSION_KEYS,
  ]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddAdministratorFormData>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    resolver: yupResolver(
      createAdministratorSchema(tAuth),
    ) as unknown as Resolver<AddAdministratorFormData>,
    mode: "onChange",
  });

  const onSubmit = async (data: AddAdministratorFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        permissions:
          permissions.length >= ADMIN_PERMISSION_KEYS.length
            ? null
            : permissions,
      };

      const result = await axiosPost<
        typeof payload,
        { id: number; name: string; email: string }
      >("/admin/admins", locale, payload);

      if (result.status && result.data) {
        if (permissions.length >= ADMIN_PERMISSION_KEYS.length) {
          removeAdminPermissionsByEmail(data.email.trim());
        } else {
          setAdminPermissionsByEmail(data.email.trim(), permissions);
        }
        toast.success(t("createSuccess"));
        reset();
        onClose();
        onRefresh?.();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t("title")}
      description={t("subtitle")}
      icon={<FaUserShield className="size-4.5" />}
      dismissible={!isSubmitting}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={ADMIN_FORM_ID}
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("creating") : t("create")}
          </Button>
        </>
      }
    >
      <form
        id={ADMIN_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-5"
      >
        <Field label={t("name")} error={errors.name?.message}>
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder={t("namePlaceholder")}
                startIcon={<IoPersonOutline />}
                data-autofocus
              />
            )}
          />
        </Field>

        <Field label={t("email")} error={errors.email?.message}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="email"
                placeholder={t("emailPlaceholder")}
                startIcon={<IoPersonOutline />}
              />
            )}
          />
        </Field>

        <Field label={t("password")} error={errors.password?.message}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="add-administrator-password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                startIcon={<IoPersonOutline />}
                autoComplete="new-password"
              />
            )}
          />
        </Field>

        <AdminPermissionsEditor
          value={permissions}
          onChange={setPermissions}
          disabled={isSubmitting}
        />
      </form>
    </Modal>
  );
}
