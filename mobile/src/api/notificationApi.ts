import apiClient from './client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export async function getNotificationsRequest(): Promise<{
  success: boolean;
  data: { notifications: Notification[] };
}> {
  const response = await apiClient.get('/notifications');
  return response.data;
}

export async function markAsReadRequest(id: string): Promise<{ success: boolean }> {
  const response = await apiClient.patch(`/notifications/${id}/read`, {});
  return response.data;
}

export async function markAllAsReadRequest(): Promise<{ success: boolean }> {
  const response = await apiClient.patch('/notifications/read-all', {});
  return response.data;
}