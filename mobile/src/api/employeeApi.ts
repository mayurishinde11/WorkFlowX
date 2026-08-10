import apiClient from './client';
import { Employee, CreateEmployeePayload } from '../types/employee.types';

export async function getEmployeesRequest(): Promise<{ success: boolean; data: { employees: Employee[] } }> {
  const response = await apiClient.get('/employees');
  return response.data;
}

export async function createEmployeeRequest(
  payload: CreateEmployeePayload
): Promise<{ success: boolean; data: { employee: Employee } }> {
  const response = await apiClient.post('/employees', payload);
  return response.data;
}

export async function deactivateEmployeeRequest(
  id: string
): Promise<{ success: boolean; data: { employee: Employee } }> {
  const response = await apiClient.patch(`/employees/${id}/deactivate`, {});
  return response.data;
}