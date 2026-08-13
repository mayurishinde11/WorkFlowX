import apiClient from './client';

export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalTasks: number;
  pendingTasks: number;
  activeTasks: number;
  completedToday: number;
  overdueTasks: number;
  completionRate: number;
  tasksByStatus: { status: string; count: number }[];
  tasksByPriority: { priority: string; count: number }[];
}

export async function getDashboardStatsRequest(): Promise<{
  success: boolean;
  data: DashboardStats;
}> {
  const response = await apiClient.get('/analytics/dashboard');
  return response.data;
}