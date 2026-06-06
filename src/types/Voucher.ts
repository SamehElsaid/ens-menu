export type VoucherType = "discount" | "duration";
export type DiscountType = "percentage" | "fixed";
export type DurationUnit = "days" | "months";
export type VoucherBillingCycle = "monthly" | "yearly" | "both";

export interface Voucher {
  id: number;
  code: string;
  type: VoucherType;
  discountType: DiscountType | null;
  discountValue: number | null;
  durationUnit: DurationUnit | null;
  durationValue: number | null;
  billingCycle: VoucherBillingCycle | null;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string | null;
  validUntil: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  remainingUses?: number;
}

export interface VoucherValidationResult {
  voucher: Voucher;
  originalPrice?: number;
  discountedPrice?: number;
  discountAmount?: number;
}

export interface VoucherRedemption {
  id: number;
  userId: number;
  userName: string | null;
  userEmail: string | null;
  orderId: string | null;
  subscriptionId: number | null;
  redeemedAt: string;
}

export interface CreateVoucherPayload {
  code: string;
  type: VoucherType;
  discountType?: DiscountType;
  discountValue?: number;
  durationUnit?: DurationUnit;
  durationValue?: number;
  billingCycle?: VoucherBillingCycle;
  maxUses: number;
  isActive?: boolean;
  validFrom?: string | null;
  validUntil?: string | null;
  description?: string | null;
}

export type UpdateVoucherPayload = Partial<CreateVoucherPayload>;
