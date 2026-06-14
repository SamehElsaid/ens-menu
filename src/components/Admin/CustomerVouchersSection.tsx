"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  axiosDelete,
  axiosGet,
  axiosPost,
} from "@/shared/axiosCall";
import { formatAdminDate } from "@/lib/fetchAdminAnalytics";
import CardDashBoard from "@/components/Card/CardDashBoard";
import type { UserVouchersResponse } from "@/types/AdminCustomer";

interface Props {
  userId: number;
}

export default function CustomerVouchersSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.vouchers");
  const [data, setData] = useState<UserVouchersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [assigning, setAssigning] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await axiosGet<UserVouchersResponse>(
        `/admin/users/${userId}/vouchers`,
        locale,
      );
      if (result.status && result.data) {
        setData(result.data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId, locale]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setAssigning(true);
    try {
      const result = await axiosPost<{ code: string }, unknown>(
        `/admin/users/${userId}/vouchers/assign`,
        locale,
        { code: code.trim() },
      );
      if (result.status) {
        toast.success(t("assignSuccess"));
        setCode("");
        load();
      } else {
        toast.error(t("assignError"));
      }
    } finally {
      setAssigning(false);
    }
  };

  const handleBlock = async (voucherId: number) => {
    const result = await axiosPost(
      `/admin/users/${userId}/vouchers/${voucherId}/block`,
      locale,
      {},
    );
    if (result.status) {
      toast.success(t("blockSuccess"));
      load();
    }
  };

  const handleUnblock = async (voucherId: number) => {
    const result = await axiosDelete(
      `/admin/users/${userId}/vouchers/${voucherId}/block`,
      locale,
    );
    if (result.status) {
      toast.success(t("unblockSuccess"));
      load();
    }
  };

  return (
    <CardDashBoard>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
        {t("title")}
      </h2>
      <form onSubmit={handleAssign} className="flex gap-2 mb-6">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("assignPlaceholder")}
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 uppercase"
          dir="ltr"
        />
        <button
          type="submit"
          disabled={assigning || !code.trim()}
          className="px-4 py-2.5 rounded-xl bg-primary text-white font-semibold disabled:opacity-50"
        >
          {t("assign")}
        </button>
      </form>
      {loading ? (
        <p className="text-slate-500">{t("loading")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">{t("used")}</h3>
            {data?.redemptions.length === 0 ? (
              <p className="text-sm text-slate-500">{t("emptyUsed")}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data?.redemptions.map((r) => (
                  <li
                    key={r.id}
                    className="flex justify-between items-center py-2 border-b border-slate-100"
                  >
                    <span className="font-mono">{r.code}</span>
                    <span className="text-slate-500">
                      {formatAdminDate(r.redeemedAt, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="font-semibold mb-2">{t("blocked")}</h3>
            {data?.blocked.length === 0 ? (
              <p className="text-sm text-slate-500">{t("emptyBlocked")}</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data?.blocked.map((b) => (
                  <li
                    key={b.id}
                    className="flex justify-between items-center py-2 border-b border-slate-100"
                  >
                    <span className="font-mono">{b.code}</span>
                    <button
                      type="button"
                      onClick={() => handleUnblock(b.voucherId)}
                      className="text-xs text-primary font-semibold"
                    >
                      {t("unblock")}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {data?.redemptions.length ? (
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">{t("blockHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {data.redemptions.map((r) => (
                    <button
                      key={`block-${r.voucherId}`}
                      type="button"
                      onClick={() => handleBlock(r.voucherId)}
                      className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-700"
                    >
                      {t("block")} {r.code}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </CardDashBoard>
  );
}
