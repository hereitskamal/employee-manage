import { z } from "zod";

/**
 * Employee Create Schema
 * Validates all required fields for creating a new employee
 */
export const employeeCreateSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  phone: z.string().min(1, "Phone is required").trim(),
  department: z.string().min(1, "Department is required").trim(),
  title: z.string().min(1, "Title is required").trim(),
  salary: z.coerce.number().min(0, "Salary must be non-negative"),
  hireDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  location: z.string().trim().optional(),
  age: z.coerce.number().int().min(0).max(150).optional(),
  performance: z.coerce.number().min(0).max(100).optional(),
});

/**
 * Employee Update Schema
 * All fields are optional for partial updates
 */
export const employeeUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  email: z.string().email("Invalid email format").toLowerCase().trim().optional(),
  phone: z.string().min(1, "Phone cannot be empty").trim().optional(),
  department: z.string().min(1, "Department cannot be empty").trim().optional(),
  title: z.string().min(1, "Title cannot be empty").trim().optional(),
  salary: z.coerce.number().min(0, "Salary must be non-negative").optional(),
  hireDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
  location: z.string().trim().optional(),
  age: z.coerce.number().int().min(0).max(150).optional(),
  performance: z.coerce.number().min(0).max(100).optional(),
  role: z.enum(["admin", "manager", "employee", "spc"]).optional(),
});

// Type exports for TypeScript inference
export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;

