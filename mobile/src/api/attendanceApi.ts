import apiClient from './client';
import { AttendanceRecord } from '../types/attendance.types';

interface Coords {
  latitude?: number;
  longitude?: number;
}

export async function checkInRequest(
  coords: Coords
): Promise<{ success: boolean; data: { attendance: AttendanceRecord } }> {
  const response = await apiClient.post('/attendance/check-in', coords);
  return response.data;
}

export async function checkOutRequest(
  coords: Coords
): Promise<{ success: boolean; data: { attendance: AttendanceRecord } }> {
  const response = await apiClient.post('/attendance/check-out', coords);
  return response.data;
}

export async function getMyAttendanceRequest(): Promise<{
  success: boolean;
  data: { attendance: AttendanceRecord[] };
}> {
  const response = await apiClient.get('/attendance/me');
  return response.data;
}