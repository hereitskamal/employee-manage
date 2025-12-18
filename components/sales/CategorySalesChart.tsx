// components/sales/CategorySalesChart.tsx
"use client";

import { useMemo } from "react";
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";
import { Box, Typography } from "@mui/material";

interface CategorySalesChartProps {
    data: Array<{
        category: string;
        totalRevenue: number;
        totalQuantity: number;
    }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            name: item.category,
            value: item.totalRevenue,
            quantity: item.totalQuantity,
        }));
    }, [data]);

    return (
        <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Sales by Category
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number) => `₹${value.toLocaleString()}`}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </Box>
    );
}

