// components/attendance/AttendanceTable.tsx
"use client";

import {
    DataGrid,
    GridToolbar,
    GridColDef,
    GridRenderCellParams,
} from "@mui/x-data-grid";
import { AttendanceRow } from "@/types/attendance";
import { Box, Chip } from "@mui/material";

interface AttendanceTableProps {
    rows: AttendanceRow[];
    loading: boolean;
}

export default function AttendanceTable({
    rows,
    loading,
}: AttendanceTableProps) {
    const columns: GridColDef[] = [
        {
            field: "date",
            headerName: "Date",
            minWidth: 120,
            flex: 0.8,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("Date formatter - value:", value);
                
                if (!value) return "";
                
                try {
                    const date = new Date(value as string | Date);
                    if (isNaN(date.getTime())) return "";
                    return date.toLocaleDateString();
                } catch (error) {
                    console.error("Date formatting error:", error, "value:", value);
                    return "";
                }
            },
        },
        {
            field: "userId",
            headerName: "Employee",
            minWidth: 150,
            flex: 1,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("UserId formatter - value:", value);
                
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
            field: "loginTime",
            headerName: "Login Time",
            minWidth: 150,
            flex: 1,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("LoginTime formatter - value:", value);
                
                if (!value) return "N/A";
                
                try {
                    const date = new Date(value as string | Date);
                    if (isNaN(date.getTime())) return "N/A";
                    return date.toLocaleTimeString();
                } catch (error) {
                    console.error("LoginTime formatting error:", error, "value:", value);
                    return "N/A";
                }
            },
        },
        {
            field: "logoutTime",
            headerName: "Logout Time",
            minWidth: 150,
            flex: 1,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("LogoutTime formatter - value:", value);
                
                if (!value) return "Not logged out";
                
                try {
                    const date = new Date(value as string | Date);
                    if (isNaN(date.getTime())) return "Not logged out";
                    return date.toLocaleTimeString();
                } catch (error) {
                    console.error("LogoutTime formatting error:", error, "value:", value);
                    return "Not logged out";
                }
            },
        },
        {
            field: "duration",
            headerName: "Duration",
            minWidth: 120,
            flex: 0.8,
            valueFormatter: (value: unknown) => {
                // Debug logging
                console.log("Duration formatter - value:", value);
                
                if (value === null || value === undefined) return "N/A";
                
                const duration = typeof value === "number" ? value : Number(value);
                if (isNaN(duration) || duration < 0) return "N/A";
                
                const hours = Math.floor(duration / 60);
                const minutes = duration % 60;
                return `${hours}h ${minutes}m`;
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
                    status === "present"
                        ? "success"
                        : status === "partial"
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
    console.log(rows);
    console.log(processedRows);
    return (
        <Box sx={{ height: 600, width: "100%" }}>
            <DataGrid
                rows={processedRows}
                columns={columns}
                loading={loading}
                slots={{ toolbar: GridToolbar }}
                initialState={{
                    pagination: {
                        paginationModel: { pageSize: 25 },
                    },
                }}
                pageSizeOptions={[10, 25, 50, 100]}
            />
        </Box>
    );
}

