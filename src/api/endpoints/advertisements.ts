export const advertisementEndpoints = {
  admin: {
    list: () => "/admin/ads",
    detail: (advertisementId: number | string) =>
      `/admin/ads/${advertisementId}`,
  },
  menu: {
    list: (menuId: number | string) => `/menus/${menuId}/ads`,
    detail: (menuId: number | string, advertisementId: number | string) =>
      `/menus/${menuId}/ads/${advertisementId}`,
  },
} as const;
