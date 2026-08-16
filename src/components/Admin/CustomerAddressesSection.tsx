"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaPlus, FaTrash, FaEdit, FaStar } from "react-icons/fa";
import {
  axiosDelete,
  axiosGet,
  axiosPut,
  axiosPost,
} from "@/shared/axiosCall";
import { FiAlertTriangle } from "react-icons/fi";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  SectionHeader,
} from "@/components/ui";
import type { UserAddress } from "@/types/AdminCustomer";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface Props {
  userId: number;
}

const FORM_ID = "customer-address-form";

const emptyForm = {
  label: "",
  addressLine: "",
  city: "",
  governorate: "",
  country: "",
  postalCode: "",
  isDefault: false,
};

export default function CustomerAddressesSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations(
    "adminUsers.userDetails.customerSections.addresses",
  );
  const tCommon = useTranslations("common");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { runApiAction } = useApiAction();

  const requestAddresses = useCallback(
    () =>
      axiosGet<{ addresses: UserAddress[] }>(
        `/admin/users/${userId}/addresses`,
        locale,
      ),
    [userId, locale],
  );
  const addressesQuery = useApiQuery({
    request: requestAddresses,
    errorToast: ({ error }) => error,
    onSuccess: (data) => setAddresses(data.addresses),
  });
  const loading = addressesQuery.loading;
  const load = addressesQuery.refetch;

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (addr: UserAddress) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? "",
      addressLine: addr.addressLine,
      city: addr.city ?? "",
      governorate: addr.governorate ?? "",
      country: addr.country ?? "",
      postalCode: addr.postalCode ?? "",
      isDefault: addr.isDefault,
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.addressLine.trim()) return;
    setSubmitting(true);
    try {
      const payload = { ...form };
      await runApiAction(
        () =>
          editingId
            ? axiosPut<typeof payload, { address: UserAddress }>(
                `/admin/users/${userId}/addresses/${editingId}`,
                locale,
                payload,
              )
            : axiosPost<typeof payload, { address: UserAddress }>(
                `/admin/users/${userId}/addresses`,
                locale,
                payload,
              ),
        {
          successToast: editingId ? t("updateSuccess") : t("createSuccess"),
          errorToast: t("saveError"),
          onSuccess: () => {
            setFormOpen(false);
            void load();
          },
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await runApiAction(
      () =>
        axiosDelete(`/admin/users/${userId}/addresses/${deleteId}`, locale),
      {
        successToast: t("deleteSuccess"),
        errorToast: t("deleteError"),
        onSuccess: () => {
          setDeleteId(null);
          void load();
        },
      },
    );
  };

  const setDefault = async (addr: UserAddress) => {
    await runApiAction(
      () =>
        axiosPut(`/admin/users/${userId}/addresses/${addr.id}`, locale, {
          isDefault: true,
        }),
      {
        successToast: t("defaultSuccess"),
        errorToast: ({ error }) => error,
        onSuccess: () => void load(),
      },
    );
  };

  return (
    <Card padded="lg">
      <SectionHeader
        title={t("title")}
        className="mb-4"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={openCreate}
            startIcon={<FaPlus />}
          >
            {t("add")}
          </Button>
        }
      />

      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : addresses.length === 0 ? (
        <EmptyState title={t("empty")} size="sm" />
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <Card
              as="li"
              key={addr.id}
              padded="md"
              className="flex flex-wrap justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="mb-1 flex items-center gap-2">
                  {addr.isDefault && (
                    <Badge tone="warning" icon={<FaStar />}>
                      {t("default")}
                    </Badge>
                  )}
                  {addr.label && (
                    <span className="text-sm font-semibold text-fg">
                      {addr.label}
                    </span>
                  )}
                </div>
                <p className="text-fg">{addr.addressLine}</p>
                <p className="text-sm text-fg-muted">
                  {[addr.city, addr.governorate, addr.country]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconOnly
                    aria-label={t("setDefault")}
                    onClick={() => setDefault(addr)}
                  >
                    <FaStar />
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  iconOnly
                  aria-label={t("edit")}
                  onClick={() => openEdit(addr)}
                >
                  <FaEdit />
                </Button>
                <Button
                  variant="dangerGhost"
                  size="sm"
                  iconOnly
                  aria-label={tCommon("delete")}
                  onClick={() => setDeleteId(addr.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingId ? t("edit") : t("add")}
        size="sm"
        dismissible={!submitting}
        closeLabel={tCommon("close")}
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setFormOpen(false)}
              disabled={submitting}
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              variant="primary"
              loading={submitting}
            >
              {t("save")}
            </Button>
          </>
        }
      >
        <form
          id={FORM_ID}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Field label={t("label")}>
            <Input
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
            />
          </Field>
          <Field label={t("addressLine")} required>
            <Input
              required
              value={form.addressLine}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressLine: e.target.value }))
              }
            />
          </Field>
          <Field label={t("city")}>
            <Input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            />
          </Field>
          <Field label={t("governorate")}>
            <Input
              value={form.governorate}
              onChange={(e) =>
                setForm((f) => ({ ...f, governorate: e.target.value }))
              }
            />
          </Field>
          <Checkbox
            label={t("setDefault")}
            checked={form.isDefault}
            onChange={(e) =>
              setForm((f) => ({ ...f, isDefault: e.target.checked }))
            }
          />
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmMessage")}
        confirmLabel={tCommon("delete")}
        cancelLabel={t("cancel")}
        tone="danger"
        icon={<FiAlertTriangle />}
      />
    </Card>
  );
}
