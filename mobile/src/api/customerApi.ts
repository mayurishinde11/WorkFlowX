import apiClient from './client';
import { Customer, CreateCustomerPayload } from '../types/customer.types';

export async function getCustomersRequest(): Promise<{ success: boolean; data: { customers: Customer[] } }> {
  const response = await apiClient.get('/customers');
  return response.data;
}

export async function createCustomerRequest(
  payload: CreateCustomerPayload
): Promise<{ success: boolean; data: { customer: Customer } }> {
  const response = await apiClient.post('/customers', payload);
  return response.data;
}