// components/sales/WeeklyRevenueChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface WeeklyRevenueChartProps {
    thisWeek: Array<{ day: string; revenue: number }>;
    lastWeek: Array<{ day: string; revenue: number }>;
    height?: string | number;
}

export default function WeeklyRevenueChart({
    thisWeek,
    lastWeek,
    height = "300px",
}: WeeklyRevenueChartProps) {
    const option = useMemo(() => {
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        
        // Map data to days
        const thisWeekData = days.map((day) => {
            const found = thisWeek.find((item) => item.day === day);
            return found ? found.revenue : 0;
        });

        const lastWeekData = days.map((day) => {
            const found = lastWeek.find((item) => item.day === day);
            return found ? found.revenue : 0;
        });

        return {
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
                        result += `${param.marker}${param.seriesName}: $${param.value.toLocaleString()}<br/>`;
                    });
                    return result;
                },
            },
            legend: {
                data: ["This week", "Last week"],
                top: "5%",
                icon: "circle",
            },
            xAxis: {
                type: "category",
                data: days,
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
                    name: "This week",
                    type: "line",
                    data: thisWeekData,
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
                },
                {
                    name: "Last week",
                    type: "line",
                    data: lastWeekData,
                    smooth: true,
                    lineStyle: {
                        width: 3,
                        color: "#f59e0b",
                    },
                    itemStyle: {
                        color: "#f59e0b",
                    },
                    areaStyle: {
                        color: {
                            type: "linear",
                            x: 0,
                            y: 0,
                            x2: 0,
                            y2: 1,
                            colorStops: [
                                { offset: 0, color: "rgba(245, 158, 11, 0.3)" },
                                { offset: 1, color: "rgba(245, 158, 11, 0.05)" },
                            ],
                        },
                    },
                },
            ],
        };
    }, [thisWeek, lastWeek]);

    return (
        <ReactECharts
            option={option}
            style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
            opts={{ renderer: "svg" }}
        />
    );
}

