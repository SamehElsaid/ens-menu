"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { axiosDelete, axiosGet, axiosPost } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingBlock,
  SectionHeader,
} from "@/components/ui";
import type { UserInternalNote } from "@/types/AdminCustomer";
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface Props {
  userId: number;
}

export default function CustomerNotesSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.notes");
  const tCommon = useTranslations("common");
  const [notes, setNotes] = useState<UserInternalNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { runApiAction } = useApiAction();

  const requestNotes = useCallback(
    () =>
      axiosGet<{ notes: UserInternalNote[] }>(
        `/admin/users/${userId}/notes`,
        locale,
      ),
    [userId, locale],
  );
  const notesQuery = useApiQuery({
    request: requestNotes,
    errorToast: ({ error }) => error,
    onSuccess: (data) => setNotes(data.notes),
  });
  const loading = notesQuery.loading;
  const load = notesQuery.refetch;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await runApiAction(
        () =>
          axiosPost(`/admin/users/${userId}/notes`, locale, { note: trimmed }),
        {
          successToast: t("addSuccess"),
          errorToast: t("addError"),
          onSuccess: () => {
            setNoteText("");
            void load();
          },
        },
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    await runApiAction(
      () => axiosDelete(`/admin/users/${userId}/notes/${noteId}`, locale),
      {
        successToast: t("deleteSuccess"),
        errorToast: ({ error }) => error,
        onSuccess: () => void load(),
      },
    );
  };

  return (
    <Card padded="lg">
      <SectionHeader
        title={t("title")}
        description={t("hint")}
        className="mb-4"
      />

      <form onSubmit={handleAdd} className="mb-6 flex items-start gap-2">
        <Input
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={t("placeholder")}
          aria-label={t("title")}
        />
        <Button
          type="submit"
          variant="primary"
          loading={submitting}
          disabled={!noteText.trim()}
        >
          {t("add")}
        </Button>
      </form>

      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : notes.length === 0 ? (
        <EmptyState title={t("empty")} size="sm" />
      ) : (
        <ul className="flex flex-col gap-3">
          {notes.map((note) => (
            <Card as="li" key={note.id} padded="md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-fg">{note.note}</p>
                  <p className="mt-2 text-xs text-fg-muted">
                    {note.adminName} · {formatAdminDate(note.createdAt, locale)}
                  </p>
                </div>
                <Button
                  variant="dangerGhost"
                  size="sm"
                  iconOnly
                  aria-label={tCommon("delete")}
                  onClick={() => handleDelete(note.id)}
                >
                  <FaTrash />
                </Button>
              </div>
            </Card>
          ))}
        </ul>
      )}
    </Card>
  );
}
