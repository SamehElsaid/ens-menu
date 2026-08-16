export const adminUserEndpoints = {
  list: () => "/admin/users",
  detail: (userId: number | string) => `/admin/users/${userId}`,
  subscriptions: (userId: number | string) =>
    `/admin/users/${userId}/subscriptions`,
} as const;
