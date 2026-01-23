# Attendance Logic Documentation

This document explains the enhanced attendance tracking logic, including business rules, validation, and status determination.

## Overview

The attendance system tracks employee clock-in and clock-out times, automatically calculates work duration, and determines attendance status (present, partial, or absent) based on configurable business rules.

## Configuration Constants

All attendance rules are configurable via constants in `lib/constants/attendance.ts`:

### Clock-In Time Window

```typescript
CLOCK_IN_WINDOW = {
  start: 6,  // 6:00 AM
  end: 10,   // 10:00 AM
}
```

**Purpose**: Restricts clock-in to specific hours of the day.

**Logic**: 
- Clock-in is only allowed between `start` hour (inclusive) and `end` hour (exclusive)
- Default: 6:00 AM to 10:00 AM
- Validation occurs before creating/updating attendance record

**Example**:
- ✅ Clock-in at 7:30 AM → Allowed
- ✅ Clock-in at 9:59 AM → Allowed
- ❌ Clock-in at 5:59 AM → Rejected (before window)
- ❌ Clock-in at 10:00 AM → Rejected (at end boundary, exclusive)
- ❌ Clock-in at 2:00 PM → Rejected (outside window)

### Minimum Work Hours

```typescript
MINIMUM_WORK_HOURS = {
  fullDay: 8,  // 8 hours = 480 minutes
}
```

**Purpose**: Defines the minimum hours required for a full day (present status).

**Logic**:
- If work duration >= `fullDay` hours → Status: "present"
- If work duration < `fullDay` hours but >= 1 hour → Status: "partial"
- If work duration < 1 hour → Status: "partial" (edge case)

**Example**:
- Worked 8 hours 30 minutes → Status: "present"
- Worked 7 hours 45 minutes → Status: "partial"
- Worked 2 hours → Status: "partial"

## Business Rules

### Rule 1: Prevent Clock-In Outside Allowed Time Window

**Implementation**: `app/api/attendance/clock-in/route.ts`

**Logic Flow**:
1. User attempts to clock in
2. System checks current time hour
3. If hour < `CLOCK_IN_WINDOW.start` OR hour >= `CLOCK_IN_WINDOW.end`:
   - Return error: "Clock-in is only allowed between X:00 and Y:00"
   - Status code: 400 (Bad Request)
   - Error code: `CLOCK_IN_OUTSIDE_WINDOW`
4. If within window, proceed with clock-in

**Error Response**:
```json
{
  "message": "Clock-in is only allowed between 6:00 and 10:00. Please clock in during the allowed time window.",
  "error": "CLOCK_IN_OUTSIDE_WINDOW"
}
```

**Benefits**:
- Prevents early/late clock-ins
- Enforces consistent work start times
- Reduces attendance manipulation

### Rule 2: Prevent Double Clock-In

**Implementation**: `app/api/attendance/clock-in/route.ts`

**Logic Flow**:
1. Check if attendance record exists for today
2. If record exists AND `loginTime` is set:
   - Return existing record
   - Message: "You have already clocked in for today"
   - Status code: 200 (OK)
   - Flag: `alreadyClockedIn: true`
3. If record exists but `loginTime` is not set:
   - Update record with current time
4. If no record exists:
   - Create new attendance record

**Error Response**:
```json
{
  "attendance": { /* existing record */ },
  "message": "You have already clocked in for today",
  "alreadyClockedIn": true,
  "error": "ALREADY_CLOCKED_IN"
}
```

**Benefits**:
- Prevents accidental duplicate clock-ins
- Maintains data integrity
- Provides clear feedback to users

### Rule 3: Prevent Double Clock-Out

**Implementation**: `app/api/attendance/clock-out/route.ts`

**Logic Flow**:
1. Find today's attendance record
2. Validate record exists (error if not)
3. Validate `loginTime` exists (error if not)
4. Check if `logoutTime` is already set:
   - If yes: Return existing record with message
   - If no: Proceed with clock-out

**Error Response**:
```json
{
  "attendance": { /* existing record */ },
  "message": "You have already clocked out for today",
  "alreadyClockedOut": true,
  "error": "ALREADY_CLOCKED_OUT"
}
```

**Benefits**:
- Prevents duplicate clock-outs
- Maintains accurate duration calculations
- Prevents data corruption

### Rule 4: Auto-Mark Partial Day

**Implementation**: `app/api/attendance/clock-out/route.ts`

**Logic Flow**:
1. User clocks out
2. Calculate duration: `logoutTime - loginTime` (in minutes)
3. Determine status using `determineAttendanceStatus()`:
   - If duration >= `MINIMUM_WORK_MINUTES` (480 minutes / 8 hours):
     - Status: "present"
   - If duration >= 60 minutes (1 hour):
     - Status: "partial"
   - If duration < 60 minutes:
     - Status: "partial" (edge case - they did clock in/out)

**Status Determination**:
```typescript
function determineAttendanceStatus(durationMinutes: number): "present" | "partial" {
  if (durationMinutes >= 480) return "present";  // 8+ hours
  if (durationMinutes >= 60) return "partial";   // 1-8 hours
  return "partial";  // < 1 hour (edge case)
}
```

**Example Scenarios**:
- Clock-in: 9:00 AM, Clock-out: 5:30 PM → Duration: 8.5 hours → Status: "present"
- Clock-in: 9:00 AM, Clock-out: 2:00 PM → Duration: 5 hours → Status: "partial"
- Clock-in: 9:00 AM, Clock-out: 9:45 AM → Duration: 45 minutes → Status: "partial"

**Benefits**:
- Automatic status assignment
- Consistent attendance tracking
- Configurable thresholds
- No manual intervention required

## Helper Functions

### `isWithinClockInWindow(currentTime: Date)`

**Purpose**: Validates if current time is within allowed clock-in window.

**Returns**:
```typescript
{
  isValid: boolean;
  error?: string;
}
```

**Usage**: Called before processing clock-in request.

### `calculateDuration(loginTime: Date, logoutTime: Date)`

**Purpose**: Calculates work duration in minutes.

**Returns**: `number` (minutes, rounded)

**Formula**: `(logoutTime - loginTime) / (1000 * 60)`

**Usage**: Called during clock-out to determine duration.

### `determineAttendanceStatus(durationMinutes: number)`

**Purpose**: Determines attendance status based on duration.

**Returns**: `"present" | "partial"`

**Logic**:
- >= 8 hours → "present"
- >= 1 hour → "partial"
- < 1 hour → "partial" (edge case)

**Usage**: Called during clock-out to set status.

### `getTodayDateRange()`

**Purpose**: Gets UTC date range for today (start and end).

**Returns**:
```typescript
{
  today: Date;      // 00:00:00 UTC
  todayEnd: Date;  // 23:59:59.999 UTC
}
```

**Usage**: Used for querying today's attendance records.

## API Endpoints

### POST `/api/attendance/clock-in`

**Rules Applied**:
1. ✅ Time window validation
2. ✅ Double clock-in prevention

**Request**: No body required (uses session)

**Response**:
```json
{
  "attendance": { /* attendance record */ },
  "message": "Clocked in successfully",
  "alreadyClockedIn": false
}
```

**Error Cases**:
- `400`: Clock-in outside time window
- `200`: Already clocked in (returns existing record)
- `401`: Unauthorized
- `500`: Server error

### PUT `/api/attendance/clock-out`

**Rules Applied**:
1. ✅ Double clock-out prevention
2. ✅ Auto-mark partial day

**Request**: No body required (uses session)

**Response**:
```json
{
  "attendance": { /* attendance record */ },
  "message": "Clocked out successfully",
  "alreadyClockedOut": false,
  "duration": 510,
  "status": "present"
}
```

**Error Cases**:
- `404`: No attendance record found
- `400`: Not clocked in
- `200`: Already clocked out (returns existing record)
- `401`: Unauthorized
- `500`: Server error

## Data Model

### Attendance Schema

```typescript
{
  userId: ObjectId;
  loginTime: Date;        // Required
  logoutTime: Date | null; // Optional
  date: Date;             // Date portion (YYYY-MM-DD)
  duration: number;       // Minutes (calculated)
  status: "present" | "absent" | "partial";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Status Values

- **"present"**: Full day attendance (>= 8 hours)
- **"partial"**: Less than full day (< 8 hours but clocked in/out)
- **"absent"**: No clock-in recorded (typically set by other processes)

## Customization

### Change Clock-In Window

Edit `lib/constants/attendance.ts`:
```typescript
export const CLOCK_IN_WINDOW = {
  start: 7,  // 7:00 AM
  end: 11,   // 11:00 AM
} as const;
```

### Change Minimum Work Hours

Edit `lib/constants/attendance.ts`:
```typescript
export const MINIMUM_WORK_HOURS = {
  fullDay: 7,  // 7 hours instead of 8
} as const;
```

**Note**: After changing constants, restart the application for changes to take effect.

## Error Handling

All errors return consistent format:
```json
{
  "message": "User-friendly error message",
  "error": "ERROR_CODE"
}
```

**Error Codes**:
- `CLOCK_IN_OUTSIDE_WINDOW`: Clock-in attempted outside allowed window
- `ALREADY_CLOCKED_IN`: User already clocked in today
- `ALREADY_CLOCKED_OUT`: User already clocked out today
- `NOT_CLOCKED_IN`: Attempted clock-out without clock-in
- `NO_ATTENDANCE_RECORD`: No attendance record found for today

## Testing Scenarios

### Scenario 1: Normal Clock-In/Out
1. Clock-in at 8:00 AM → ✅ Success
2. Clock-out at 5:00 PM → ✅ Success, Status: "present" (9 hours)

### Scenario 2: Early Clock-In Attempt
1. Clock-in at 5:30 AM → ❌ Error: Outside time window

### Scenario 3: Partial Day
1. Clock-in at 9:00 AM → ✅ Success
2. Clock-out at 2:00 PM → ✅ Success, Status: "partial" (5 hours)

### Scenario 4: Double Clock-In
1. Clock-in at 8:00 AM → ✅ Success
2. Clock-in at 8:30 AM → ✅ Returns existing record, `alreadyClockedIn: true`

### Scenario 5: Double Clock-Out
1. Clock-in at 8:00 AM → ✅ Success
2. Clock-out at 5:00 PM → ✅ Success
3. Clock-out at 5:30 PM → ✅ Returns existing record, `alreadyClockedOut: true`

## Migration Notes

**No Breaking Changes**:
- Existing attendance records remain valid
- API endpoints maintain backward compatibility
- Default values match previous behavior (8 hours threshold)
- All changes are additive (new validations, not removals)

**Backward Compatibility**:
- Existing clock-in/out flows continue to work
- New validations only add restrictions
- Error responses include both message and error code for flexibility

