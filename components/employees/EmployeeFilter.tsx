"use client";

import { Add } from "@mui/icons-material";
import { Stack, TextField, MenuItem, Button } from "@mui/material";

interface EmployeeFiltersProps {
    searchText: string;
    setSearchText: (value: string) => void;
    departmentFilter: string;
    setDepartmentFilter: (value: string) => void;
    onAddClick?: () => void;
    departments: string[];
}

export default function EmployeeFilters({
    searchText,
    setSearchText,
    departmentFilter,
    setDepartmentFilter,
    onAddClick,
    departments,
}: EmployeeFiltersProps) {
    return (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
            sx={{ width: "100%", mb: 2 }}
        >
            <TextField
                label="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                fullWidth
                sx={{ maxWidth: { xs: "100%", sm: 300 } }}
            />

            <TextField
                select
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                size="small"
                fullWidth
                sx={{ maxWidth: { xs: "100%", sm: 200 } }}
            >
                <MenuItem value="">All</MenuItem>
                {departments.map((dep) => (
                    <MenuItem key={dep} value={dep}>
                        {dep}
                    </MenuItem>
                ))}
            </TextField>

            <Button
                startIcon={<Add />}
                variant="contained"
                onClick={onAddClick}
                sx={{ whiteSpace: "nowrap", height: 40 }}
            >
                Add Employee
            </Button>
        </Stack>
    );
}
