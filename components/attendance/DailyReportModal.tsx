// components/attendance/DailyReportModal.tsx
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    Divider,
    Chip,
    CircularProgress,
    Alert,
    Grid,
} from "@mui/material";
import { AttendanceRow } from "@/types/attendance";
import { SaleRow } from "@/types/sale";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

interface DailyReportModalProps {
    open: boolean;
    onClose: () => void;
    attendance: AttendanceRow | null;
}

interface DailyStats {
    attendance: AttendanceRow | null;
    sales: {
        count: number;
        completedCount: number;
        totalRevenue: number;
        completedRevenue: number;
        sales: SaleRow[];
    };
}

export default function DailyReportModal({
    open,
    onClose,
    attendance,
}: DailyReportModalProps) {
    const [dailyStats, setDailyStats] = useState<DailyStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isFetchingRef = useRef(false);

    const fetchDailyStats = useCallback(async () => {
        // Prevent duplicate concurrent fetches
        if (isFetchingRef.current) {
            return;
        }

        isFetchingRef.current = true;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch("/api/attendance/daily-stats");
            if (!response.ok) {
                throw new Error("Failed to fetch daily statistics");
            }
            const data: DailyStats = await response.json();
            setDailyStats(data);
        } catch (err) {
            console.error("Failed to fetch daily stats:", err);
            setError(err instanceof Error ? err.message : "Failed to load daily statistics");
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, []);

    useEffect(() => {
        if (open) {
            fetchDailyStats();
        } else {
            // Reset error when modal closes
            setError(null);
        }
        // Only depend on 'open' - fetchDailyStats is stable and doesn't need to be in deps
        // This prevents unnecessary re-fetches when component re-renders while modal is open
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);
    const formatTime = (date: Date | string | null | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const formatDate = (date: Date | string | null | undefined) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatDuration = (minutes: number | undefined) => {
        if (minutes === undefined || minutes === null) return "N/A";
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const formatCurrency = (amount: number) => {
        return `₹${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Use attendance from props or from fetched stats
    const currentAttendance = dailyStats?.attendance || attendance;
    const today = new Date();
    const dateToShow = currentAttendance?.date || today;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CheckCircleIcon color="success" />
                    <Typography variant="h6">Daily Report</Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {formatDate(dateToShow)}
                    </Typography>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress />
                    </Box>
                )}

                {!loading && (
                    <>

                        <Divider sx={{ my: 2 }} />

                        {/* Attendance Section */}
                        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                            Attendance
                        </Typography>
                        {currentAttendance ? (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                        bgcolor: "action.hover",
                                        borderRadius: 1,
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <AccessTimeIcon color="primary" />
                                        <Typography variant="body1" fontWeight={500}>
                                            Status
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={currentAttendance.status}
                                        color={
                                            currentAttendance.status === "present"
                                                ? "success"
                                                : currentAttendance.status === "partial"
                                                ? "warning"
                                                : "error"
                                        }
                                        size="small"
                                    />
                                </Box>

                                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
                                    <Box sx={{ flex: 1, p: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Clock In Time
                                        </Typography>
                                        <Typography variant="h6" sx={{ mt: 0.5 }}>
                                            {formatTime(currentAttendance.loginTime)}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ flex: 1, p: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Clock Out Time
                                        </Typography>
                                        <Typography variant="h6" sx={{ mt: 0.5 }}>
                                            {currentAttendance.logoutTime
                                                ? formatTime(currentAttendance.logoutTime)
                                                : "Not clocked out"}
                                        </Typography>
                                    </Box>
                                </Box>

                                {currentAttendance.duration !== undefined && currentAttendance.duration !== null && (
                                    <Box
                                        sx={{
                                            p: 2,
                                            bgcolor: "primary.light",
                                            borderRadius: 1,
                                            color: "primary.contrastText",
                                        }}
                                    >
                                        <Typography variant="caption" display="block">
                                            Total Duration
                                        </Typography>
                                        <Typography variant="h5" sx={{ mt: 0.5 }}>
                                            {formatDuration(currentAttendance.duration)}
                                        </Typography>
                                    </Box>
                                )}

                                {currentAttendance.notes && (
                                    <Box sx={{ p: 2 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Notes
                                        </Typography>
                                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                                            {currentAttendance.notes}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            <Box sx={{ mb: 3, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    No attendance record for today yet.
                                </Typography>
                            </Box>
                        )}

                        {/* Sales Section */}
                        {dailyStats && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Sales Summary
                                </Typography>
                                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 2 }}>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            p: 2,
                                            bgcolor: "success.light",
                                            borderRadius: 1,
                                            color: "success.contrastText",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <ShoppingCartIcon />
                                            <Typography variant="caption" display="block">
                                                Total Sales Today
                                            </Typography>
                                        </Box>
                                        <Typography variant="h5" sx={{ mt: 0.5 }}>
                                            {dailyStats.sales.count}
                                        </Typography>
                                        <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                                            {dailyStats.sales.completedCount} completed
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            flex: 1,
                                            p: 2,
                                            bgcolor: "primary.light",
                                            borderRadius: 1,
                                            color: "primary.contrastText",
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <AttachMoneyIcon />
                                            <Typography variant="caption" display="block">
                                                Total Revenue Today
                                            </Typography>
                                        </Box>
                                        <Typography variant="h5" sx={{ mt: 0.5 }}>
                                            {formatCurrency(dailyStats.sales.totalRevenue)}
                                        </Typography>
                                        {dailyStats.sales.completedRevenue !== dailyStats.sales.totalRevenue && (
                                            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                                                {formatCurrency(dailyStats.sales.completedRevenue)} completed
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {dailyStats.sales.sales.length > 0 && (
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                            Recent Sales
                                        </Typography>
                                        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
                                            {dailyStats.sales.sales.map((sale, index) => (
                                                <Box
                                                    key={sale._id || sale.id || index}
                                                    sx={{
                                                        p: 1.5,
                                                        mb: 1,
                                                        bgcolor: "action.hover",
                                                        borderRadius: 1,
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" fontWeight={500}>
                                                            {typeof sale.soldBy === "object" && sale.soldBy !== null
                                                                ? (sale.soldBy as { name?: string }).name || "N/A"
                                                                : "Sale"}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {new Date(sale.saleDate).toLocaleTimeString()}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ textAlign: "right" }}>
                                                        <Typography variant="body2" fontWeight={600}>
                                                            {formatCurrency(sale.totalAmount)}
                                                        </Typography>
                                                        <Chip
                                                            label={sale.status}
                                                            size="small"
                                                            color={
                                                                sale.status === "completed"
                                                                    ? "success"
                                                                    : sale.status === "pending"
                                                                    ? "warning"
                                                                    : "error"
                                                            }
                                                            sx={{ mt: 0.5 }}
                                                        />
                                                    </Box>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                )}

                                {dailyStats.sales.count === 0 && (
                                    <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            No sales recorded for today.
                                        </Typography>
                                    </Box>
                                )}
                            </>
                        )}
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

