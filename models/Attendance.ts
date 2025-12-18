// models/Attendance.ts
import mongoose, { Schema, models } from "mongoose";

export interface IAttendance extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  loginTime: Date;
  logoutTime?: Date | null;
  date: Date; // Date portion only (YYYY-MM-DD)
  duration?: number; // in minutes, calculated from loginTime and logoutTime
  status: "present" | "absent" | "partial";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    loginTime: {
      type: Date,
      required: true,
    },
    logoutTime: {
      type: Date,
      default: null,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      min: 0,
    },
    status: {
      type: String,
      enum: ["present", "absent", "partial"],
      default: "present",
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
AttendanceSchema.index({ userId: 1, date: -1 });
AttendanceSchema.index({ date: -1 });
AttendanceSchema.index({ status: 1 });

// Virtual for calculating duration
AttendanceSchema.virtual("calculatedDuration").get(function () {
  if (this.logoutTime && this.loginTime) {
    return Math.round((this.logoutTime.getTime() - this.loginTime.getTime()) / (1000 * 60)); // minutes
  }
  return null;
});

// Note: Duration is calculated manually in API routes (clock-out) to avoid pre-save hook issues

export const Attendance =
  models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

