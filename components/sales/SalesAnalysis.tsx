// components/sales/SalesAnalysis.tsx
"use client";

import { useState } from "react";
import { Box, TextField, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { useSalesAnalysis } from "@/hooks/useSalesAnalysis";
import RevenueChart from "./RevenueChart";
import TopProductsChart from "./TopProductsChart";
import SalesByEmployeeChart from "./SalesByEmployeeChart";
import CategorySalesChart from "./CategorySalesChart";
import { formatCurrency } from "@/lib/utils/currency";

export default function SalesAnalysis() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("monthly");

    const { analysisData, stats, loading } = useSalesAnalysis({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        period,
    });

    return (
        <Box sx={{ p: 3, width: "100%" }}>
            <Box sx={{ mb: 3, width: "100%", display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200 }}
                />
                <TextField
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ minWidth: 200 }}
                />
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Period</InputLabel>
                    <Select
                        value={period}
                        label="Period"
                        onChange={(e) => setPeriod(e.target.value as "daily" | "weekly" | "monthly")}
                    >
                        <MenuItem value="daily">Daily</MenuItem>
                        <MenuItem value="weekly">Weekly</MenuItem>
                        <MenuItem value="monthly">Monthly</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {stats && (
                <Box sx={{ mb: 3, justifyContent: "space-between", display: "flex", gap: 2 }}>
                    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, minWidth: 150 , width: "100%"}}>
                        <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Today</Box>
                        <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {formatCurrency(stats.today.revenue)}
                        </Box>
                        <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                            {stats.today.count} sales
                        </Box>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, minWidth: 150 , width: "100%"}}>
                        <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>This Week</Box>
                        <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {formatCurrency(stats.week.revenue)}
                        </Box>
                        <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                            {stats.week.count} sales
                        </Box>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, minWidth: 150 , width: "100%"}}>
                        <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>This Month</Box>
                        <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {formatCurrency(stats.month.revenue)}
                        </Box>
                        <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                            {stats.month.count} sales
                        </Box>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 2, minWidth: 150 , width: "100%"}}>
                        <Box sx={{ color: "text.secondary", fontSize: "0.875rem" }}>Overall</Box>
                        <Box sx={{ fontSize: "1.5rem", fontWeight: 600 }}>
                            {formatCurrency(stats.overall.revenue)}
                        </Box>
                        <Box sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                            Avg: {formatCurrency(Math.round(stats.overall.average))}
                        </Box>
                    </Box>
                </Box>
            )}

            {loading ? (
                <Box>Loading...</Box>
            ) : analysisData ? (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <RevenueChart data={analysisData.revenueTrends} period={period} />
                    </Box>
                    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
                        <Box sx={{ flex: 1 }}>
                            <TopProductsChart data={analysisData.topProducts} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <CategorySalesChart data={analysisData.salesByCategory} />
                        </Box>
                    </Box>
                    <Box>
                        <SalesByEmployeeChart data={analysisData.salesByEmployee} />
                    </Box>
                </Box>
            ) : (
                <Box>No data available</Box>
            )}
        </Box>
    );
}

