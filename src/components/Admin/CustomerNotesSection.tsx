"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
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

interface Props {
  userId: number;
}

export default function CustomerNotesSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.notes");
  const tCommon = useTranslations("common");
  const [notes, setNotes] = useState<UserInternalNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<{ notes: UserInternalNote[] }>(
        `/admin/users/${userId}/notes`,
        locale,
      );
      if (result.status && result.data) {
        setNotes(result.data.notes);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = noteText.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const result = await axiosPost<{ note: string }, unknown>(
        `/admin/users/${userId}/notes`,
        locale,
        { note: trimmed },
      );
      if (result.status) {
        toast.success(t("addSuccess"));
        setNoteText("");
        load();
      } else {
        toast.error(t("addError"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (noteId: number) => {
    const result = await axiosDelete(
      `/admin/users/${userId}/notes/${noteId}`,
      locale,
    );
    if (result.status) {
      toast.success(t("deleteSuccess"));
      load();
    }
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
