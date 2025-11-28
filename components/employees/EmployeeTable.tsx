"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DataGrid,
    GridToolbar,
    GridColDef,
} from "@mui/x-data-grid";
import EmployeeDrawer from "../EmployeeDrawer";
import { EmployeeRow } from "@/types/employee";



interface EmployeeTableProps {
    rows: EmployeeRow[];
    fetchEmployees: () => void;
}

export default function EmployeeTable({ rows, fetchEmployees }: EmployeeTableProps) {
     const [selectedId, setSelectedId] = useState<number | null>(null);

    const columns: GridColDef[] = [
        { field: "name", headerName: "Name", minWidth: 150, flex: 1 },
        { field: "department", headerName: "Department", minWidth: 150, flex: 1 },
        { field: "title", headerName: "Job Title", minWidth: 150, flex: 1 },
        { field: "email", headerName: "Email", minWidth: 220, flex: 1 },
        { field: "phone", headerName: "Phone", minWidth: 130, flex: 1 },
        { field: "location", headerName: "Location", minWidth: 120, flex: 1 },
        { field: "salary", headerName: "Salary", type: "number", minWidth: 100, flex: 1 },
        { field: "age", headerName: "Age", type: "number", minWidth: 80, flex: 1 },
        { field: "hireDate", headerName: "Hire Date", minWidth: 120, flex: 1 },
        { field: "performance", headerName: "Performance", type: "number", minWidth: 100, flex: 1 },
    ];

    const onRowClick = (params: any) => {
        setSelectedId(params.row.id);
    };

    const handleDrawerClose = () => {
        setSelectedId(null);
    };

    return (
        <>
            <DataGrid
                rows={rows}
                columns={columns}
                pagination
                pageSizeOptions={[8]}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 8, page: 0 },
                    },
                }}
                onRowClick={onRowClick}
                slots={{ toolbar: GridToolbar }}
                sx={{
                    height: "calc(100vh - 205px)",
                    border: 0,
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: "#eff2f7",
                        fontWeight: "bold",
                    },
                    "& .MuiDataGrid-row:not(.Mui-selected):not(.MuiDataGrid-row--editing):hover": {
                        backgroundColor: "#f5f5f5",
                        cursor: "pointer",
                    },
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
