// app/dashboard/sales/page.tsx
"use client";

import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useSales } from "@/hooks/useSales";
import SalesTable from "@/components/sales/SalesTable";
import AddSaleModal from "@/components/sales/AddSaleModal";

export default function SalesPage() {
    const [openModal, setOpenModal] = useState(false);
    const { sales, loading, refetch } = useSales({ limit: 50 });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Typography variant="h4" fontWeight={600}>
                    Sales
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenModal(true)}
                >
                    New Sale
                </Button>
            </Box>

            <SalesTable rows={sales} loading={loading} fetchSales={refetch} />

            <AddSaleModal open={openModal} onClose={() => setOpenModal(false)} />
        </Box>
    );
}

