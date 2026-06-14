export type AccountStatus = "active" | "blocked" | "deleted" | "suspended";

export interface UserAddress {
  id: number;
  userId: number;
  label: string | null;
  addressLine: string;
  city: string | null;
  governorate: string | null;
  country: string | null;
  postalCode: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserInternalNote {
  id: number;
  userId: number;
  adminId: number | null;
  adminName: string;
  note: string;
  createdAt: string;
}

export interface UserOrder {
  id: number;
  planName: string;
  billingCycle: string;
  status: string;
  paymentStatus: string;
  amount: number;
  paidAt: string | null;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export interface UserOrdersResponse {
  orders: UserOrder[];
  stats: {
    totalOrders: number;
    totalPaid: number;
    lastOrder: UserOrder | null;
  };
}

export interface ActivityLogEntry {
  id: number;
  adminName: string;
  action: string;
  details: string | null;
  createdAt: string;
}

export interface UserActivityLogResponse {
  lastLoginAt: string | null;
  lastAccountUpdate: string | null;
  lastOrder: UserOrder | null;
  entries: ActivityLogEntry[];
}

export interface VoucherRedemption {
  id: number;
  voucherId: number;
  code: string;
  type: string;
  discountType: string | null;
  discountValue: number | null;
  description: string | null;
  redeemedAt: string;
}

export interface BlockedVoucher {
  id: number;
  voucherId: number;
  code: string;
  description: string | null;
  blockedAt: string;
}

export interface UserVouchersResponse {
  redemptions: VoucherRedemption[];
  blocked: BlockedVoucher[];
}

export interface SupportCase {
  id: number;
  userId: number;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  ticketRef: string | null;
  adminName: string | null;
  createdAt: string;
  updatedAt: string;
}
