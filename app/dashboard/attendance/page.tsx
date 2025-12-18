// app/dashboard/attendance/page.tsx
"use client";

import { Box, Typography } from "@mui/material";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceTable from "@/components/attendance/AttendanceTable";

export default function AttendancePage() {
    const { attendance, loading } = useAttendance({ limit: 50 });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                Attendance Records
            </Typography>
            <AttendanceTable rows={attendance} loading={loading} />
        </Box>
    );
}

