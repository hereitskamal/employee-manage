// components/products/ProductFilters.tsx
"use client";

import { Add } from "@mui/icons-material";
import { Stack, TextField, MenuItem, Button } from "@mui/material";
import { useSession } from "next-auth/react";

interface ProductFiltersProps {
    searchText: string;
    setSearchText: (value: string) => void;
    categoryFilter: string;
    brandFilter?: string;
    setCategoryFilter: (value: string) => void;
    setBrandFilter?: (value: string) => void;
    brands?: string[];
    categories: string[];
    onAddClick?: () => void;
}

export default function ProductFilters({
    searchText,
    setSearchText,
    categoryFilter,
    setCategoryFilter,
    categories,
    onAddClick,
}: ProductFiltersProps) {
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
                label="Search products"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                size="small"
                fullWidth
                variant="outlined"
                sx={{
                    maxWidth: { xs: "100%", sm: 320 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            />

            <TextField
                select
                label="Category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                size="small"
                fullWidth
                sx={{
                    maxWidth: { xs: "100%", sm: 220 },
                    "& .MuiOutlinedInput-root": {
                        "& fieldset": { border: "2px solid #d0d0d0ff" },
                        "& input": { outline: "none" },
                    },
                }}
            >
                <MenuItem value="">All</MenuItem>
                {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                        {cat}
                    </MenuItem>
                ))}
            </TextField>

            {isPrivileged && (
                <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={onAddClick}
                    sx={{ whiteSpace: "nowrap", height: 40, borderRadius: 10 }}
                >
                    Add Product
                </Button>
            )}
        </Stack>
    );
}
