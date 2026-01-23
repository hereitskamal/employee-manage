"use client";

import { Add } from "@mui/icons-material";
import { Stack, TextField, MenuItem, Button } from "@mui/material";
import { useSession } from "next-auth/react";

interface SalesFiltersProps {
    searchText: string;
    setSearchText: (value: string) => void;
    statusFilter: string;
    setStatusFilter: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    onAddClick?: () => void;
}

const STATUS_OPTIONS = ["", "completed", "pending", "cancelled"];

export default function SalesFilters({
    searchText,
    setSearchText,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    onAddClick,
}: SalesFiltersProps) {
    const { data: session } = useSession();
    const isPrivileged =
        session?.user?.role === "admin" || session?.user?.role === "manager";

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

            {isPrivileged && onAddClick && (
                <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={onAddClick}
                    sx={{ whiteSpace: "nowrap", height: 40, borderRadius: 10 }}
                >
                    New Sale
                </Button>
            )}
        </Stack>
    );
}

