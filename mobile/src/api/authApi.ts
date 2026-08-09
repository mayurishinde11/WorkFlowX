import apiClient from './client';
import { AuthResponse, RegisterPayload, LoginPayload, User } from '../types/auth.types';

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', payload);
  return response.data;
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', payload);
  return response.data;
}

export async function getMeRequest(): Promise<{ success: boolean; data: { user: User } }> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}