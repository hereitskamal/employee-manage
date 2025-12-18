export interface EmployeeRow {
  _id?: string;
  id?: string;
  name: string;
  department: string;
  title: string;        // ✅ same
  email: string;
  phone: string;
  location?: string;
  salary: number;
  age?: number;
  hireDate: string | Date;     // ✅ same
  performance?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  [key: string]: unknown; // Allow additional properties for flexibility
}

export type EmployeeForm = Omit<EmployeeRow, "id">;


