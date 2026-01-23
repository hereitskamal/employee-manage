// components/sales/TopProductsChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

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

    const option = useMemo(() => ({
        grid: {
            left: "20%",
            right: "4%",
            bottom: "3%",
            top: "15%",
            containLabel: false,
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
            data: ["Quantity Sold", "Revenue"],
            top: "5%",
            icon: "circle",
        },
        xAxis: {
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
        yAxis: {
            type: "category",
            data: chartData.map((item) => item.name),
            axisLine: {
                lineStyle: {
                    color: "#e5e7eb",
                },
            },
            axisLabel: {
                color: "#9ca3af",
                interval: 0,
            },
        },
        series: [
            {
                name: "Quantity Sold",
                type: "bar",
                data: chartData.map((item) => item.quantity),
                itemStyle: {
                    color: "#3b82f6",
                    borderRadius: [0, 4, 4, 0],
                },
            },
            {
                name: "Revenue",
                type: "bar",
                data: chartData.map((item) => item.revenue),
                itemStyle: {
                    color: "#10b981",
                    borderRadius: [0, 4, 4, 0],
                },
            },
        ],
    }), [chartData]);

    return (
        <ChartCard title="Top Selling Products">
            <ReactECharts
                option={option}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}

