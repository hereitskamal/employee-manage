// components/sales/RevenueChart.tsx
"use client";

import { useMemo } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface RevenueChartProps {
    data: Array<{ _id: string; revenue: number; count: number }>;
    period?: "daily" | "weekly" | "monthly";
}

export default function RevenueChart({ data, period = "monthly" }: RevenueChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            period: item._id,
            revenue: item.revenue,
            sales: item.count,
        }));
    }, [data]);

    return (
        <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Revenue Trends ({period})
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="Revenue"
                    />
                    <Line
                        type="monotone"
                        dataKey="sales"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Sales Count"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

