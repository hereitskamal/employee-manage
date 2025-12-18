// components/attendance/ClockInOutButton.tsx
"use client";

import { useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Chip,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { AttendanceRow } from "@/types/attendance";

interface ClockInOutButtonProps {
    todayAttendance: AttendanceRow | null;
    onClockIn: () => Promise<{ attendance: AttendanceRow; alreadyClockedIn?: boolean }>;
    onClockOut: () => Promise<{ attendance: AttendanceRow; alreadyClockedOut?: boolean }>;
    onStatusChange?: (attendance: AttendanceRow | null) => void;
}

export default function ClockInOutButton({
    todayAttendance,
    onClockIn,
    onClockOut,
    onStatusChange,
}: ClockInOutButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Determine current state: not clocked in, clocked in (can clock out), or clocked out
    const isClockedIn = !!todayAttendance?.loginTime && !todayAttendance?.logoutTime;
    const isClockedOut = !!todayAttendance?.logoutTime;
    // Can clock in only if there's no attendance record, or no login/logout time recorded yet
    // This prevents clocking in if already clocked out or in any malformed state
    const canClockIn = !todayAttendance || (!todayAttendance.loginTime && !todayAttendance.logoutTime);
    // Can clock out only if clocked in but not yet clocked out
    const canClockOut = isClockedIn && !isClockedOut;

    const formatTime = (date: Date | string | null | undefined) => {
        if (!date) return null;
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleClockIn = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await onClockIn();
            if (onStatusChange) {
                onStatusChange(result.attendance);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to clock in");
        } finally {
            setLoading(false);
        }
    };

    const handleClockOut = async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await onClockOut();
            if (onStatusChange) {
                onStatusChange(result.attendance);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to clock out");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom>
                            Daily Attendance
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                            {isClockedIn && (
                                <Chip
                                    icon={<AccessTimeIcon />}
                                    label={`Clocked In: ${formatTime(todayAttendance?.loginTime)}`}
                                    color="success"
                                    size="small"
                                />
                            )}
                            {isClockedOut && (
                                <Chip
                                    icon={<LogoutIcon />}
                                    label={`Clocked Out: ${formatTime(todayAttendance?.logoutTime)}`}
                                    color="info"
                                    size="small"
                                />
                            )}
                            {!isClockedIn && !isClockedOut && (
                                <Typography variant="body2" color="text.secondary">
                                    Not clocked in today
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        {/* Show Clock In button only when user can clock in (not clocked in yet) */}
                        {canClockIn && (
                            <Button
                                variant="contained"
                                color="success"
                                size="large"
                                startIcon={<LoginIcon />}
                                onClick={handleClockIn}
                                disabled={loading || isClockedOut}
                                sx={{ minWidth: 150 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Clock In"
                                )}
                            </Button>
                        )}
                        {/* Show Clock Out button only when user is clocked in (can clock out) */}
                        {canClockOut && (
                            <Button
                                variant="contained"
                                color="error"
                                size="large"
                                startIcon={<LogoutIcon />}
                                onClick={handleClockOut}
                                disabled={loading}
                                sx={{ minWidth: 150 }}
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Clock Out"
                                )}
                            </Button>
                        )}
                        {/* Show message when already clocked out for the day */}
                        {isClockedOut && !canClockIn && !canClockOut && (
                            <Typography variant="body2" color="text.secondary" sx={{ alignSelf: "center" }}>
                                You have completed your attendance for today
                            </Typography>
                        )}
                    </Box>
                </Box>
                {error && (
                    <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}

