import { z } from "zod";

/**
 * Attendance Create Schema
 * Validates all required fields for creating a new attendance record
 */
export const attendanceCreateSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  loginTime: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  logoutTime: z.union([z.string(), z.date()]).transform((val) => new Date(val)).nullable().optional(),
  date: z.union([z.string(), z.date()]).transform((val) => new Date(val)),
  duration: z.coerce.number().int().min(0, "Duration must be non-negative").optional(),
  status: z.enum(["present", "absent", "partial"]).default("present"),
  notes: z.string().trim().optional(),
});

/**
 * Attendance Update Schema
 * All fields are optional for partial updates
 */
export const attendanceUpdateSchema = z.object({
  userId: z.string().min(1, "User ID cannot be empty").optional(),
  loginTime: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
  logoutTime: z.union([z.string(), z.date()]).transform((val) => new Date(val)).nullable().optional(),
  date: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
  duration: z.coerce.number().int().min(0, "Duration must be non-negative").optional(),
  status: z.enum(["present", "absent", "partial"]).optional(),
  notes: z.string().trim().optional(),
});

// Type exports for TypeScript inference
export type AttendanceCreateInput = z.infer<typeof attendanceCreateSchema>;
export type AttendanceUpdateInput = z.infer<typeof attendanceUpdateSchema>;

