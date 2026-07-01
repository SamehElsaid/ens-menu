import type { Menu } from "@/types/Menu";

export type MenuDisplayGroup =
  | { type: "standalone"; menu: Menu }
  | {
      type: "group";
      groupId: number;
      groupName: string;
      menus: Menu[];
    };

export type MenuGroupMeta = {
  inGroup: boolean;
  groupId?: number;
  groupName?: string;
  memberCount?: number;
  isInbox?: boolean;
};

/** Group menus for dashboard: named clusters + standalone entries. */
export function buildMenuDisplayGroups(menus: Menu[]): MenuDisplayGroup[] {
  if (menus.length === 0) return [];

  const processed = new Set<number>();
  const groups: MenuDisplayGroup[] = [];

  const groupMap = new Map<
    number,
    { name: string; menus: Menu[] }
  >();

  for (const menu of menus) {
    const groupId = menu.menuGroupId;
    if (groupId == null || groupId <= 0) continue;

    const name =
      menu.menuGroupName?.trim() ||
      `#${groupId}`;
    const bucket = groupMap.get(groupId);
    if (bucket) {
      bucket.menus.push(menu);
    } else {
      groupMap.set(groupId, { name, menus: [menu] });
    }
  }

  for (const [groupId, { name, menus: members }] of groupMap) {
    if (members.length < 2) continue;
    members.forEach((m) => processed.add(m.id));
    groups.push({
      type: "group",
      groupId,
      groupName: name,
      menus: members.sort((a, b) => a.id - b.id),
    });
  }

  for (const menu of menus) {
    if (!processed.has(menu.id)) {
      groups.push({ type: "standalone", menu });
      processed.add(menu.id);
    }
  }

  const sortKey = (m: Menu) =>
    new Date(m.createdAt ?? 0).getTime() || m.id;

  groups.sort((a, b) => {
    const aTime =
      a.type === "group"
        ? Math.max(...a.menus.map(sortKey))
        : sortKey(a.menu);
    const bTime =
      b.type === "group"
        ? Math.max(...b.menus.map(sortKey))
        : sortKey(b.menu);
    return bTime - aTime;
  });

  return groups;
}

export function resolveMenuGroupMeta(menu: Menu): MenuGroupMeta {
  const groupId =
    menu.menuGroupId != null && menu.menuGroupId > 0
      ? menu.menuGroupId
      : null;
  const memberCount = Number(menu.menuGroupMemberCount ?? 0);

  if (groupId == null || memberCount < 2) {
    return { inGroup: false };
  }

  return {
    inGroup: true,
    groupId,
    groupName: menu.menuGroupName ?? undefined,
    memberCount,
    isInbox: menu.isGroupInbox === true,
  };
}

export function isMenuInGroup(menu: Menu): boolean {
  const groupId = menu.menuGroupId;
  if (groupId == null || groupId <= 0) return false;
  return Number(menu.menuGroupMemberCount ?? 0) >= 2;
}

/** Menus available when creating a new group. */
export function menusAvailableForGroup(menus: Menu[]): Menu[] {
  return menus.filter((m) => !isMenuInGroup(m));
}

export type MenuGroupSummary = {
  id: number;
  name: string;
  menuIds: number[];
};

export function extractMenuGroupsFromMenus(menus: Menu[]): MenuGroupSummary[] {
  const map = new Map<number, MenuGroupSummary>();

  for (const menu of menus) {
    if (!isMenuInGroup(menu) || menu.menuGroupId == null) continue;

    const groupId = menu.menuGroupId;
    const existing = map.get(groupId);
    if (existing) {
      if (!existing.menuIds.includes(menu.id)) {
        existing.menuIds.push(menu.id);
      }
    } else {
      map.set(groupId, {
        id: groupId,
        name: menu.menuGroupName?.trim() || `#${groupId}`,
        menuIds: [menu.id],
      });
    }
  }

  return [...map.values()].map((g) => ({
    ...g,
    menuIds: g.menuIds.sort((a, b) => a - b),
  }));
}

/** Standalone menus that can join an existing group. */
export function menusAvailableToJoinGroup(menus: Menu[]): Menu[] {
  return menus.filter((m) => !isMenuInGroup(m));
}
