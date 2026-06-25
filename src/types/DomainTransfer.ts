export type DomainTransferStatus =
  | "pending"
  | "awaiting_user"
  | "user_confirmed"
  | "completed"
  | "cancelled";

export type DomainTransferMessage = {
  id: number;
  requestId: number;
  senderType: "admin" | "user";
  message: string;
  adminId: number | null;
  adminName: string | null;
  createdAt: string;
};

export type DomainTransferRequest = {
  id: number;
  userId: number;
  domainUrl: string;
  status: DomainTransferStatus;
  userConfirmedAt: string | null;
  completedAt: string | null;
  completedByAdminId: number | null;
  completedByAdminName: string | null;
  cancelledAt: string | null;
  cancelledBy: "user" | "admin" | null;
  createdAt: string;
  updatedAt: string;
  messages?: DomainTransferMessage[];
};

export type AdminDomainTransferRequest = DomainTransferRequest & {
  userName: string;
  userEmail: string;
  userPhone: string | null;
};
