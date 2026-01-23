"use client";

import { Stack, TextField, MenuItem } from "@mui/material";
import { useSession } from "next-auth/react";
import { useEmployees } from "@/hooks/useEmployees";

interface AttendanceFiltersProps {
    searchText: string;
    setSearchText: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    employeeFilter: string;
    setEmployeeFilter: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
}

const STATUS_OPTIONS = ["", "present", "absent", "partial"];

export default function AttendanceFilters({
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    employeeFilter,
    setEmployeeFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
}: AttendanceFiltersProps) {
    const { data: session } = useSession();
    const isPrivileged =
        session?.user?.role === "admin" || session?.user?.role === "manager";
    
    const { filteredEmployees } = useEmployees();

    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            sx={{
                justifyContent: "flex-end",
                border: "none",
                borderRadius: 3,
                mb: 2,
            }}
        >
            <TextField
                label="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                    maxWidth: { xs: "100%", sm: 300 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            />

            {isPrivileged && (
                <TextField
                    select
                    label="Employee"
                    value={employeeFilter}
                    onChange={(e) => setEmployeeFilter(e.target.value)}
                    size="small"
                    fullWidth
                    sx={{
                        maxWidth: { xs: "100%", sm: 200 },
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { border: "2px solid #d0d0d0ff" },
                            "& input": { outline: "none" },
                        },
                    }}
                >
                    <MenuItem value="">All</MenuItem>
                    {filteredEmployees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                            {emp.name}
                        </MenuItem>
                    ))}
                </TextField>
            )}

            <TextField
                select
                label="Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                size="small"
                fullWidth
                sx={{
                    maxWidth: { xs: "100%", sm: 150 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            >
                <MenuItem value="">All</MenuItem>
                {STATUS_OPTIONS.filter(s => s).map((status) => (
                    <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </MenuItem>
                ))}
            </TextField>

            <TextField
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                    maxWidth: { xs: "100%", sm: 180 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            />

            <TextField
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                size="small"
                InputLabelProps={{ shrink: true }}
                fullWidth
                sx={{
                    maxWidth: { xs: "100%", sm: 180 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            />
        </Stack>
    );
}

