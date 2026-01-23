/**
 * Attendance Configuration Constants
 * 
 * These constants define the business rules for attendance tracking.
 * Modify these values to adjust attendance policies without changing code logic.
 */

/**
 * Clock-in Time Window Configuration
 * Defines the allowed time range for clocking in
 * 
 * Format: Hours in 24-hour format (0-23)
 * Example: { start: 6, end: 10 } means clock-in allowed between 6:00 AM and 10:00 AM
 */
export const CLOCK_IN_WINDOW = {
  /** Earliest hour (0-23) when clock-in is allowed */
  start: 6, // 6:00 AM
  /** Latest hour (0-23) when clock-in is allowed */
  end: 10, // 10:00 AM
} as const;

/**
 * Minimum Work Duration Configuration
 * Defines the minimum hours required for a full day (present status)
 * 
 * If an employee works less than this duration, they are automatically marked as "partial"
 * 
 * Format: Hours (will be converted to minutes internally)
 */
export const MINIMUM_WORK_HOURS = {
  /** Minimum hours required for full day attendance */
  fullDay: 8, // 8 hours = 480 minutes
} as const;

/**
 * Convert minimum work hours to minutes for internal calculations
 */
export const MINIMUM_WORK_MINUTES = MINIMUM_WORK_HOURS.fullDay * 60;

/**
 * Attendance Status Thresholds
 * These thresholds determine when to mark attendance as partial vs present
 */
export const ATTENDANCE_THRESHOLDS = {
  /** Minimum minutes required for "present" status */
  presentMinutes: MINIMUM_WORK_MINUTES, // 480 minutes (8 hours)
  /** Minimum minutes required for "partial" status (less than this = absent) */
  partialMinutes: 60, // 1 hour minimum for partial
} as const;

/**
 * Error Messages
 * User-friendly error messages for attendance validation failures
 */
export const ATTENDANCE_ERRORS = {
  CLOCK_IN_OUTSIDE_WINDOW: (start: number, end: number) => 
    `Clock-in is only allowed between ${start}:00 and ${end}:00. Please clock in during the allowed time window.`,
  CLOCK_IN_ALREADY_CLOCKED_IN: "You have already clocked in for today.",
  CLOCK_OUT_ALREADY_CLOCKED_OUT: "You have already clocked out for today.",
  CLOCK_OUT_NOT_CLOCKED_IN: "You must clock in before clocking out.",
  CLOCK_OUT_NO_RECORD: "No attendance record found for today. Please clock in first.",
  INVALID_TIME_WINDOW: "Invalid time window configuration. Start time must be before end time.",
} as const;

/**
 * Helper function to validate time window configuration
 * @throws Error if time window is invalid
 */
export function validateTimeWindow(): void {
  if (CLOCK_IN_WINDOW.start >= CLOCK_IN_WINDOW.end) {
    throw new Error(ATTENDANCE_ERRORS.INVALID_TIME_WINDOW);
  }
  if (CLOCK_IN_WINDOW.start < 0 || CLOCK_IN_WINDOW.start > 23) {
    throw new Error("Clock-in window start hour must be between 0 and 23");
  }
  if (CLOCK_IN_WINDOW.end < 0 || CLOCK_IN_WINDOW.end > 23) {
    throw new Error("Clock-in window end hour must be between 0 and 23");
  }
}

// Validate configuration on module load
validateTimeWindow();

