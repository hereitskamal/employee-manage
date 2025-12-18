// hooks/useSalesAnalysis.ts
import { useState, useEffect } from "react";

interface SalesAnalysisData {
    revenueTrends: Array<{ _id: string; revenue: number; count: number }>;
    topProducts: Array<{
        productId: string;
        productName: string;
        productBrand: string;
        productCategory: string;
        totalQuantity: number;
        totalRevenue: number;
    }>;
    salesByEmployee: Array<{
        employeeId: string;
        employeeName: string;
        employeeEmail: string;
        totalSales: number;
        saleCount: number;
    }>;
    salesByCategory: Array<{
        category: string;
        totalRevenue: number;
        totalQuantity: number;
    }>;
    stats: {
        totalRevenue: number;
        totalSales: number;
        averageSale: number;
    };
}

interface SalesStats {
    today: { revenue: number; count: number };
    week: { revenue: number; count: number };
    month: { revenue: number; count: number };
    overall: { revenue: number; count: number; average: number };
}

interface UseSalesAnalysisOptions {
    startDate?: string;
    endDate?: string;
    period?: "daily" | "weekly" | "monthly";
}

export function useSalesAnalysis(options: UseSalesAnalysisOptions = {}) {
    const [analysisData, setAnalysisData] = useState<SalesAnalysisData | null>(null);
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.startDate) params.append("startDate", options.startDate);
            if (options.endDate) params.append("endDate", options.endDate);
            if (options.period) params.append("period", options.period);

            const response = await fetch(`/api/sales/analysis?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch sales analysis");
            }

            const data: SalesAnalysisData = await response.json();
            setAnalysisData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (options.startDate) params.append("startDate", options.startDate);
            if (options.endDate) params.append("endDate", options.endDate);

            const response = await fetch(`/api/sales/stats?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch sales stats");
            }

            const data: SalesStats = await response.json();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    useEffect(() => {
        fetchAnalysis();
        fetchStats();
    }, [options.startDate, options.endDate, options.period]);

    return {
        analysisData,
        stats,
        loading,
        error,
        refetch: fetchAnalysis,
        refetchStats: fetchStats,
    };
}

