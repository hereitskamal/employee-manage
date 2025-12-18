// app/dashboard/spc/page.tsx
"use client";

import { Box, Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useSales } from "@/hooks/useSales";
import { useRouter } from "next/navigation";
import SalesTable from "@/components/sales/SalesTable";
import InventoryIcon from "@mui/icons-material/Inventory";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

export default function SPCDashboard() {
    const router = useRouter();
    const { sales, loading: salesLoading } = useSales({ limit: 10 });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0);

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
                SPC Dashboard
            </Typography>

            {/* Overview Cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <Box>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total Sales
                                    </Typography>
                                    <Typography variant="h5">{totalSales}</Typography>
                                </Box>
                                <InventoryIcon sx={{ fontSize: 40, color: "primary.main" }} />
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
                                        Total Revenue
                                    </Typography>
                                    <Typography variant="h5">₹{totalRevenue.toLocaleString()}</Typography>
                                </Box>
                                <AttachMoneyIcon sx={{ fontSize: 40, color: "success.main" }} />
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
                    onClick={() => router.push("/dashboard/products")}
                >
                    Manage Products
                </Button>
            </Box>

            {/* Recent Sales */}
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Recent Sales
                </Typography>
                <SalesTable rows={sales.slice(0, 10)} loading={salesLoading} fetchSales={() => {}} />
            </Box>
        </Box>
    );
}

