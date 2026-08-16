export const orderEndpoints = {
  account: {
    list: () => "/dashboard/orders",
    detail: (entryId: number | string) => `/dashboard/orders/${entryId}`,
  },
  menu: {
    list: (menuId: number | string) => `/menus/${menuId}/activity-logs`,
    detail: (menuId: number | string, entryId: number | string) =>
      `/menus/${menuId}/activity-logs/${entryId}`,
  },
} as const;
