export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus =
  | 'PENDING'
  | 'ASSIGNED'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'ON_HOLD'
  | 'COMPLETED'
  | 'CANCELLED';

export interface TaskPerson {
  id: string;
  firstName: string;
  lastName: string;
}

export interface TaskCustomer {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number | null;
  longitude: number | null;
}
export interface StatusHistoryEntry {
  id: string;
  status: TaskStatus;
  notes: string | null;
  createdAt: string;
  changedBy: TaskPerson;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  customer: TaskCustomer;
  assignedTo: TaskPerson | null;
  createdBy: TaskPerson;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  estimatedDuration: number | null;
  actualDuration: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  statusHistory?: StatusHistoryEntry[];
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  customerId: string;
  assignedToId?: string;
  priority?: TaskPriority;
}