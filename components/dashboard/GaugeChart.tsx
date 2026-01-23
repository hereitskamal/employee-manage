// components/dashboard/GaugeChart.tsx
"use client";

import { useMemo } from "react";
import ReactECharts from "echarts-for-react";

interface GaugeChartProps {
    value: number;
    min: number;
    max: number;
    title: string;
    unit?: string;
    goodRange?: [number, number];
    badRange?: [number, number];
    height?: string | number;
}

export default function GaugeChart({
    value,
    min,
    max,
    title,
    unit = "",
    goodRange,
    badRange,
    height = "200px",
}: GaugeChartProps) {
    const option = useMemo(() => {
        // Calculate ranges for color zones
        const range = max - min;
        
        // Build color stops array - ECharts expects [percent, color] pairs
        const colorStops: Array<[number, string]> = [];
        
        if (badRange && goodRange) {
            const badStartPercent = Math.max(0, Math.min(1, (badRange[0] - min) / range));
            const badEndPercent = Math.max(0, Math.min(1, (badRange[1] - min) / range));
            const goodStartPercent = Math.max(0, Math.min(1, (goodRange[0] - min) / range));
            const goodEndPercent = Math.max(0, Math.min(1, (goodRange[1] - min) / range));
            
            // Determine which comes first: good or bad range
            if (goodStartPercent < badStartPercent) {
                // Good range comes first (e.g., Win Rate: green 0-40%, red 90-100%)
                if (goodStartPercent > 0) {
                    colorStops.push([0, "#6bcf7f"]); // Green from start
                }
                colorStops.push([goodStartPercent, "#6bcf7f"]);
                colorStops.push([goodEndPercent, "#6bcf7f"]);
                if (badStartPercent > goodEndPercent) {
                    colorStops.push([goodEndPercent, "#ffd93d"]); // Yellow transition
                    colorStops.push([badStartPercent, "#ffd93d"]);
                }
                colorStops.push([badStartPercent, "#ff6b6b"]); // Red
                colorStops.push([badEndPercent, "#ff6b6b"]);
                if (badEndPercent < 1) {
                    colorStops.push([1, "#ff6b6b"]);
                }
            } else {
                // Bad range comes first (e.g., Avg. Order Value: red 0-20, green 40-100)
                if (badStartPercent > 0) {
                    colorStops.push([0, "#ff6b6b"]); // Red from start
                }
                colorStops.push([badStartPercent, "#ff6b6b"]);
                colorStops.push([badEndPercent, "#ff6b6b"]);
                if (goodStartPercent > badEndPercent) {
                    colorStops.push([badEndPercent, "#ffd93d"]); // Yellow transition
                    colorStops.push([goodStartPercent, "#ffd93d"]);
                }
                colorStops.push([goodStartPercent, "#6bcf7f"]); // Green
                colorStops.push([goodEndPercent, "#6bcf7f"]);
                if (goodEndPercent < 1) {
                    colorStops.push([1, "#6bcf7f"]);
                }
            }
        } else if (goodRange) {
            const goodStartPercent = (goodRange[0] - min) / range;
            const goodEndPercent = (goodRange[1] - min) / range;
            if (goodStartPercent > 0) {
                colorStops.push([0, "#ff6b6b"]);
                colorStops.push([goodStartPercent, "#ff6b6b"]);
            }
            colorStops.push([goodStartPercent, "#6bcf7f"]);
            colorStops.push([goodEndPercent, "#6bcf7f"]);
            if (goodEndPercent < 1) {
                colorStops.push([goodEndPercent, "#ff6b6b"]);
                colorStops.push([1, "#ff6b6b"]);
            }
        } else {
            colorStops.push([1, "#6bcf7f"]);
        }

        return {
            series: [
                {
                    type: "gauge",
                    startAngle: 180,
                    endAngle: 0,
                    min,
                    max,
                    splitNumber: 8,
                    axisLine: {
                        lineStyle: {
                            width: 10,
                            color: colorStops,
                        },
                    },
                    pointer: {
                        icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
                        length: "75%",
                        width: 6,
                        offsetCenter: [0, "-60%"],
                        itemStyle: {
                            color: "#333",
                        },
                    },
                    axisTick: {
                        show: false,
                    },
                    splitLine: {
                        show: false,
                    },
                    axisLabel: {
                        show: false,
                    },
                    title: {
                        offsetCenter: [0, "25%"],
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#666",
                    },
                    detail: {
                        fontSize: 28,
                        offsetCenter: [0, "0%"],
                        valueAnimation: true,
                        formatter: (val: number) => {
                            // Format large numbers with commas
                            if (val >= 1000) {
                                return `${val.toLocaleString()}${unit}`;
                            }
                            return `${val}${unit}`;
                        },
                        color: (() => {
                            // Determine color based on which zone the value is in
                            const range = max - min;
                            const valuePercent = (value - min) / range;
                            
                            if (badRange && goodRange) {
                                const badStartPercent = (badRange[0] - min) / range;
                                const badEndPercent = (badRange[1] - min) / range;
                                const goodStartPercent = (goodRange[0] - min) / range;
                                const goodEndPercent = (goodRange[1] - min) / range;
                                
                                if (valuePercent >= badStartPercent && valuePercent <= badEndPercent) {
                                    return "#f44336"; // Red
                                }
                                if (valuePercent >= goodStartPercent && valuePercent <= goodEndPercent) {
                                    return "#4caf50"; // Green
                                }
                                return "#ffc107"; // Yellow (transition zone)
                            }
                            
                            if (goodRange) {
                                const goodStartPercent = (goodRange[0] - min) / range;
                                const goodEndPercent = (goodRange[1] - min) / range;
                                if (valuePercent >= goodStartPercent && valuePercent <= goodEndPercent) {
                                    return "#4caf50"; // Green
                                }
                                return "#f44336"; // Red
                            }
                            
                            return "#4caf50"; // Default green
                        })(),
                        fontWeight: 700,
                    },
                    data: [
                        {
                            value,
                            name: title,
                        },
                    ],
                },
            ],
        };
    }, [value, min, max, title, unit, goodRange, badRange]);

    return (
        <ReactECharts
            option={option}
            style={{ height: typeof height === "number" ? `${height}px` : height, width: "100%" }}
            opts={{ renderer: "svg" }}
        />
    );
}

