"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import CardDashBoard from "@/components/Card/CardDashBoard";
import StepItem, { Step } from "./StepItem";
import { StepFormValues } from "./StepFormModal";
import FieldFormDrawer, { FieldFormValues } from "./FieldFormDrawer";
import ConfirmationModal from "./ConfirmationModal";
import { FaPlus } from "react-icons/fa";

interface ApplicationStepsProps {
  applicationId: string;
}

export default function ApplicationSteps({
  applicationId,
}: ApplicationStepsProps) {
  const t = useTranslations("");
  const locale = useLocale();

  const [steps, setSteps] = useState<Step[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [isDeleteStepModalOpen, setIsDeleteStepModalOpen] = useState(false);
  const [stepToDeleteId, setStepToDeleteId] = useState<string | null>(null);

  const handleAddStep = () => {
    const nextIndex = steps.length + 1;
    const defaultNameEn = `${t("form.step")} ${nextIndex}`;
    const defaultNameAr = `خطوة ${nextIndex}`;

    const newStep: Step = {
      id: Date.now().toString(),
      name: locale === "ar" ? defaultNameAr : defaultNameEn,
      nameAr: defaultNameAr,
      nameEn: defaultNameEn,
      fields: [],
    };

    setSteps((prev) => [...prev, newStep]);
  };

  const handleUpdateStep = (stepId: string, values: StepFormValues) => {
    const displayName =
      locale === "ar" ? values.nameAr : values.nameEn || values.nameAr;
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              name: displayName,
              nameAr: values.nameAr,
              nameEn: values.nameEn,
            }
          : step
      )
    );
  };

  const handleAddField = (stepId: string) => {
    setSelectedStepId(stepId);
    setEditingFieldIndex(null);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedStepId(null);
    setEditingFieldIndex(null);
  };

  const handleFieldSubmit = (values: FieldFormValues) => {
    if (selectedStepId) {
      setSteps((prev) =>
        prev.map((step) =>
          step.id === selectedStepId
            ? {
                ...step,
                fields:
                  editingFieldIndex !== null
                    ? step.fields?.map((field, index) =>
                        index === editingFieldIndex ? values : field
                      ) || []
                    : [...(step.fields || []), values],
              }
            : step
        )
      );
    }
    handleCloseDrawer();
  };

  const handleDeleteStep = (stepId: string) => {
    setStepToDeleteId(stepId);
    setIsDeleteStepModalOpen(true);
  };

  const handleConfirmDeleteStep = () => {
    if (stepToDeleteId) {
      setSteps((prev) => prev.filter((step) => step.id !== stepToDeleteId));
    }
    setIsDeleteStepModalOpen(false);
    setStepToDeleteId(null);
  };

  const handleCancelDeleteStep = () => {
    setIsDeleteStepModalOpen(false);
    setStepToDeleteId(null);
  };

  const handleDeleteField = (stepId: string, fieldIndex: number) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? {
              ...step,
              fields: step.fields?.filter((_, index) => index !== fieldIndex) || [],
            }
          : step
      )
    );
  };

  const handleEditField = (stepId: string, fieldIndex: number) => {
    const step = steps.find((s) => s.id === stepId);
    if (step && step.fields && step.fields[fieldIndex]) {
      setSelectedStepId(stepId);
      setEditingFieldIndex(fieldIndex);
      setIsDrawerOpen(true);
    }
  };

  return (
    <CardDashBoard>
      <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-2">
        <div>
          <h1 className="text-2xl font-bold">
            {t("personal.applicationDetails") || "Application Details"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {t("personal.applicationId") || "Application ID"}:{" "}
            <span className="font-mono font-semibold">{applicationId}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-primary text-white hover:bg-primary/90"
        >
          <FaPlus />
          Add Step
        </button>
      </div>

      {steps.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500 text-lg">No steps added yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Click &quot;Add to me&quot; to create a new step with a default
            name.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {steps.map((step, index) => (
            <StepItem
              key={step.id}
              step={step}
              index={index}
              onUpdate={handleUpdateStep}
              onAddField={handleAddField}
              onDelete={handleDeleteStep}
              onDeleteField={handleDeleteField}
              onEditField={handleEditField}
            />
          ))}
        </div>
      )}

      <FieldFormDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSubmit={handleFieldSubmit}
        initialValues={
          selectedStepId && editingFieldIndex !== null
            ? (() => {
                const step = steps.find((s) => s.id === selectedStepId);
                return step?.fields?.[editingFieldIndex] || null;
              })()
            : null
        }
      />

      <ConfirmationModal
        isOpen={isDeleteStepModalOpen}
        onClose={handleCancelDeleteStep}
        onConfirm={handleConfirmDeleteStep}
        title={t("common.delete") || "Delete Step"}
        message={
          stepToDeleteId
            ? (() => {
                const step = steps.find((s) => s.id === stepToDeleteId);
                const stepName =
                  locale === "ar" && step?.nameAr
                    ? step.nameAr
                    : step?.nameEn || step?.name || "";
                return (
                  t("personal.deleteStepConfirm", { stepName }) ||
                  `Are you sure you want to delete the step: ${stepName}?`
                );
              })()
            : t("personal.deleteStepConfirmMessage") ||
              "Are you sure you want to delete this step?"
        }
        confirmText={t("form.confirm") || "Confirm"}
        cancelText={t("form.cancel") || "Cancel"}
      />
    </CardDashBoard>
  );
}


