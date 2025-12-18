// components/products/ProductTable.tsx
"use client";

import { useState } from "react";
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridRowSelectionModel,
    GridRowParams,
} from "@mui/x-data-grid";
import { ProductRow } from "@/types/product";
import { useSession } from "next-auth/react";
import ProductDrawer from "./ProductDrawer";

interface ProductTableProps {
    rows: ProductRow[];
    loading: boolean;
    fetchProducts: () => void;
    // ✅ Multi-select props (v8 style)
    rowSelectionModel: GridRowSelectionModel;
    onSelectionChange: (model: GridRowSelectionModel) => void;
}

export default function ProductTable({
    rows,
    loading,
    rowSelectionModel,
    onSelectionChange,
    fetchProducts,
}: ProductTableProps) {
    const { data: session } = useSession();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const isPrivileged =
        session?.user?.role === "admin" || session?.user?.role === "manager";

    const baseColumns: GridColDef[] = [
        { field: "name", headerName: "Name", minWidth: 160, flex: 1 },
        { field: "brand", headerName: "Brand", minWidth: 120, flex: 1 },
        { field: "category", headerName: "Category", minWidth: 120, flex: 1 },
        { field: "modelNo", headerName: "Model No", minWidth: 140, flex: 1 },
        {
            field: "modelYear",
            headerName: "Year",
            type: "number",
            minWidth: 80,
            flex: 0.5,
        },
        {
            field: "minSaleRate",
            headerName: "Min Sale Rate",
            type: "number",
            minWidth: 120,
            flex: 0.8,
            valueFormatter: (p) =>
                p != null ? `₹${Number(p).toLocaleString()}` : "",
        },
        {
            field: "tagRate",
            headerName: "Tag Rate",
            type: "number",
            minWidth: 120,
            flex: 0.8,
            valueFormatter: (p) =>
                p != null ? `₹${Number(p).toLocaleString()}` : "",
        },
        {
            field: "starRating",
            headerName: "★ Rating",
            type: "number",
            minWidth: 100,
            flex: 0.6,
        },
        {
            field: "criticalSellScore",
            headerName: "Critical Score",
            type: "number",
            minWidth: 120,
            flex: 0.6,
        },
        {
            field: "stock",
            headerName: "Stock",
            type: "number",
            minWidth: 90,
            flex: 0.5,
        },
    ];

    const costColumns: GridColDef[] = [
        {
            field: "purchaseRate",
            headerName: "Purchase Rate",
            type: "number",
            minWidth: 130,
            flex: 0.8,
            valueFormatter: (p) =>
                p != null ? `₹${Number(p).toLocaleString()}` : "",
        },
        {
            field: "distributorRate",
            headerName: "Distributor Rate",
            type: "number",
            minWidth: 140,
            flex: 0.8,
            valueFormatter: (p) =>
                p != null ? `₹${Number(p).toLocaleString()}` : "",
        },
    ];

    const columns: GridColDef[] = isPrivileged
        ? [...baseColumns, ...costColumns]
        : baseColumns;

    const onRowClick = (params: GridRowParams<ProductRow & { _id?: string }>) => {
        setSelectedId(params.row._id ?? null);
        // Later you can open a ProductDrawer/Edit dialog here
    };

    return (
        <>
            <ProductDrawer
                id={selectedId}
                onClose={() => setSelectedId(null)}
                onDeleteSuccess={fetchProducts}
            />
            <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(row) => row._id}
                pagination
                pageSizeOptions={[8]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 8, page: 0 },
                    },
                }}
                loading={loading}
                onRowClick={onRowClick}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) =>
                    onSelectionChange(newModel)
                }
                slots={{ toolbar: GridToolbar }}
                sx={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: 3,
                    p: 2,
                }}
            />

            {/* TODO: ProductDrawer for editing, similar to EmployeeDrawer */}
            {/* <ProductDrawer id={selectedId} onClose={() => setSelectedId(null)} /> */}
        </>
    );
}
