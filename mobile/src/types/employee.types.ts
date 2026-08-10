export type EmployeeRole = 'MANAGER' | 'EMPLOYEE';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: EmployeeRole;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: EmployeeRole;
}