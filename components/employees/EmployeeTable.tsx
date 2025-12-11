"use client";

import { useState } from "react";
import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridRowSelectionModel,
} from "@mui/x-data-grid";
import { EmployeeRow } from "@/types/employee";
import EmployeeDrawer from "@/components/employees/EmployeeDrawer";

interface EmployeeTableProps {
    rows: EmployeeRow[];
    fetchEmployees: () => void;
    loading: boolean;

    // ✅ v8-style selection model
    rowSelectionModel: GridRowSelectionModel;
    onSelectionChange: (model: GridRowSelectionModel) => void;
}

export default function EmployeeTable({
    rows,
    fetchEmployees,
    loading,
    rowSelectionModel,
    onSelectionChange,
}: EmployeeTableProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const columns: GridColDef[] = [
        { field: "name", headerName: "Name", minWidth: 150, flex: 1 },
        { field: "department", headerName: "Department", minWidth: 120, flex: 1 },
        { field: "title", headerName: "Job Title", minWidth: 150, flex: 1 },
        { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
        { field: "phone", headerName: "Phone", minWidth: 120, flex: 1 },
        { field: "location", headerName: "Location", minWidth: 120, flex: 1 },
        {
            field: "salary",
            headerName: "Salary",
            type: "number",
            minWidth: 100,
            flex: 1,
        },
        {
            field: "age",
            headerName: "Age",
            type: "number",
            minWidth: 80,
            flex: 1,
        },
        {
            field: "hireDate",
            headerName: "Hire Date",
            minWidth: 140,
            flex: 1,
            valueFormatter: (params) => {
                const date = new Date(params);
                return date.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });
            },
        },
        {
            field: "performance",
            headerName: "Performance",
            type: "number",
            minWidth: 120,
            flex: 1,
        },
    ];

    const handleRowDoubleClick = (params: any) => {
        setSelectedId(params.row._id?.toString() ?? null);
    };

    return (
        <>
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
                checkboxSelection
                disableRowSelectionOnClick
                disableRowSelectionExcludeModel
                rowSelectionModel={rowSelectionModel}
                onRowSelectionModelChange={(newModel) => onSelectionChange(newModel)}
                onRowDoubleClick={handleRowDoubleClick}
                slots={{ toolbar: GridToolbar }}
                sx={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: 3,
                    p: 2,
                }}
            />

            <EmployeeDrawer
                id={selectedId}
                onClose={() => setSelectedId(null)}
                onDeleteSuccess={fetchEmployees}
            />
        </>
    );
}
