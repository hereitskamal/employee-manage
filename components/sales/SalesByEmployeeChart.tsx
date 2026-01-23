// components/sales/SalesByEmployeeChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

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
            name: item.employeeName.length > 15 
                ? item.employeeName.substring(0, 15) + "..." 
                : item.employeeName,
            sales: item.totalSales,
            count: item.saleCount,
        }));
    }, [data]);

    const option = useMemo(() => ({
        grid: {
            left: "3%",
            right: "4%",
            bottom: "15%",
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
                let result = `<b>${params[0].axisValue}</b><br/>`;
                params.forEach((param: any) => {
                    if (param.seriesName === "Total Sales") {
                        result += `${param.marker}${param.seriesName}: $${param.value.toLocaleString()}<br/>`;
                    } else {
                        result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
                    }
                });
                return result;
            },
        },
        legend: {
            data: ["Total Sales", "Sale Count"],
            top: "5%",
            icon: "circle",
        },
        xAxis: {
            type: "category",
            data: chartData.map((item) => item.name),
            axisLine: {
                lineStyle: {
                    color: "#e5e7eb",
                },
            },
            axisLabel: {
                color: "#9ca3af",
                rotate: -45,
                interval: 0,
            },
        },
        yAxis: {
            type: "value",
            axisLine: {
                show: false,
            },
            axisLabel: {
                color: "#9ca3af",
                formatter: (value: number) => {
                    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
                    return `$${value}`;
                },
            },
            splitLine: {
                lineStyle: {
                    color: "#f3f4f6",
                },
            },
        },
        series: [
            {
                name: "Total Sales",
                type: "bar",
                data: chartData.map((item) => item.sales),
                itemStyle: {
                    color: "#3b82f6",
                    borderRadius: [4, 4, 0, 0],
                },
            },
            {
                name: "Sale Count",
                type: "bar",
                data: chartData.map((item) => item.count),
                itemStyle: {
                    color: "#10b981",
                    borderRadius: [4, 4, 0, 0],
                },
            },
        ],
    }), [chartData]);

    return (
        <ChartCard title="Sales Performance by Employee">
            <ReactECharts
                option={option}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}

