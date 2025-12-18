// hooks/useSales.ts
import { useState, useEffect } from "react";
import { SaleRow } from "@/types/sale";

interface UseSalesOptions {
    startDate?: string;
    endDate?: string;
    employeeId?: string;
    productId?: string;
    status?: string;
    limit?: number;
    page?: number;
}

interface SalesResponse {
    sales: SaleRow[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function useSales(options: UseSalesOptions = {}) {
    const [sales, setSales] = useState<SaleRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<SalesResponse["pagination"] | null>(null);

    const fetchSales = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.startDate) params.append("startDate", options.startDate);
            if (options.endDate) params.append("endDate", options.endDate);
            if (options.employeeId) params.append("employeeId", options.employeeId);
            if (options.productId) params.append("productId", options.productId);
            if (options.status) params.append("status", options.status);
            if (options.limit) params.append("limit", options.limit.toString());
            if (options.page) params.append("page", options.page.toString());

            const response = await fetch(`/api/sales?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch sales");
            }

            const data: SalesResponse = await response.json();
            setSales(data.sales);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [
        options.startDate,
        options.endDate,
        options.employeeId,
        options.productId,
        options.status,
        options.limit,
        options.page,
    ]);

    const createSale = async (saleData: {
        products: Array<{ productId: string; quantity: number; price: number }>;
        soldBy: string;
        saleDate?: string;
        status?: string;
    }) => {
        try {
            const response = await fetch("/api/sales", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(saleData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create sale");
            }

            const data = await response.json();
            await fetchSales(); // Refresh list
            return data.sale;
        } catch (err) {
            throw err;
        }
    };

    const updateSale = async (id: string, updates: {
        products?: Array<{ productId: string; quantity: number; price: number }>;
        saleDate?: string;
        status?: string;
    }) => {
        try {
            const response = await fetch(`/api/sales/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update sale");
            }

            const data = await response.json();
            await fetchSales(); // Refresh list
            return data.sale;
        } catch (err) {
            throw err;
        }
    };

    const deleteSale = async (id: string) => {
        try {
            const response = await fetch(`/api/sales/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to delete sale");
            }

            await fetchSales(); // Refresh list
        } catch (err) {
            throw err;
        }
    };

    return {
        sales,
        loading,
        error,
        pagination,
        refetch: fetchSales,
        createSale,
        updateSale,
        deleteSale,
    };
}

