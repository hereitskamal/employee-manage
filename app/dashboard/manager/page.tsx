// app/dashboard/manager/page.tsx
"use client";

import { Box, Grid, Card, CardContent, Typography, Button } from "@mui/material";
import { useSalesAnalysis } from "@/hooks/useSalesAnalysis";
import { useSales } from "@/hooks/useSales";
import { useAttendance } from "@/hooks/useAttendance";
import RevenueChart from "@/components/sales/RevenueChart";
import SalesByEmployeeChart from "@/components/sales/SalesByEmployeeChart";
import { useRouter } from "next/navigation";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function ManagerDashboard() {
    const router = useRouter();
    const { stats, analysisData, loading: analysisLoading } = useSalesAnalysis();
    const { sales, loading: salesLoading } = useSales({ limit: 10 });
    const { attendance, loading: attendanceLoading } = useAttendance({ limit: 10 });

    const presentCount = attendance.filter((a) => a.status === "present").length;
    const teamSales = analysisData?.salesByEmployee || [];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                Manager Dashboard
            </Typography>

            {/* Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Team Revenue
                                    </Typography>
                                    <Typography variant="h5">
                                        ₹{stats?.month.revenue.toLocaleString() || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        This Month
                                    </Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: "primary.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Team Sales
                                    </Typography>
                                    <Typography variant="h5">{stats?.month.count || 0}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        This Month
                                    </Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: "success.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Team Present
                                    </Typography>
                                    <Typography variant="h5">{presentCount}</Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Today
                                    </Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: "info.main" }} />
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
                    View Team Sales
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/attendance")}
                >
                    View Team Attendance
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/sales/analysis")}
                >
                    Sales Analysis
                </Button>
            </Box>

            {/* Charts */}
            {analysisData && (
                <Grid spacing={3}>
                    <Grid item xs={12}>
                        <RevenueChart data={analysisData.revenueTrends} period="monthly" />
                    </Grid>
                    <Grid item xs={12}>
                        <SalesByEmployeeChart data={analysisData.salesByEmployee} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

