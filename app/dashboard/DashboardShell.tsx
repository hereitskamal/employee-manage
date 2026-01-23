"use client";

import { Box } from "@mui/material";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", height: "100vh", bgcolor: "#f9f9f9" }}>
      <Sidebar />
      <Box sx={{ height: "100vh", flex: 1, width: "calc(100vw - 300px)" }}>
        {/* <Header /> */}
        <Box sx={{ p: 2, height: "100%", overflowY: "auto" }}>{children}</Box>
      </Box>
    </Box>
  );
}
