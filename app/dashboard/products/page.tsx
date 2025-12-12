// app/products/page.tsx
"use client";

import { Box, Button, Typography } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo, useState } from "react";
import { GridRowSelectionModel, GridRowId } from "@mui/x-data-grid";

import { useProducts } from "@/hooks/useProducts";
import ProductFilters from "@/components/products/ProductFilters";
import ProductTable from "@/components/products/ProductTable";
import AddProductModal from "@/components/products/AddProductModal";

export default function ProductsPage() {
    const {
        filteredProducts,
        categories,
        brands,
        searchText,
        categoryFilter,
        brandFilter,
        setSearchText,
        setCategoryFilter,
        setBrandFilter,
        fetchProducts,
        loading,
    } = useProducts();

    const [modalOpen, setModalOpen] = useState(false);

    // 🔹 v8-style selection model
    const [rowSelectionModel, setRowSelectionModel] =
        useState<GridRowSelectionModel>({
            type: "include",
            ids: new Set<GridRowId>(),
        });

    // 🔹 Convert selection Set → string[] for bulk delete
    const selectedIds = useMemo(
        () => Array.from(rowSelectionModel.ids) as string[],
        [rowSelectionModel]
    );

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;

        const ok = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} product(s)?`
        );
        if (!ok) return;

        try {
            const res = await fetch("/api/products/bulk-delete", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selectedIds }),
            });

            const data = await res.json();
            if (!res.ok) {
                alert(data?.message || "Failed to delete products");
                return;
            }

            await fetchProducts();
            // Clear selection
            setRowSelectionModel({
                type: "include",
                ids: new Set<GridRowId>(),
            });
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Failed to delete selected products. Please try again.");
        }
    };

    const toStringArray = (arr: (string | undefined)[]) =>
        arr.filter((v): v is string => typeof v === "string" && v !== "");

    return (
        <Box>
            <ProductFilters
                searchText={searchText}
                setSearchText={setSearchText}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                brandFilter={brandFilter}
                setBrandFilter={setBrandFilter}
                categories={toStringArray(categories)}
                brands={toStringArray(brands)}
                onAddClick={() => setModalOpen(true)}
            />

            {/* 🔹 Bulk selection/action bar */}
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
                        {selectedIds.length} product(s) selected
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
                <ProductTable
                    rows={filteredProducts}
                    loading={loading}
                    fetchProducts={fetchProducts}
                    rowSelectionModel={rowSelectionModel}
                    onSelectionChange={setRowSelectionModel}
                />
            </Box>

            <AddProductModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={fetchProducts}
            />
        </Box>
    );
}
