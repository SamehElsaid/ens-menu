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
import {
  Button,
  Card,
  CardHeader,
  EmptyState,
  Input,
  LoadingBlock,
  SectionHeader,
} from "@/components/ui";
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
    <Card padded="lg">
      <SectionHeader title={t("title")} className="mb-4" />

      <form onSubmit={handleAssign} className="mb-6 flex items-start gap-2">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={t("assignPlaceholder")}
          aria-label={t("assignPlaceholder")}
          className="uppercase"
          dir="ltr"
        />
        <Button
          type="submit"
          variant="primary"
          loading={assigning}
          disabled={!code.trim()}
        >
          {t("assign")}
        </Button>
      </form>

      {loading ? (
        <LoadingBlock label={t("loading")} />
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <CardHeader title={t("used")} className="mb-2" />
            {data?.redemptions.length === 0 ? (
              <EmptyState title={t("emptyUsed")} size="sm" />
            ) : (
              <ul className="text-sm">
                {data?.redemptions.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"
                  >
                    <span className="font-mono text-fg">{r.code}</span>
                    <span className="text-fg-muted">
                      {formatAdminDate(r.redeemedAt, locale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <CardHeader title={t("blocked")} className="mb-2" />
            {data?.blocked.length === 0 ? (
              <EmptyState title={t("emptyBlocked")} size="sm" />
            ) : (
              <ul className="text-sm">
                {data?.blocked.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center justify-between gap-3 border-b border-line py-2 last:border-b-0"
                  >
                    <span className="font-mono text-fg">{b.code}</span>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => handleUnblock(b.voucherId)}
                    >
                      {t("unblock")}
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            {data?.redemptions.length ? (
              <div className="mt-4">
                <p className="mb-2 text-xs text-fg-muted">{t("blockHint")}</p>
                <div className="flex flex-wrap gap-2">
                  {data.redemptions.map((r) => (
                    <Button
                      key={`block-${r.voucherId}`}
                      variant="dangerGhost"
                      size="xs"
                      onClick={() => handleBlock(r.voucherId)}
                    >
                      {t("block")} {r.code}
                    </Button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </Card>
  );
}
