// components/sales/CategorySalesChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

interface CategorySalesChartProps {
    data: Array<{
        category: string;
        totalRevenue: number;
        totalQuantity: number;
    }>;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function CategorySalesChart({ data }: CategorySalesChartProps) {
    const chartData = useMemo(() => {
        return data.map((item) => ({
            name: item.category,
            value: item.totalRevenue,
            quantity: item.totalQuantity,
        }));
    }, [data]);

    const option = useMemo(() => ({
        tooltip: {
            trigger: "item",
            backgroundColor: "white",
            borderColor: "#f0f0f0",
            borderRadius: 12,
            padding: 16,
            textStyle: {
                color: "#333",
            },
            formatter: (params: any) => {
                return `<b>${params.name}</b><br/>${params.marker}Revenue: $${params.value.toLocaleString()}<br/>Percentage: ${params.percent}%`;
            },
        },
        legend: {
            orient: "vertical",
            left: "left",
            top: "middle",
            icon: "circle",
            textStyle: {
                color: "#6b7280",
            },
        },
        series: [
            {
                name: "Sales by Category",
                type: "pie",
                radius: ["40%", "70%"],
                center: ["60%", "50%"],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: "#fff",
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: (params: any) => `${params.name}\n${params.percent}%`,
                    color: "#374151",
                    fontSize: 12,
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 14,
                        fontWeight: "bold",
                    },
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                    },
                },
                labelLine: {
                    show: true,
                },
                data: chartData.map((item, index) => ({
                    value: item.value,
                    name: item.name,
                    itemStyle: {
                        color: COLORS[index % COLORS.length],
                    },
                })),
            },
        ],
    }), [chartData]);

    return (
        <ChartCard title="Sales by Category">
            <ReactECharts
                option={option}
                style={{ height: "400px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}

