// app/dashboard/employee/page.tsx
"use client";

import { useState } from "react";
import { Box, Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useSales } from "@/hooks/useSales";
import { useAttendance } from "@/hooks/useAttendance";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import SalesTable from "@/components/sales/SalesTable";
import UserAttendanceCard from "@/components/attendance/UserAttendanceCard";
import ClockInOutButton from "@/components/attendance/ClockInOutButton";
import DailyReportModal from "@/components/attendance/DailyReportModal";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { AttendanceRow } from "@/types/attendance";

export default function EmployeeDashboard() {
    const { data: session } = useSession();
    const router = useRouter();
    const { sales, loading: salesLoading } = useSales({ limit: 5 });
    const { 
        attendance, 
        loading: attendanceLoading, 
        todayAttendance,
        clockIn,
        clockOut,
        getTodayAttendance,
        setTodayAttendance
    } = useAttendance({ limit: 5 });
    
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [lastClockedInAttendance, setLastClockedInAttendance] = useState<AttendanceRow | null>(null);

    const personalSales = sales.filter(
        (sale) =>
            (typeof sale.soldBy === "object" && sale.soldBy !== null
                ? (sale.soldBy as { _id?: string })._id
                : sale.soldBy) === session?.user?.id
    );

    const totalRevenue = personalSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);
    const recentAttendance = attendance.slice(0, 3);

    const handleClockIn = async () => {
        try {
            const result = await clockIn();
            // Always show daily report modal when clocking in
            if (result && result.attendance) {
                setLastClockedInAttendance(result.attendance);
                setShowDailyReport(true);
                // Update todayAttendance immediately from the response
                if (setTodayAttendance) {
                    setTodayAttendance(result.attendance);
                }
            }
            // Also refresh from API to ensure consistency
            await getTodayAttendance();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleClockOut = async () => {
        try {
            const result = await clockOut();
            // Update todayAttendance immediately from the response
            if (result && result.attendance && setTodayAttendance) {
                setTodayAttendance(result.attendance);
            }
            // Also refresh from API to ensure consistency
            await getTodayAttendance();
            return result;
        } catch (error) {
            throw error;
        }
    };

    const handleStatusChange = (attendance: AttendanceRow | null) => {
        // Update todayAttendance directly from the callback
        if (setTodayAttendance) {
            setTodayAttendance(attendance);
        }
        // Also refresh from API to ensure consistency
        getTodayAttendance();
    };

    console.log(todayAttendance);
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                My Dashboard
            </Typography>

            {/* Clock In/Out Button */}
            <ClockInOutButton
                todayAttendance={todayAttendance || null}
                onClockIn={handleClockIn}
                onClockOut={handleClockOut}
                onStatusChange={handleStatusChange}
            />

            {/* Daily Report Modal */}
            <DailyReportModal
                open={showDailyReport}
                onClose={() => setShowDailyReport(false)}
                attendance={lastClockedInAttendance || todayAttendance}
            />

            {/* Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        My Total Sales
                                    </Typography>
                                    <Typography variant="h5">{personalSales.length}</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: "success.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        My Revenue
                                    </Typography>
                                    <Typography variant="h5">₹{totalRevenue.toLocaleString()}</Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: "primary.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Attendance Records
                                    </Typography>
                                    <Typography variant="h5">{attendance.length}</Typography>
                                </Box>
                                <AccessTimeIcon sx={{ fontSize: 40, color: "info.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Quick Actions */}
            <Box sx={{ mb: 4, display: "flex", gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => router.push("/dashboard/sales")}
                >
                    View My Sales
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/attendance")}
                >
                    View My Attendance
                </Button>
            </Box>

            {/* Recent Sales */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Sales
                </Typography>
                <SalesTable rows={personalSales.slice(0, 5)} loading={salesLoading} fetchSales={() => {}} />
            </Box>

            {/* Recent Attendance */}
            {recentAttendance.length > 0 && (
                <Box>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Recent Attendance
                    </Typography>
                    <Grid container spacing={2}>
                        {recentAttendance.map((record) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={record._id || record.id}>
                                <UserAttendanceCard attendance={record} />
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
}

