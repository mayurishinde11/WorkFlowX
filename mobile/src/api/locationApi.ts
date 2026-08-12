import apiClient from './client';

export interface EmployeeLocation {
  id: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export async function recordLocationRequest(
  latitude: number,
  longitude: number,
  taskId?: string
): Promise<{ success: boolean }> {
  const response = await apiClient.post('/location', { latitude, longitude, taskId });
  return response.data;
}

export async function getActiveEmployeeLocationsRequest(): Promise<{
  success: boolean;
  data: { locations: EmployeeLocation[] };
}> {
  const response = await apiClient.get('/location/employees');
  return response.data;
}