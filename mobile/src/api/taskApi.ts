import apiClient from './client';
import { Task, CreateTaskPayload, TaskStatus } from '../types/task.types';

export async function getTasksRequest(): Promise<{ success: boolean; data: { tasks: Task[] } }> {
  const response = await apiClient.get('/tasks');
  return response.data;
}

export async function getTaskByIdRequest(
  id: string
): Promise<{ success: boolean; data: { task: Task } }> {
  const response = await apiClient.get(`/tasks/${id}`);
  return response.data;
}

export async function createTaskRequest(
  payload: CreateTaskPayload
): Promise<{ success: boolean; data: { task: Task } }> {
  const response = await apiClient.post('/tasks', payload);
  return response.data;
}

export async function updateTaskStatusRequest(
  id: string,
  status: TaskStatus,
  notes?: string
): Promise<{ success: boolean; data: { task: Task } }> {
  const response = await apiClient.patch(`/tasks/${id}/status`, { status, notes });
  return response.data;
}

export async function assignTaskRequest(
  id: string,
  assignedToId: string
): Promise<{ success: boolean; data: { task: Task } }> {
  const response = await apiClient.patch(`/tasks/${id}/assign`, { assignedToId });
  return response.data;
}