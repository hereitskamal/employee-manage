// app/dashboard/admin/page.tsx
"use client";

import { Box, Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useSalesAnalysis } from "@/hooks/useSalesAnalysis";
import { useSales } from "@/hooks/useSales";
import { useAttendance } from "@/hooks/useAttendance";
import RevenueChart from "@/components/sales/RevenueChart";
import TopProductsChart from "@/components/sales/TopProductsChart";
import SalesByEmployeeChart from "@/components/sales/SalesByEmployeeChart";
import { useRouter } from "next/navigation";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function AdminDashboard() {
    const router = useRouter();
    const { stats, analysisData, loading: analysisLoading } = useSalesAnalysis();
    const { sales, loading: salesLoading } = useSales({ limit: 10 });
    const { attendance, loading: attendanceLoading } = useAttendance({ limit: 10 });

    const presentCount = attendance.filter((a) => a.status === "present").length;
    const absentCount = attendance.filter((a) => a.status === "absent").length;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                Admin Dashboard
            </Typography>

            {/* Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="h5">
                                        ₹{stats?.overall.revenue.toLocaleString() || 0}
                                    </Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: "primary.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Sales
                                    </Typography>
                                    <Typography variant="h5">{stats?.overall.count || 0}</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: "success.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Present Today
                                    </Typography>
                                    <Typography variant="h5">{presentCount}</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: "info.main" }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Absent Today
                                    </Typography>
                                    <Typography variant="h5">{absentCount}</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: "error.main" }} />
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
                    View All Sales
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => router.push("/dashboard/attendance/daily-logs")}
                >
                    View Daily Logs
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
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <RevenueChart data={analysisData.revenueTrends} period="monthly" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <TopProductsChart data={analysisData.topProducts} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <SalesByEmployeeChart data={analysisData.salesByEmployee} />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
}

