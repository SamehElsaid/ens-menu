export interface MenuAuditLogEntry {
  id: string;
  actionType: string;
  title: string;
  description?: string | null;
  entityType: string;
  entityName?: string | null;
  userName?: string | null;
  createdAt: string;
  isUndated: boolean;
}

export interface ActivityLogLabels {
  categoryCreated: (name: string) => string;
  categoryUpdated: (name: string) => string;
  itemCreated: (name: string) => string;
  itemUpdated: (name: string) => string;
  staffCreated: (name: string) => string;
  tableCreated: (number: string) => string;
  adCreated: (title: string) => string;
  adUpdated: (title: string) => string;
  settingsUpdated: string;
}

export interface FetchMenuActivityLogParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface MenuAuditLogsPayload {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  entries: MenuAuditLogEntry[];
}
