"use client";

import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

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

    const option = useMemo(() => ({
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "15%",
            containLabel: true,
        },
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow",
            },
            backgroundColor: "white",
            borderColor: "#f0f0f0",
            borderRadius: 12,
            padding: 16,
            textStyle: {
                color: "#333",
            },
            formatter: (params: any) => {
                const param = params[0];
                return `<b>${param.axisValue}</b><br/>${param.marker}Average Salary: $${param.value.toLocaleString()}`;
            },
        },
        xAxis: {
            type: "category",
            data: salaryData.map((item) => item.department),
            axisLine: {
                lineStyle: {
                    color: "#e5e7eb",
                },
            },
            axisLabel: {
                color: "#9ca3af",
                interval: 0,
                formatter: (value: string) => {
                    return value.length > 10 ? value.slice(0, 10) + "…" : value;
                },
            },
        },
        yAxis: {
            type: "value",
            axisLine: {
                show: false,
            },
            axisLabel: {
                color: "#9ca3af",
                formatter: (value: number) => `$${value.toLocaleString()}`,
            },
            splitLine: {
                lineStyle: {
                    color: "#f3f4f6",
                },
            },
        },
        series: [
            {
                name: "Average Salary",
                type: "bar",
                data: salaryData.map((item) => item.avgSalary),
                barWidth: "48px",
                itemStyle: {
                    color: "#3b82f6",
                    borderRadius: [4, 4, 0, 0],
                },
                label: {
                    show: true,
                    position: "top",
                    formatter: (params: any) => `$${params.value.toLocaleString()}`,
                    fontSize: 12,
                    color: "#6b7280",
                },
            },
        ],
    }), [salaryData]);

    return (
        <ChartCard title="Average Salary by Department">
            <ReactECharts
                option={option}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}
