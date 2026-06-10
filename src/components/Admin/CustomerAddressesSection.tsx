"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaPlus, FaTrash, FaEdit, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
} from "@/shared/axiosCall";
import CardDashBoard from "@/components/Card/CardDashBoard";
import ConfirmationModal from "@/components/Custom/ConfirmationModal";
import type { UserAddress } from "@/types/AdminCustomer";

interface Props {
  userId: number;
}

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
  const t = useTranslations("adminUsers.userDetails.customerSections.addresses");
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<{ addresses: UserAddress[] }>(
        `/admin/users/${userId}/addresses`,
        locale,
      );
      if (result.status && result.data) {
        setAddresses(result.data.addresses);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    load();
  }, [load]);

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
      const result = editingId
        ? await axiosPatch<typeof payload, { address: UserAddress }>(
            `/admin/users/${userId}/addresses/${editingId}`,
            locale,
            payload,
          )
        : await axiosPost<typeof payload, { address: UserAddress }>(
            `/admin/users/${userId}/addresses`,
            locale,
            payload,
          );
      if (result.status) {
        toast.success(editingId ? t("updateSuccess") : t("createSuccess"));
        setFormOpen(false);
        load();
      } else {
        toast.error(t("saveError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const result = await axiosDelete(
      `/admin/users/${userId}/addresses/${deleteId}`,
      locale,
    );
    if (result.status) {
      toast.success(t("deleteSuccess"));
      setDeleteId(null);
      load();
    } else {
      toast.error(t("deleteError"));
    }
  };

  const setDefault = async (addr: UserAddress) => {
    const result = await axiosPatch<{ isDefault: boolean }, unknown>(
      `/admin/users/${userId}/addresses/${addr.id}`,
      locale,
      { isDefault: true },
    );
    if (result.status) {
      toast.success(t("defaultSuccess"));
      load();
    }
  };

  return (
    <CardDashBoard>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {t("title")}
        </h2>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold"
        >
          <FaPlus /> {t("add")}
        </button>
      </div>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : addresses.length === 0 ? (
        <p className="text-slate-500">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {addr.isDefault && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                      <FaStar /> {t("default")}
                    </span>
                  )}
                  {addr.label && (
                    <span className="text-sm font-semibold">{addr.label}</span>
                  )}
                </div>
                <p className="text-slate-700 dark:text-slate-300">{addr.addressLine}</p>
                <p className="text-sm text-slate-500">
                  {[addr.city, addr.governorate, addr.country]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={() => setDefault(addr)}
                    className="p-2 rounded-lg bg-amber-100 text-amber-700"
                    title={t("setDefault")}
                  >
                    <FaStar />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => openEdit(addr)}
                  className="p-2 rounded-lg bg-blue-100 text-blue-700"
                >
                  <FaEdit />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteId(addr.id)}
                  className="p-2 rounded-lg bg-red-100 text-red-700"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-3"
          >
            <h3 className="text-lg font-bold">{editingId ? t("edit") : t("add")}</h3>
            <input
              placeholder={t("label")}
              value={form.label}
              onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              required
              placeholder={t("addressLine")}
              value={form.addressLine}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressLine: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              placeholder={t("city")}
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <input
              placeholder={t("governorate")}
              value={form.governorate}
              onChange={(e) =>
                setForm((f) => ({ ...f, governorate: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
              />
              {t("setDefault")}
            </label>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-2 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
              >
                {t("save")}
              </button>
              <button
                type="button"
                onClick={() => setFormOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmationModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title={t("deleteConfirmTitle")}
        message={t("deleteConfirmMessage")}
      />
    </CardDashBoard>
  );
}
