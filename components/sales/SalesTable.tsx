// components/sales/SalesTable.tsx
"use client";

import { useState } from "react";
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridRowParams,
    GridRenderCellParams,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import { SaleRow } from "@/types/sale";
import { useSession } from "next-auth/react";
import { Box, Chip } from "@mui/material";

interface SalesTableProps {
    rows: SaleRow[];
    loading: boolean;
    fetchSales: () => void;
    rowSelectionModel: GridRowSelectionModel;
    onSelectionChange: (model: GridRowSelectionModel) => void;
}

export default function SalesTable({
    rows,
    loading,
    fetchSales,
    rowSelectionModel,
    onSelectionChange,
}: SalesTableProps) {
    const { data: session } = useSession();
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const isPrivileged =
        session?.user?.role === "admin" || session?.user?.role === "manager";

    const columns: GridColDef[] = [
        {
            field: "saleDate",
            headerName: "Date",
            minWidth: 120,
            flex: 0.8,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("SaleDate formatter - value:", value);
                
                if (!value) return "";
                
                try {
                    const date = new Date(value as string | Date);
                    if (isNaN(date.getTime())) return "";
                    return date.toLocaleDateString();
                } catch (error) {
                    console.error("SaleDate formatting error:", error, "value:", value);
                    return "";
                }
            },
        },
        {
            field: "products",
            headerName: "Products",
            minWidth: 200,
            flex: 1.5,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("Products formatter - value:", value);
                
                if (!Array.isArray(value)) return "";
                
                return value
                    .map((p: { 
                        productId?: { name?: string } | string; 
                        productName?: string;
                        quantity?: number 
                    }) => {
                        // Handle populated productId (object with name) or productName field
                        let name = "Unknown";
                        if (typeof p.productId === "object" && p.productId !== null) {
                            name = (p.productId as { name?: string }).name || "Unknown";
                        } else if (p.productName) {
                            name = p.productName;
                        }
                        const qty = p.quantity || 0;
                        return `${name} (x${qty})`;
                    })
                    .join(", ");
            },
        },
        {
            field: "totalAmount",
            headerName: "Total Amount",
            type: "number",
            minWidth: 130,
            flex: 1,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("TotalAmount formatter - value:", value);
                
                if (value == null) return "";
                const amount = typeof value === "number" ? value : Number(value);
                if (isNaN(amount)) return "";
                return `₹${amount.toLocaleString()}`;
            },
        },
        {
            field: "soldBy",
            headerName: "Sold By",
            minWidth: 150,
            flex: 1,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("SoldBy formatter - value:", value);
                
                if (typeof value === "object" && value !== null) {
                    const userObj = value as { name?: string; email?: string };
                    return userObj.name || userObj.email || "Unknown";
                }
                
                if (typeof value === "string") {
                    return value;
                }
                
                return "Unknown";
            },
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 0.8,
            renderCell: (params: GridRenderCellParams) => {
                if (!params) return <Chip label="N/A" size="small" />;
                const status = (params.value as string) || "N/A";
                const color =
                    status === "completed"
                        ? "success"
                        : status === "pending"
                        ? "warning"
                        : "error";
                return <Chip label={status} color={color} size="small" />;
            },
        },
    ];

    const processedRows = rows.map((row, index) => {
        // Ensure we have a valid id for DataGrid
        let id: string;
        if (row._id) {
            id = typeof row._id === 'string' ? row._id : String(row._id);
        } else if (row.id) {
            id = typeof row.id === 'string' ? row.id : String(row.id);
        } else {
            // Fallback to index if no id is available
            id = `row-${index}`;
        }
        
        return {
            ...row,
            id,
        };
    });

    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
                rows={processedRows}
                columns={columns}
                getRowId={(row) => row._id || row.id}
                loading={loading}
                checkboxSelection
                disableRowSelectionOnClick
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) => onSelectionChange(newModel)}
                slots={{ toolbar: GridToolbar }}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 25 },
                    },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
                onRowClick={(params: GridRowParams) => {
                    setSelectedId(params.id as string);
                }}
                sx={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: 3,
                    p: 2,
                    "& .MuiDataGrid-row:hover": {
                        cursor: "pointer",
                    },
                }}
            />
        </Box>
    );
}

