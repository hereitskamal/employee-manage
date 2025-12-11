"use client";

import { Box, Button, Typography, Stack } from "@mui/material";

export default function Header() {

    return (
        <Box
            sx={{
                height: 64,
                // backgroundColor: "#fff",
                // borderBottom: "1px solid #e5e7eb",
                px: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}
        >
            <Typography variant="h5" fontWeight={400}>Dashboard</Typography>


        </Box>
    );
}
