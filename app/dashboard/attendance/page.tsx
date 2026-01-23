// app/dashboard/attendance/page.tsx
"use client";

import { Box, Typography, Button } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useMemo, useState } from "react";
import { GridRowSelectionModel, GridRowId } from "@mui/x-data-grid";
import { useAttendance } from "@/hooks/useAttendance";
import AttendanceTable from "@/components/attendance/AttendanceTable";
import AttendanceFilters from "@/components/attendance/AttendanceFilters";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

export default function AttendancePage() {
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [employeeFilter, setEmployeeFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const { attendance, loading, error, refetch } = useAttendance({
        limit: 50,
        status: statusFilter || undefined,
        userId: employeeFilter || undefined,
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

    // Filter attendance based on search text
    const filteredAttendance = useMemo(() => {
        if (!searchText) return attendance;
        const search = searchText.toLowerCase();
        return attendance.filter((record) => {
            let userId = "";
            if (typeof record.userId === "object" && record.userId !== null) {
                // Check if it's a populated object with name/email
                if ("name" in record.userId || "email" in record.userId) {
                    userId = ((record.userId as { name?: string; email?: string }).name || 
                             (record.userId as { name?: string; email?: string }).email || 
                             "").toLowerCase();
                } else {
                    // It's an ObjectId
                    userId = String(record.userId).toLowerCase();
                }
            } else {
                userId = String(record.userId || "").toLowerCase();
            }
            
            return userId.includes(search);
        });
    }, [attendance, searchText]);

    const handleBulkDelete = async () => {
        if (!selectedIds.length) return;

        const ok = window.confirm(
            `Are you sure you want to delete ${selectedIds.length} attendance record(s)?`
        );
        if (!ok) return;

        try {
            // Delete each attendance record individually
            await Promise.all(
                selectedIds.map((id) =>
                    fetch(`/api/attendance/${id}`, { method: "DELETE" })
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
            alert("Failed to delete selected records. Please try again.");
        }
    };

    return (
        <Box>
            <AttendanceFilters
                searchText={searchText}
                setSearchText={setSearchText}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                employeeFilter={employeeFilter}
                setEmployeeFilter={setEmployeeFilter}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
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
                        {selectedIds.length} record(s) selected
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
                    <LoadingState message="Loading attendance records..." />
                ) : filteredAttendance.length === 0 ? (
                    <EmptyState
                        title="No attendance records found"
                        message={
                            searchText || statusFilter || employeeFilter || startDate || endDate
                                ? "No records match your current filters. Try adjusting your search criteria."
                                : "No attendance records available."
                        }
                    />
                ) : (
                    <AttendanceTable
                        rows={filteredAttendance}
                        loading={loading}
                        fetchAttendance={refetch}
                        rowSelectionModel={rowSelectionModel}
                        onSelectionChange={setRowSelectionModel}
                    />
                )}
            </Box>
        </Box>
    );
}

