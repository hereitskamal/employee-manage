/**
 * Attendance Utility Functions
 * 
 * Helper functions for attendance validation and calculations
 */

import {
  CLOCK_IN_WINDOW,
  MINIMUM_WORK_MINUTES,
  ATTENDANCE_THRESHOLDS,
  ATTENDANCE_ERRORS,
} from "@/lib/constants/attendance";

/**
 * Check if the current time is within the allowed clock-in window
 * 
 * @param currentTime - The time to check (defaults to current time)
 * @returns Object with isValid flag and error message if invalid
 * 
 * Logic:
 * - Extracts the hour from the current time
 * - Checks if hour is between CLOCK_IN_WINDOW.start and CLOCK_IN_WINDOW.end
 * - Returns validation result with user-friendly error message
 */
export function isWithinClockInWindow(currentTime: Date = new Date()): {
  isValid: boolean;
  error?: string;
} {
  const currentHour = currentTime.getHours();

  // Check if current hour is within the allowed window
  if (currentHour < CLOCK_IN_WINDOW.start || currentHour >= CLOCK_IN_WINDOW.end) {
    return {
      isValid: false,
      error: ATTENDANCE_ERRORS.CLOCK_IN_OUTSIDE_WINDOW(
        CLOCK_IN_WINDOW.start,
        CLOCK_IN_WINDOW.end
      ),
    };
  }

  return { isValid: true };
}

/**
 * Calculate attendance duration in minutes
 * 
 * @param loginTime - Clock-in time
 * @param logoutTime - Clock-out time
 * @returns Duration in minutes (rounded)
 * 
 * Logic:
 * - Calculates difference between logout and login times
 * - Converts milliseconds to minutes
 * - Rounds to nearest integer
 */
export function calculateDuration(
  loginTime: Date,
  logoutTime: Date
): number {
  const diffMs = logoutTime.getTime() - loginTime.getTime();
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}

/**
 * Determine attendance status based on duration
 * 
 * @param durationMinutes - Total work duration in minutes
 * @returns "present" | "partial"
 * 
 * Logic:
 * - If duration >= MINIMUM_WORK_MINUTES (8 hours): "present"
 * - If duration >= ATTENDANCE_THRESHOLDS.partialMinutes (1 hour): "partial"
 * - Otherwise: "absent" (though this shouldn't happen if clocked out)
 * 
 * Note: This function assumes the employee has clocked in and out.
 * Absent status is typically set when no clock-in occurs.
 */
export function determineAttendanceStatus(durationMinutes: number): "present" | "partial" {
  if (durationMinutes >= MINIMUM_WORK_MINUTES) {
    return "present";
  }
  
  if (durationMinutes >= ATTENDANCE_THRESHOLDS.partialMinutes) {
    return "partial";
  }
  
  // If less than 1 hour, still mark as partial (they did clock in/out)
  // This edge case handles very short sessions
  return "partial";
}

/**
 * Get today's date range in UTC
 * Returns start and end of today for querying attendance records
 * 
 * @returns Object with today (start) and todayEnd (end) dates
 * 
 * Logic:
 * - Creates UTC date objects for start (00:00:00) and end (23:59:59.999) of today
 * - Uses UTC to avoid timezone issues when querying database
 */
export function getTodayDateRange(): { today: Date; todayEnd: Date } {
  const now = new Date();
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0)
  );
  const todayEnd = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999)
  );
  return { today, todayEnd };
}

/**
 * Format time window for display
 * 
 * @returns Formatted string like "6:00 AM - 10:00 AM"
 */
export function formatTimeWindow(): string {
  const formatHour = (hour: number): string => {
    if (hour === 0) return "12:00 AM";
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return "12:00 PM";
    return `${hour - 12}:00 PM`;
  };

  return `${formatHour(CLOCK_IN_WINDOW.start)} - ${formatHour(CLOCK_IN_WINDOW.end)}`;
}

