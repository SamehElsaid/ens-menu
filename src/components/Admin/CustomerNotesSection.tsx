"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { axiosDelete, axiosGet, axiosPost } from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { UserInternalNote } from "@/types/AdminCustomer";

interface Props {
  userId: number;
}

export default function CustomerNotesSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.notes");
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
    <CardDashBoard>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
        {t("title")}
      </h2>
      <p className="text-sm text-slate-500 mb-4">{t("hint")}</p>
      <form onSubmit={handleAdd} className="flex gap-2 mb-6">
        <input
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
        />
        <button
          type="submit"
          disabled={submitting || !noteText.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
        >
          {t("add")}
        </button>
      </form>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : notes.length === 0 ? (
        <p className="text-slate-500">{t("empty")}</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 p-4"
            >
              <div className="flex justify-between gap-3 items-start">
                <div>
                  <p className="text-slate-800 dark:text-slate-200">{note.note}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {note.adminName} · {formatAdminDate(note.createdAt, locale)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardDashBoard>
  );
}
