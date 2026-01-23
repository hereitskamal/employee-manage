// app/dashboard/sales/page.tsx
"use client";

import { useState, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { GridRowSelectionModel, GridRowId } from "@mui/x-data-grid";
import { useSales } from "@/hooks/useSales";
import SalesTable from "@/components/sales/SalesTable";
import SalesFilters from "@/components/sales/SalesFilters";
import AddSaleModal from "@/components/sales/AddSaleModal";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

export default function SalesPage() {
    const [modalOpen, setModalOpen] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { sales, loading, error, refetch } = useSales({
        limit: 50,
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
    });

    // MUI v8 selection model structure
    const [rowSelectionModel, setRowSelectionModel] =
        useState<GridRowSelectionModel>({
            type: "include",
            ids: new Set<GridRowId>(),
        });

    // Convert selected Set → array for API calls
    const selectedIds = useMemo(
        () => Array.from(rowSelectionModel.ids) as string[],
        [rowSelectionModel]
    );

    // Filter sales based on search text
    const filteredSales = useMemo(() => {
        if (!searchText) return sales;
        const search = searchText.toLowerCase();
        return sales.filter((sale) => {
            const products = sale.products || [];
            const productNames = products
                .map((p: any) => {
                    if (typeof p.productId === "object" && p.productId?.name) {
                        return p.productId.name;
                    }
                    return p.productName || "";
                })
                .join(" ")
                .toLowerCase();
            
            const soldBy = typeof sale.soldBy === "object" 
                ? (sale.soldBy?.name || sale.soldBy?.email || "").toLowerCase()
                : String(sale.soldBy || "").toLowerCase();

            return productNames.includes(search) || soldBy.includes(search);
        });
    }, [sales, searchText]);

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;

        const ok = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} sale(s)?`
        );
        if (!ok) return;

        try {
            // Delete each sale individually
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/sales/${id}`, { method: "DELETE" })
                )
            );

            await refetch();
            // Clear selection
            setRowSelectionModel({
                type: "include",
                ids: new Set<GridRowId>(),
            });
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Failed to delete selected sales. Please try again.");
        }
    };

    return (
        <Box>
            <SalesFilters
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                onAddClick={() => setModalOpen(true)}
            />

            {/* Bulk selection/action bar */}
            {selectedIds.length > 0 && (
                <Box
                    sx={{
                        mb: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 0.5,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        {selectedIds.length} sale(s) selected
                    </Typography>
                    <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleBulkDelete}
                    >
                        Delete Selected
                    </Button>
                </Box>
            )}

            <Box sx={{ width: "100%" }}>
                {error ? (
                    <ErrorState
                        message={error}
                        onRetry={refetch}
                    />
                ) : loading ? (
                    <LoadingState message="Loading sales..." />
                ) : filteredSales.length === 0 ? (
                    <EmptyState
                        title="No sales found"
                        message={
                            searchText || statusFilter || startDate || endDate
                                ? "No sales match your current filters. Try adjusting your search criteria."
                                : "Get started by creating your first sale."
                        }
                        actionLabel="New Sale"
                        onAction={() => setModalOpen(true)}
                    />
                ) : (
                    <SalesTable
                        rows={filteredSales}
                        loading={loading}
                        fetchSales={refetch}
                        rowSelectionModel={rowSelectionModel}
                        onSelectionChange={setRowSelectionModel}
                    />
                )}
            </Box>

            <AddSaleModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={refetch}
            />
        </Box>
    );
}

