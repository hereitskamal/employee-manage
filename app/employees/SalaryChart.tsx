"use client";

import { useEffect, useState, useMemo } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
} from "recharts";
import { Card, CardHeader, CardContent, useTheme, Typography } from "@mui/material";

interface Employee {
    id: number;
    department: string;
    salary: number;
}

interface SalaryEntry {
    department: string;
    avgSalary: number;
}

export default function SalaryChart() {
    const theme = useTheme();
    const [employees, setEmployees] = useState<Employee[]>([]);

    // Fetch employees from API
    useEffect(() => {
        fetch("/api/employees")
            .then((res) => res.json())
            .then((data) => setEmployees(data))
            .catch((err) => console.error("Error loading employees:", err));
    }, []);

    // Compute salary aggregation
    const salaryData: SalaryEntry[] = useMemo(() => {
        if (employees.length === 0) return [];

        const grouped = employees.reduce(
            (acc: Record<string, { department: string; total: number; count: number }>, emp) => {
                if (!acc[emp.department]) {
                    acc[emp.department] = { department: emp.department, total: 0, count: 0 };
                }
                acc[emp.department].total += emp.salary;
                acc[emp.department].count += 1;
                return acc;
            },
            {}
        );

        return Object.values(grouped).map((d) => ({
            department: d.department,
            avgSalary: Math.round(d.total / d.count),
        }));
    }, [employees]);

    // Truncated X-axis Tick
    const EllipsisTick: React.FC<any> = ({ x, y, payload }) => {
        const text = payload.value;
        const maxLen = 10;
        const truncated = text.length > maxLen ? text.slice(0, maxLen) + "…" : text;

        return (
            <g transform={`translate(${x},${y})`}>
                <title>{text}</title>
                <text
                    x={0}
                    y={0}
                    dy={16}
                    textAnchor="middle"
                    fill="#666"
                    fontSize={12}
                >
                    {truncated}
                </text>
            </g>
        );
    };

    return (
        <Card sx={{ mt: 5, p: 3, boxShadow: 0 }}>
            <CardHeader
                title={
                    <Typography variant="h3" fontWeight={600} color="primary.main" fontFamily="poppins">
                        Average Salary by Department
                    </Typography>
                }
                sx={{ textAlign: "center", pb: 6 }}
            />
            <CardContent>
                <div style={{ width: "100%", height: 350 }}>
                    <ResponsiveContainer>
                        <BarChart data={salaryData} barSize={48}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke={theme.palette.divider}
                            />
                            <XAxis
                                dataKey="department"
                                tick={<EllipsisTick />}
                                interval={0}
                            />
                            <YAxis
                                tick={{ fill: theme.palette.text.secondary }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                }}
                            />
                            <Bar
                                dataKey="avgSalary"
                                fill="url(#lightGrayGradient)"
                                radius={[8, 8, 0, 0]}
                                stroke={theme.palette.divider}
                                strokeWidth={1}
                            >
                                <LabelList dataKey="avgSalary" position="top" fill={theme.palette.text.secondary} fontSize={12} />
                            </Bar>

                            <defs>
                                <linearGradient id="lightGrayGradient" x1="0" y1="0" x2="0" y2="2">
                                    <stop
                                        offset="0%"
                                        stopColor="#f5f5f5"
                                        stopOpacity={0.8}
                                    />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
