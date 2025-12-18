// components/attendance/UserAttendanceCard.tsx
"use client";

import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import { AttendanceRow } from "@/types/attendance";

interface UserAttendanceCardProps {
    attendance: AttendanceRow;
}

export default function UserAttendanceCard({ attendance }: UserAttendanceCardProps) {
    const formatTime = (date: Date | string | null | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleTimeString();
    };

    const formatDuration = (minutes: number | undefined) => {
        if (minutes === undefined || minutes === null) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <Card variant="outlined">
            <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6">
                        {new Date(attendance.date).toLocaleDateString()}
                    </Typography>
                    <Chip
                        label={attendance.status}
                        color={
                            attendance.status === "present"
                                ? "success"
                                : attendance.status === "partial"
                                ? "warning"
                                : "error"
                        }
                        size="small"
                    />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Login Time
                        </Typography>
                        <Typography>{formatTime(attendance.loginTime)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Logout Time
                        </Typography>
                        <Typography>{formatTime(attendance.logoutTime)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">
                            Duration
                        </Typography>
                        <Typography>{formatDuration(attendance.duration)}</Typography>
                    </Box>
                    {attendance.notes && (
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Notes
                            </Typography>
                            <Typography variant="body2">{attendance.notes}</Typography>
                        </Box>
                    )}
                </Box>
            </CardContent>
        </Card>
    );
}

