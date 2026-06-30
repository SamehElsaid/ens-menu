export type UserNotificationType =
  | "subscription_created"
  | "subscription_expiring"
  | "subscription_expiring_5d"
  | "subscription_expiring_1d"
  | "subscription_expired"
  | "downgraded_to_free";

export type UserNotification = {
  id: number;
  type: UserNotificationType | string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  isRead: boolean;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  readAt?: string | null;
};

export type UserNotificationsResponse = {
  notifications: UserNotification[];
  unreadCount: number;
};
