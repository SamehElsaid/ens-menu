import { axiosGet } from "@/shared/axiosCall";
import { getMockAdminPayments } from "@/lib/mockAdminPayments";
import type {
  AdminPaymentsPeriod,
  AdminPaymentsResponse,
  AdminPaymentStatusFilter,
  AdminSubscriptionSourceFilter,
  AdminSubscriptionStatusFilter,
} from "@/types/AdminPayment";

export type FetchAdminPaymentsParams = {
  page?: number;
  limit?: number;
  status?: AdminPaymentStatusFilter;
  period?: AdminPaymentsPeriod;
  search?: string;
  source?: AdminSubscriptionSourceFilter;
  subscriptionStatus?: AdminSubscriptionStatusFilter;
};

export async function fetchAdminPayments(
  locale: string,
  params: FetchAdminPaymentsParams = {},
): Promise<AdminPaymentsResponse> {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.status && params.status !== "all") query.status = params.status;
  if (params.period && params.period !== "all") query.period = params.period;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.source && params.source !== "all") query.source = params.source;
  if (params.subscriptionStatus && params.subscriptionStatus !== "all") {
    query.subscriptionStatus = params.subscriptionStatus;
  }

  const result = await axiosGet<AdminPaymentsResponse>(
    "/admin/payments",
    locale,
    undefined,
    query,
  );

  if (result.status && result.data?.transactions) {
    return result.data;
  }

  return getMockAdminPayments(locale, {
    page: params.page,
    limit: params.limit,
    status: params.status,
    period: params.period,
    search: params.search,
    source: params.source,
    subscriptionStatus: params.subscriptionStatus,
  });
}

export function formatPaymentDate(
  dateStr: string | null | undefined,
  locale: string,
): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleString(locale === "ar" ? "ar-EG" : "en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function formatPaymentAmount(amount: number, currency: string): string {
  return `${amount.toLocaleString()} ${currency}`;
}
