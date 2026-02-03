"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { UnmountClosed } from "react-collapse";
import StepFormModal, { StepFormValues } from "./StepFormModal";
import { FieldFormValues } from "./FieldFormDrawer";
import CustomInput from "./CustomInput";
import ConfirmationModal from "./ConfirmationModal";
import {
  FaPen,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronUp,
  FaCalendar,
  FaPhone,
  FaTextHeight,
  FaList,
  FaHashtag,
} from "react-icons/fa";
import { IoText } from "react-icons/io5";

export type Step = {
  id: string;
  name: string;
  nameAr?: string;
  nameEn?: string;
  fields?: FieldFormValues[];
};

interface StepItemProps {
  step: Step;
  index: number;
  onUpdate: (stepId: string, values: StepFormValues) => void;
  onAddField: (stepId: string) => void;
  onDelete?: (stepId: string) => void;
  onDeleteField?: (stepId: string, fieldIndex: number) => void;
  onEditField?: (stepId: string, fieldIndex: number) => void;
}

export default function StepItem({
  step,
  index,
  onUpdate,
  onAddField,
  onDelete,
  onDeleteField,
  onEditField,
}: StepItemProps) {
  const t = useTranslations("");
  const locale = useLocale();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fieldValues, setFieldValues] = useState<
    Record<string, string | number | Date | null>
  >({});
  const [isDeleteFieldModalOpen, setIsDeleteFieldModalOpen] = useState(false);
  const [fieldToDeleteIndex, setFieldToDeleteIndex] = useState<number | null>(null);

  const handleEditClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFormSubmit = (values: StepFormValues) => {
    onUpdate(step.id, values);
    handleCloseModal();
  };

  const handleAddFieldClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddField(step.id);
  };

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDeleteStep = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(step.id);
    }
  };

  const handleDeleteField = (e: React.MouseEvent, fieldIndex: number) => {
    e.stopPropagation();
    setFieldToDeleteIndex(fieldIndex);
    setIsDeleteFieldModalOpen(true);
  };

  const handleConfirmDeleteField = () => {
    if (fieldToDeleteIndex !== null && onDeleteField) {
      onDeleteField(step.id, fieldToDeleteIndex);
    }
    setIsDeleteFieldModalOpen(false);
    setFieldToDeleteIndex(null);
  };

  const handleCancelDeleteField = () => {
    setIsDeleteFieldModalOpen(false);
    setFieldToDeleteIndex(null);
  };

  const handleEditField = (e: React.MouseEvent, fieldIndex: number) => {
    e.stopPropagation();
    if (onEditField) {
      onEditField(step.id, fieldIndex);
    }
  };

  const getStepDisplayName = () => {
    if (locale === "ar" && step.nameAr) {
      return step.nameAr;
    }
    if (step.nameEn) {
      return step.nameEn;
    }
    return step.name;
  };

  const getFieldDisplayName = (field: FieldFormValues) => {
    return locale === "ar" ? field.nameAr : field.nameEn;
  };

  const handleFieldChange = (
    fieldIndex: number,
    value: string | number | Date | null
  ) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldIndex]: value,
    }));
  };

  const renderFieldInput = (field: FieldFormValues, fieldIndex: number) => {
    const fieldId = `field-${step.id}-${fieldIndex}`;
    const fieldName = getFieldDisplayName(field);
    const currentValue = fieldValues[fieldIndex] || "";

    const fieldInput = (
      <>
        {(() => {
          switch (field.type) {
      case "number":
        return (
          <CustomInput
            id={fieldId}
            icon={<FaHashtag />}
            type="number"
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
          />
        );

      case "date":
        return (
          <CustomInput
            id={fieldId}
            type="date"
            icon={<FaCalendar />}
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
          />
        );

      case "phone":
        return (
          <CustomInput
            id={fieldId}
            type="phone"
            icon={<FaPhone />}
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
          />
        );

      case "textarea":
        return (
          <CustomInput
            id={fieldId}
            type="textarea"
            icon={<FaTextHeight />}
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
            rows={4}
          />
        );

      case "select":
      case "choice":
        if (field.choices && field.choices.length > 0) {
          const options = field.choices.map((choice) => ({
            label: locale === "ar" ? choice.nameAr : choice.nameEn,
            value: choice.id,
          }));

          return (
            <CustomInput
              id={fieldId}
              type={field.type}
              icon={<FaList />}
              label={fieldName}
              placeholder={t("personal.selectChoice") || "Select an option"}
              value={options.find((opt) => opt.value === currentValue) || null}
              onChange={(option: unknown) => {
                const selected = option as {
                  value: string;
                  label: string;
                } | null;
                handleFieldChange(fieldIndex, selected?.value || "");
              }}
              options={options}
            />
          );
        }
        return (
          <CustomInput
            id={fieldId}
            type="text"
            icon={<IoText />}
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
          />
        );

      case "input":
      default:
        return (
          <CustomInput
            id={fieldId}
            type="text"
            icon={<IoText />}
            label={fieldName}
            placeholder={fieldName}
            value={currentValue}
            onChange={(e) => handleFieldChange(fieldIndex, e.target.value)}
          />
        );
          }
        })()}
      </>
    );

    return (
      <div className="relative">
        <div className="relative">
          {fieldInput}
        </div>
        <div className="absolute top-2 end-2 flex items-center gap-1.5 z-10">
          {onEditField && (
            <button
              type="button"
              onClick={(e) => handleEditField(e, fieldIndex)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all hover:bg-green-600 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300 shadow-sm"
              aria-label={t("common.edit") || "Edit Field"}
              title={t("common.edit") || "Edit Field"}
            >
              <FaPen className="text-[10px]" />
            </button>
          )}
          {onDeleteField && (
            <button
              type="button"
              onClick={(e) => handleDeleteField(e, fieldIndex)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 shadow-sm"
              aria-label={t("common.delete") || "Delete Field"}
              title={t("common.delete") || "Delete Field"}
            >
              <FaTrash className="text-[10px]" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg hover:border-primary/30 transition-colors ">
        <div
          className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 cursor-pointer"
          onClick={handleToggleExpand}
        >
          <div className="shrink-0">
            <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-white font-semibold text-xs sm:text-sm">
              {index + 1}
            </div>
          </div>
          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-2">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-medium text-gray-900 truncate">
                {getStepDisplayName()}
              </h3>
              {step.fields && step.fields.length > 0 && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  ({step.fields.length} {t("personal.fields") || "fields"})
                </span>
              )}
              <button
                type="button"
                onClick={handleAddFieldClick}
                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary bg-primary/10 rounded-md hover:bg-primary/20 transition-colors shrink-0 whitespace-nowrap"
                aria-label={t("personal.addField") || "Add Field"}
              >
                <FaPlus className="text-xs" />
                <span className="">{t("personal.addField") || "Add Field"}</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ms-auto">
              {step.fields && step.fields.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleExpand();
                  }}
                  className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-all hover:bg-gray-100"
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                >
                  {isExpanded ? (
                    <FaChevronUp className="text-xs" />
                  ) : (
                    <FaChevronDown className="text-xs" />
                  )}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditClick();
                }}
                className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-green-50 text-green-600 transition-all hover:bg-green-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
                aria-label={t("common.edit") || "Edit"}
              >
                <FaPen className="text-xs" />
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={handleDeleteStep}
                  className="inline-flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-red-50 text-red-600 transition-all hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                  aria-label={t("common.delete") || "Delete Step"}
                >
                  <FaTrash className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>

        <UnmountClosed isOpened={isExpanded}>
          {step.fields && step.fields.length > 0 && (
            <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
              <div className="pt-4 space-y-4">
                {step.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    {renderFieldInput(field, fieldIndex)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </UnmountClosed>
      </div>

      <StepFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        initialValues={{
          nameAr: step.nameAr || "",
          nameEn: step.nameEn || step.name || "",
        }}
      />

      <ConfirmationModal
        isOpen={isDeleteFieldModalOpen}
        onClose={handleCancelDeleteField}
        onConfirm={handleConfirmDeleteField}
        title={t("common.delete") || "Delete Field"}
        message={
          fieldToDeleteIndex !== null && step.fields?.[fieldToDeleteIndex]
            ? t("personal.deleteFieldConfirm", {
                fieldName:
                  locale === "ar"
                    ? step.fields[fieldToDeleteIndex].nameAr
                    : step.fields[fieldToDeleteIndex].nameEn,
              }) ||
              `Are you sure you want to delete the field: ${
                locale === "ar"
                  ? step.fields[fieldToDeleteIndex].nameAr
                  : step.fields[fieldToDeleteIndex].nameEn
              }?`
            : t("personal.deleteFieldConfirmMessage") ||
              "Are you sure you want to delete this field?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </>
  );
}
