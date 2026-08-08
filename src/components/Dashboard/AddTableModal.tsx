"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { Controller, useForm } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { axiosPost, axiosPatch } from "@/shared/axiosCall";
import { toast } from "react-toastify";
import { MenuTable } from "@/types/Menu";
import {
  IoEllipseSharp,
  IoCheckmarkCircle,
  IoRemoveCircle,
  IoAddCircleOutline,
} from "react-icons/io5";
import { MdOutlineTableBar } from "react-icons/md";
import { Button, Field, Input, Modal, focusRing } from "@/components/ui";
import { cn } from "@/lib/cn";

const TABLE_NUMBER_MAX = 50;
const TABLE_NUMBER_PATTERN =
  /^[a-zA-Z0-9\u0600-\u06FF][a-zA-Z0-9\u0600-\u06FF\s\-_]*$/;
const TABLE_FORM_ID = "add-table-form";

function sanitizeTableNumberInput(raw: string): string {
  return raw
    .replace(/[\u064B-\u065F\u0670\u0640]/g, "")
    .replace(/[^a-zA-Z0-9\u0600-\u06FF\s\-_]/g, "")
    .slice(0, TABLE_NUMBER_MAX);
}

function getApiErrorMessage(data: unknown, locale: string): string | null {
  if (!data || typeof data !== "object") return null;
  const row = data as Record<string, unknown>;
  if (typeof row.error === "string" && row.error.trim()) return row.error;
  if (locale === "ar" && typeof row.errorAr === "string") return row.errorAr;
  if (typeof row.errorEn === "string") return row.errorEn;
  if (typeof row.message === "string") return row.message;
  return null;
}

export interface AddTableFormData {
  tableNumber: string;
  isActive: boolean;
}

interface AddTableModalProps {
  menuId: string;
  table?: MenuTable | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function AddTableModal({
  menuId,
  table = null,
  onClose,
  onRefresh,
}: AddTableModalProps) {
  const t = useTranslations("Tables.addModal");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const isEdit = Boolean(table?.id);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddTableFormData>({
    defaultValues: {
      tableNumber: "",
      isActive: true,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (table) {
      reset({
        tableNumber: table.tableNumber ?? "",
        isActive: table.isActive ?? true,
      });
    } else {
      reset({ tableNumber: "", isActive: true });
    }
  }, [table, reset]);

  const onSubmit = async (data: AddTableFormData) => {
    try {
      setIsSaving(true);

      const payload = {
        tableNumber: sanitizeTableNumberInput(data.tableNumber).trim(),
        isActive: data.isActive,
      };

      if (isEdit && table) {
        const result = await axiosPatch<typeof payload, { message?: string }>(
          `/menus/${menuId}/tables/${table.id}`,
          locale,
          payload,
        );
        if (result.status) {
          toast.success(t("editSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(
            getApiErrorMessage(result.data, locale) ?? t("editError"),
          );
        }
      } else {
        const result = await axiosPost<
          typeof payload,
          { message?: string; table?: MenuTable }
        >(`/menus/${menuId}/tables`, locale, payload);
        if (result.status) {
          toast.success(t("createSuccess"));
          onClose();
          onRefresh?.();
        } else {
          toast.error(
            getApiErrorMessage(result.data, locale) ?? t("createError"),
          );
        }
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
      title={isEdit ? t("editTitle") : t("title")}
      description={t("subtitle")}
      icon={<MdOutlineTableBar className="size-5" />}
      dismissible={!isSaving}
      closeLabel={tCommon("close")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            form={TABLE_FORM_ID}
            loading={isSaving}
            disabled={isSaving}
            startIcon={<IoAddCircleOutline className="size-4.5" />}
          >
            {isEdit ? t("save") : t("create")}
          </Button>
        </>
      }
    >
      <form
        id={TABLE_FORM_ID}
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <Field
          label={t("tableNumber")}
          required
          error={errors.tableNumber?.message}
        >
          <Controller
            name="tableNumber"
            control={control}
            rules={{
              required: t("tableNumberRequired"),
              maxLength: {
                value: TABLE_NUMBER_MAX,
                message: t("tableNumberMax"),
              },
              validate: (value) =>
                TABLE_NUMBER_PATTERN.test(value.trim()) ||
                t("tableNumberInvalid"),
            }}
            render={({ field }) => (
              <Input
                type="text"
                inputMode="text"
                autoComplete="off"
                value={field.value}
                onChange={(e) =>
                  field.onChange(
                    sanitizeTableNumberInput(
                      (e as ChangeEvent<HTMLInputElement>).target.value,
                    ),
                  )
                }
                onBlur={field.onBlur}
                placeholder={t("tableNumberPlaceholder")}
                data-autofocus
              />
            )}
          />
        </Field>

        <div className="flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[13px] font-semibold text-fg">
            <IoEllipseSharp
              className="size-3 shrink-0 text-fg-subtle"
              aria-hidden
            />
            {t("status")}
          </p>
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <div className="flex w-fit gap-1 rounded-lg border border-line bg-surface-2 p-1">
                <button
                  type="button"
                  aria-pressed={field.value === true}
                  onClick={() => field.onChange(true)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-150",
                    focusRing,
                    field.value === true
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  <IoCheckmarkCircle
                    className={cn(
                      "size-4",
                      field.value === true ? "text-success" : "text-fg-subtle",
                    )}
                    aria-hidden
                  />
                  {t("active")}
                </button>
                <button
                  type="button"
                  aria-pressed={field.value === false}
                  onClick={() => field.onChange(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors duration-150",
                    focusRing,
                    field.value === false
                      ? "bg-surface text-fg shadow-xs"
                      : "text-fg-muted hover:text-fg",
                  )}
                >
                  <IoRemoveCircle
                    className={cn(
                      "size-4",
                      field.value === false ? "text-danger" : "text-fg-subtle",
                    )}
                    aria-hidden
                  />
                  {t("inactive")}
                </button>
              </div>
            )}
          />
        </div>
      </form>
    </Modal>
  );
}
