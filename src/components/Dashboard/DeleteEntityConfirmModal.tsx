"use client";

import { useState, type ReactNode } from "react";
import { IoTrashOutline } from "react-icons/io5";
import { ConfirmDialog, Field, Input } from "@/components/ui";

type DeleteEntityConfirmModalProps = {
  titleId: string;
  inputId: string;
  title: string;
  message: ReactNode;
  typeConfirmLabel: ReactNode;
  confirmPlaceholder: string;
  cancelLabel: string;
  confirmDeleteLabel: string;
  deletingLabel?: string;
  closeAriaLabel?: string;
  onClose: () => void;
  onDelete: () => Promise<void>;
};

/**
 * Type-to-confirm deletion, shared by every destructive flow in the dashboard.
 *
 * The name must be typed exactly, so an accidental double-click cannot destroy
 * a menu, item or staff record.
 */
export default function DeleteEntityConfirmModal({
  inputId,
  title,
  message,
  typeConfirmLabel,
  confirmPlaceholder,
  cancelLabel,
  confirmDeleteLabel,
  deletingLabel,
  onClose,
  onDelete,
}: DeleteEntityConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmValue, setConfirmValue] = useState("");
  const labelText = confirmPlaceholder.trim();
  const canConfirm = confirmValue.trim() === labelText;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open
      onClose={onClose}
      onConfirm={handleDelete}
      title={title}
      icon={<IoTrashOutline />}
      tone="danger"
      loading={isDeleting}
      confirmDisabled={!canConfirm}
      cancelLabel={cancelLabel}
      confirmLabel={
        isDeleting && deletingLabel ? deletingLabel : confirmDeleteLabel
      }
    >
      <div className="flex flex-col gap-4">
        <div className="text-sm leading-relaxed text-fg-muted">{message}</div>

        <Field label={typeConfirmLabel} htmlFor={inputId}>
          <Input
            id={inputId}
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={confirmPlaceholder}
            disabled={isDeleting}
            autoComplete="off"
            dir="auto"
            data-autofocus
          />
        </Field>
      </div>
    </ConfirmDialog>
  );
}
