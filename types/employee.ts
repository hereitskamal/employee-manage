export interface EmployeeRow {
  id: number;
  name: string;
  department: string;
  title: string;        // ✅ same
  email: string;
  phone: string;
  location: string;
  salary: number;
  age: number;
  hireDate: string;     // ✅ same
  performance: number;
}

export type EmployeeForm = Omit<EmployeeRow, "id">;


