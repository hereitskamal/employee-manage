// components/sales/SalesByEmployeeChart.tsx
"use client";

import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface SalesByEmployeeChartProps {
    data: Array<{
        employeeId: string;
        employeeName: string;
        employeeEmail: string;
        totalSales: number;
        saleCount: number;
    }>;
}

export default function SalesByEmployeeChart({ data }: SalesByEmployeeChartProps) {
    const chartData = useMemo(() => {
        return data.slice(0, 10).map((item) => ({
            name: item.employeeName,
            sales: item.totalSales,
            count: item.saleCount,
        }));
    }, [data]);

    return (
        <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Sales Performance by Employee
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === "sales") {
                                return `₹${value.toLocaleString()}`;
                            }
                            return value;
                        }}
                    />
                    <Legend />
                    <Bar dataKey="sales" fill="#8884d8" name="Total Sales (₹)" />
                    <Bar dataKey="count" fill="#82ca9d" name="Sale Count" />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}

