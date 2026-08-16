"use client";

import { useCallback, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { axiosDelete, axiosGet, axiosPost } from "@/shared/axiosCall";
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
import { useApiQuery } from "@/hooks/useApiQuery";
import { useApiAction } from "@/hooks/useApiAction";

interface Props {
  userId: number;
}

export default function CustomerVouchersSection({ userId }: Props) {
  const locale = useLocale();
  const t = useTranslations("adminUsers.userDetails.customerSections.vouchers");
  const [data, setData] = useState<UserVouchersResponse | null>(null);
  const [code, setCode] = useState("");
  const [assigning, setAssigning] = useState(false);
  const { runApiAction } = useApiAction();

  const requestVouchers = useCallback(
    () =>
      axiosGet<UserVouchersResponse>(
        `/admin/users/${userId}/vouchers`,
        locale,
      ),
    [userId, locale],
  );
  const vouchersQuery = useApiQuery({
    request: requestVouchers,
    errorToast: ({ error }) => error,
    onSuccess: setData,
  });
  const loading = vouchersQuery.loading;
  const load = vouchersQuery.refetch;

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setAssigning(true);
    try {
      await runApiAction(
        () =>
          axiosPost(`/admin/users/${userId}/vouchers/assign`, locale, {
            code: code.trim(),
          }),
        {
          successToast: t("assignSuccess"),
          errorToast: t("assignError"),
          onSuccess: () => {
            setCode("");
            void load();
          },
        },
      );
    } finally {
      setAssigning(false);
    }
  };

  const handleBlock = async (voucherId: number) => {
    await runApiAction(
      () =>
        axiosPost(
          `/admin/users/${userId}/vouchers/${voucherId}/block`,
          locale,
          {},
        ),
      {
        successToast: t("blockSuccess"),
        errorToast: ({ error }) => error,
        onSuccess: () => void load(),
      },
    );
  };

  const handleUnblock = async (voucherId: number) => {
    await runApiAction(
      () =>
        axiosDelete(
          `/admin/users/${userId}/vouchers/${voucherId}/block`,
          locale,
        ),
      {
        successToast: t("unblockSuccess"),
        errorToast: ({ error }) => error,
        onSuccess: () => void load(),
      },
    );
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
