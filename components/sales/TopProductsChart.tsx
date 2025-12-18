// components/sales/TopProductsChart.tsx
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

interface TopProductsChartProps {
    data: Array<{
        productId: string;
        productName: string;
        productBrand: string;
        productCategory: string;
        totalQuantity: number;
        totalRevenue: number;
    }>;
}

export default function TopProductsChart({ data }: TopProductsChartProps) {
    const chartData = useMemo(() => {
        return data.slice(0, 10).map((item) => ({
            name: item.productName.length > 20 
                ? item.productName.substring(0, 20) + "..." 
                : item.productName,
            quantity: item.totalQuantity,
            revenue: item.totalRevenue,
        }));
    }, [data]);

    return (
        <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Top Selling Products
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip
                        formatter={(value: number, name: string) => {
                            if (name === "revenue") {
                                return `₹${value.toLocaleString()}`;
                            }
                            return value;
                        }}
                    />
                    <Legend />
                    <Bar dataKey="quantity" fill="#8884d8" name="Quantity Sold" />
                    <Bar dataKey="revenue" fill="#82ca9d" name="Revenue" />
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
}

