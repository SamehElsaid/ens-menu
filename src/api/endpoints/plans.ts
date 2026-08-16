export const planEndpoints = {
  admin: {
    list: () => "/admin/plans",
    detail: (planId: number | string) => `/admin/plans/${planId}`,
    customDisplay: () => "/admin/plans/custom-display",
  },
} as const;
