export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerPayload {
  name: string;
  phone?: string;
  email?: string;
  address: string;
  notes?: string;
}