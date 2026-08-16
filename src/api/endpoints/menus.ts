export const menuEndpoints = {
  categories: {
    list: (menuId: number | string) => `/menus/${menuId}/categories`,
    detail: (menuId: number | string, categoryId: number | string) =>
      `/menus/${menuId}/categories/${categoryId}`,
  },
  items: {
    list: (menuId: number | string) => `/menus/${menuId}/items`,
    detail: (menuId: number | string, itemId: number | string) =>
      `/menus/${menuId}/items/${itemId}`,
  },
} as const;
