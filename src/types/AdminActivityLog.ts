export type AdminActivityAction =
  | "admin_created"
  | "admin_deleted"
  | "admin_permissions_updated"
  | "user_deleted"
  | "user_soft_deleted"
  | "user_restored"
  | "user_subscription_updated";

export type AdminActivityTargetType = "admin" | "user";

export interface AdminActivityLogEntry {
  id: number;
  actorAdminId: number | null;
  actorAdminName: string;
  action: AdminActivityAction;
  targetType: AdminActivityTargetType;
  targetId: number;
  targetName: string;
  targetEmail: string | null;
  details: string | null;
  createdAt: string;
}

export interface AdminActivityLogResponse {
  entries: AdminActivityLogEntry[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}
