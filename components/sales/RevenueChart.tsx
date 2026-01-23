// components/sales/RevenueChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

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
                    if (param.seriesName === "Revenue") {
                        result += `${param.marker}${param.seriesName}: $${param.value.toLocaleString()}<br/>`;
                    } else {
                        result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
                    }
                });
                return result;
            },
        },
        legend: {
            data: ["Revenue", "Sales Count"],
            top: "5%",
            icon: "circle",
        },
        xAxis: {
            type: "category",
            data: chartData.map((item) => item.period),
            boundaryGap: false,
            axisLine: {
                lineStyle: {
                    color: "#e5e7eb",
                },
            },
            axisLabel: {
                color: "#9ca3af",
            },
        },
        yAxis: [
            {
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
            {
                type: "value",
                position: "right",
                axisLine: {
                    show: false,
                },
                axisLabel: {
                    color: "#9ca3af",
                },
                splitLine: {
                    show: false,
                },
            },
        ],
        series: [
            {
                name: "Revenue",
                type: "line",
                data: chartData.map((item) => item.revenue),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#3b82f6",
                },
                itemStyle: {
                    color: "#3b82f6",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(59, 130, 246, 0.3)" },
                            { offset: 1, color: "rgba(59, 130, 246, 0.05)" },
                        ],
                    },
                },
                yAxisIndex: 0,
            },
            {
                name: "Sales Count",
                type: "line",
                data: chartData.map((item) => item.sales),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#10b981",
                },
                itemStyle: {
                    color: "#10b981",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(16, 185, 129, 0.3)" },
                            { offset: 1, color: "rgba(16, 185, 129, 0.05)" },
                        ],
                    },
                },
                yAxisIndex: 1,
            },
        ],
    }), [chartData]);

    return (
        <ChartCard title={`Revenue Overview (${period})`}>
            <ReactECharts
                option={option}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}

