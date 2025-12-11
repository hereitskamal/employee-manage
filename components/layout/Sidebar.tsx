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
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const navItems = [
    {
        label: "Dashboard",
        path: "/dashboard",
        icon: <DashboardOutlinedIcon fontSize="small" />,
    },
    {
        label: "Employees",
        path: "/dashboard/employees",
        icon: <PeopleAltOutlinedIcon fontSize="small" />,
    },
    {
        label: "Products",
        path: "/dashboard/products",
        icon: <Inventory2OutlinedIcon fontSize="small" />,
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const handleLogout = async () => {
        await signOut({ callbackUrl: "/login" });
    };

    const role = session?.user?.role as
        | "admin"
        | "manager"
        | "employee"
        | "spc"
        | undefined;

    // 🔹 Role-based navigation (NO FLICKER)
    let visibleNavItems: any[] = [];

    if (status === "loading") {
        visibleNavItems = [];
    } else if (role === "employee" || role === "spc") {
        visibleNavItems = navItems.filter(
            (item) => item.path === "/dashboard/products"
        );
    } else if (role === "admin" || role === "manager") {
        visibleNavItems = navItems;
    } else {
        visibleNavItems = []; // unauthenticated
    }

    const userName = session?.user?.name || "Employee";
    const userEmail = session?.user?.email || "";
    const userInitial = userName.charAt(0).toUpperCase();

    const activePath = visibleNavItems.reduce((best, item) => {
        const isMatch =
            pathname === item.path || pathname.startsWith(item.path + "/");
        if (isMatch && item.path.length > best.length) return item.path;
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
                            const selected = item.path === activePath;
                            return (
                                <ListItemButton
                                    key={item.path}
                                    selected={selected}
                                    onClick={() => router.push(item.path)}
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
