// components/attendance/AttendanceChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import ChartCard from "@/components/dashboard/ChartCard";

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
                    result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
                });
                return result;
            },
        },
        legend: {
            data: ["Present", "Absent", "Partial"],
            top: "5%",
            icon: "circle",
        },
        xAxis: {
            type: "category",
            data: chartData.map((item) => item.date),
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
            },
            splitLine: {
                lineStyle: {
                    color: "#f3f4f6",
                },
            },
        },
        series: [
            {
                name: "Present",
                type: "line",
                data: chartData.map((item) => item.present),
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
            },
            {
                name: "Absent",
                type: "line",
                data: chartData.map((item) => item.absent),
                smooth: true,
                lineStyle: {
                    width: 3,
                    color: "#ef4444",
                },
                itemStyle: {
                    color: "#ef4444",
                },
                areaStyle: {
                    color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                            { offset: 0, color: "rgba(239, 68, 68, 0.3)" },
                            { offset: 1, color: "rgba(239, 68, 68, 0.05)" },
                        ],
                    },
                },
            },
            {
                name: "Partial",
                type: "line",
                data: chartData.map((item) => item.partial),
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
    }), [chartData]);

    return (
        <ChartCard title="Attendance Trends">
            <ReactECharts
                option={option}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
            />
        </ChartCard>
    );
}

