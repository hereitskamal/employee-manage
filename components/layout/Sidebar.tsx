// components/layout/Sidebar.tsx
"use client";

import {
    Box,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Typography,
    Divider,
    Avatar,
    Stack,
    IconButton,
    Tooltip,
    Skeleton,
} from "@mui/material";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LogoutIcon from "@mui/icons-material/Logout";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

// Helper function to get role-specific dashboard path
const getDashboardPath = (role: string | undefined): string => {
    switch (role) {
        case "admin":
            return "/dashboard/admin";
        case "manager":
            return "/dashboard/manager";
        case "employee":
        case "helper":
            return "/dashboard/employee";
        case "spc":
            return "/dashboard/spc";
        default:
            return "/dashboard";
    }
};

const navItems = [
    {
        label: "Dashboard",
        path: "/dashboard", // This will be replaced dynamically
        icon: <DashboardOutlinedIcon fontSize="small" />,
        roles: ["admin", "manager", "employee", "spc"],
        isDynamic: true, // Flag to indicate this path should be role-specific
    },
    {
        label: "Employees",
        path: "/dashboard/employees",
        icon: <PeopleAltOutlinedIcon fontSize="small" />,
        roles: ["admin", "manager"],
    },
    {
        label: "Products",
        path: "/dashboard/products",
        icon: <Inventory2OutlinedIcon fontSize="small" />,
        roles: ["admin", "manager", "employee", "spc"],
    },
    {
        label: "Sales",
        path: "/dashboard/sales",
        icon: <PointOfSaleIcon fontSize="small" />,
        roles: ["admin", "manager", "employee"],
    },
    {
        label: "Sales Analysis",
        path: "/dashboard/sales/analysis",
        icon: <AnalyticsIcon fontSize="small" />,
        roles: ["admin", "manager"],
    },
    {
        label: "Attendance",
        path: "/dashboard/attendance",
        icon: <AccessTimeIcon fontSize="small" />,
        roles: ["admin", "manager", "employee", "spc"],
    },
    {
        label: "Daily Logs",
        path: "/dashboard/attendance/daily-logs",
        icon: <ListAltIcon fontSize="small" />,
        roles: ["admin"],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleLogout = async () => {
        // Track logout time
        if (session?.user?.id) {
            try {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const todayEnd = new Date(today);
                todayEnd.setHours(23, 59, 59, 999);

                const response = await fetch("/api/attendance", {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (response.ok) {
                    const data = await response.json();
                    const todayRecord = data.attendance?.find((record: { date: string; logoutTime: string | null }) => {
                        const recordDate = new Date(record.date);
                        return recordDate >= today && recordDate <= todayEnd && !record.logoutTime;
                    });

                    if (todayRecord) {
                        await fetch(`/api/attendance/${todayRecord._id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                logoutTime: new Date().toISOString(),
                            }),
                        });
                    }
                }
            } catch (error) {
                // Don't block logout if attendance tracking fails
                console.error("Failed to track logout attendance:", error);
            }
        }

        await signOut({ callbackUrl: "/login" });
    };

    const role = session?.user?.role as
        | "admin"
        | "manager"
        | "employee"
        | "spc"
        | undefined;

    // 🔹 Role-based navigation (NO FLICKER)
    let visibleNavItems: typeof navItems = [];

    if (status === "loading") {
        visibleNavItems = [];
    } else if (role) {
        visibleNavItems = navItems.filter((item) => {
            const itemRoles = (item as typeof navItems[0] & { roles?: string[] }).roles || [];
            return itemRoles.includes(role);
        });
    } else {
        visibleNavItems = []; // unauthenticated
    }

    const userName = session?.user?.name || "Employee";
    const userEmail = session?.user?.email || "";
    const userInitial = userName.charAt(0).toUpperCase();

    const activePath = visibleNavItems.reduce((best, item) => {
        const itemPath = (item as typeof navItems[0] & { isDynamic?: boolean }).isDynamic
            ? getDashboardPath(role)
            : item.path;
        const isMatch =
            pathname === itemPath || pathname.startsWith(itemPath + "/");
        if (isMatch && itemPath.length > best.length) return itemPath;
        return best;
    }, "");

    return (
        <Box
            sx={{
                width: 260,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                py: 2,
                px: 2,
                backgroundColor: "#fff",
            }}
        >
            {/* Top */}
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3, ml: 1 }}>
                    <DashboardOutlinedIcon fontSize="small" sx={{ color: "primary.main" }} />
                    <Typography
                        variant="h6"
                        fontWeight={400}
                        sx={{ color: "primary.text" }}
                    >
                        DASHBOARD
                    </Typography>
                </Stack>

                {status === "loading" ? (
                    <>
                        {/* <Skeleton height={60} />
                        <Skeleton height={60} />
                        <Skeleton height={60} /> */}
                    </>
                ) : (
                    <List disablePadding>
                        {visibleNavItems.map((item) => {
                            // Use role-specific path for Dashboard, otherwise use item path
                            const itemPath = (item as typeof navItems[0] & { isDynamic?: boolean }).isDynamic
                                ? getDashboardPath(role)
                                : item.path;
                            const selected = itemPath === activePath || pathname.startsWith(itemPath + "/");
                            return (
                                <ListItemButton
                                    key={item.path}
                                    selected={selected}
                                    onClick={() => router.push(itemPath)}
                                    sx={{
                                        mb: 0.5,
                                        borderRadius: 2,
                                        px: 1,
                                        py: 0.5,
                                        gap: 1,
                                        "&.Mui-selected": {
                                            bgcolor: "secondary.main",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 0,
                                            mr: 1,
                                            color: selected
                                                ? "primary.main"
                                                : "text.secondary",
                                        }}
                                    >
                                        {item.icon}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: 14,
                                            fontWeight: selected ? 600 : 500,
                                            color: selected
                                                ? "primary.main"
                                                : "black",
                                        }}
                                    />
                                </ListItemButton>
                            );
                        })}
                    </List>
                )}
            </Box>

            {/* Bottom: User + Logout */}
            <Box>
                <Divider sx={{ mb: 1.5 }} />

                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: "primary.main",
                            fontSize: 14,
                        }}
                    >
                        {userInitial}
                    </Avatar>

                    <Box sx={{ flex: 1, overflow: "hidden" }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                            {userName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                            {userEmail}
                        </Typography>
                    </Box>

                    <Tooltip title="Logout">
                        <IconButton
                            onClick={handleLogout}
                            size="small"
                            color="error"
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                            }}
                        >
                            <LogoutIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>
        </Box>
    );
}
