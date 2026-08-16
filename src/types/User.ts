import type { AccountStatus } from "@/types/AdminCustomer";

export interface UserIdentity {
  id?: number;
  email?: string;
  name?: string;
  role?: string;
  profileImage?: string | null;
  /** Present for admins from `/auth/me`. `null` = unrestricted. */
  adminPermissions?: import("@/types/AdminPermission").AdminPermissionKey[] | null;
  [key: string]: unknown;
}

/** Client-side projection of the cookie/JWT-backed server session. */
export interface AuthSessionCache {
  user?: UserIdentity;
  [key: string]: unknown;
}

export interface AdminUserBase {
  id: number;
  name: string;
  email: string;
  phoneNumber: string | null;
  country: string | null;
  profileImage: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  isSuspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  planName: string;
  subscriptionStatus: string;
  startDate: string;
  endDate: string | null;
  billingCycle: string;
}

export interface AdminUserListItem extends AdminUserBase {
  menusCount: number;
  featuredOnHomepage?: boolean | number;
}

export interface AdminUserMenuSummary {
  id: number;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  slug: string;
  isActive: boolean;
  itemsCount?: number;
  activeItemsCount?: number;
  createdAt: string;
}

export interface AdminUserDetail extends AdminUserBase {
  dateOfBirth: string | null;
  gender: string | null;
  address: string | null;
  restaurantName?: string | null;
  isBlocked?: boolean;
  blockedAt?: string | null;
  blockedReason?: string | null;
  deletedAt?: string | null;
  updatedAt?: string | null;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string | null;
  accountStatus?: AccountStatus;
  maxMenus?: number;
  extraMenus?: number;
  effectiveMaxMenus?: number;
  subscriptionId?: number | null;
  amount: number;
}
