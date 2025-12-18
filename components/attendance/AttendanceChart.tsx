// components/attendance/AttendanceChart.tsx
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

interface AttendanceChartProps {
    data: Array<{
        date: string;
        present: number;
        absent: number;
        partial: number;
    }>;
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            date: new Date(item.date).toLocaleDateString(),
            present: item.present,
            absent: item.absent,
            partial: item.partial,
        }));
    }, [data]);

    return (
        <Box sx={{ width: "100%", height: 400 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Attendance Trends
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="present"
                        stroke="#82ca9d"
                        strokeWidth={2}
                        name="Present"
                    />
                    <Line
                        type="monotone"
                        dataKey="absent"
                        stroke="#ff8042"
                        strokeWidth={2}
                        name="Absent"
                    />
                    <Line
                        type="monotone"
                        dataKey="partial"
                        stroke="#ffbb28"
                        strokeWidth={2}
                        name="Partial"
                    />
                </LineChart>
            </ResponsiveContainer>
        </Box>
    );
}

