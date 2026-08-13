import apiClient from './client';

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  metadata: string | null;
  createdAt: string;
}

export async function getAuditLogsRequest(): Promise<{
  success: boolean;
  data: { logs: AuditLog[] };
}> {
  const response = await apiClient.get('/audit-logs');
  return response.data;
}