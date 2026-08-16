import { axiosDelete, axiosPut } from "@/shared/axiosCall";

/** Update group membership, or dissolve the group if fewer than 2 menus remain. */
export async function updateMenuGroupMembership(
  locale: string,
  groupId: number,
  menuIds: number[],
) {
  if (menuIds.length >= 2) {
    return axiosPut<{ menuIds: number[] }, { group?: { id: number } }>(
      `/menu-groups/${groupId}`,
      locale,
      { menuIds },
    );
  }
  return axiosDelete<{ message?: string }>(`/menu-groups/${groupId}`, locale);
}
