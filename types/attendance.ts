// types/attendance.ts
import mongoose from "mongoose";

export interface AttendanceRow {
  _id?: string;
  id?: string;
  userId: mongoose.Types.ObjectId | string | { _id?: string; name?: string; email?: string };
  loginTime: Date | string;
  logoutTime?: Date | string | null;
  date: Date | string; // Date portion only (YYYY-MM-DD)
  duration?: number; // in minutes, calculated from loginTime and logoutTime
  status: "present" | "absent" | "partial";
  notes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export type AttendanceForm = Omit<AttendanceRow, "_id" | "id" | "createdAt" | "updatedAt" | "duration">;

