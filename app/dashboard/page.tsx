"use client";

import React from "react";
import { Box, Typography, Avatar, Container } from "@mui/material";
import { useSession } from "next-auth/react";
import StarIcon from "@mui/icons-material/Star";

export default function EmployeeDashboard() {
    const { data: session } = useSession();

    const userName = session?.user?.name || "Employee";
    const firstName = userName.split(" ")[0];

    // Get current date
    const currentDate = new Date();
    const dateString = currentDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "long",
        day: "numeric",
    });

    return (
        <Box
            sx={{
                minHeight: "100vh",
                bgcolor: "white",
                pt: 4,
                borderRadius: 2,
            }}
        >
            <Container maxWidth="xl">
                {/* Date */}
                <Typography
                    variant="body2"
                    sx={{
                        color: "text.secondary",
                        fontSize: "0.9375rem",
                        mb: 2,
                        fontWeight: 400,
                    }}
                >
                    {dateString}
                </Typography>

                {/* Greeting Section */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 4,
                    }}
                >
                    <Box>
                        <Typography
                            variant="h3"
                            sx={{
                                fontWeight: 700,
                                fontSize: "3rem",
                                color: "text.primary",
                                mb: 0.5,
                                lineHeight: 1.2,
                            }}
                        >
                            Hello, {firstName}
                        </Typography>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 400,
                                fontSize: "2.5rem",
                                background: "linear-gradient(90deg, #06cad4ff 0%, #3bd4f6ff 50%, #8b5cf6 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                lineHeight: 1.2,
                            }}
                        >
                            How can I help you today?
                        </Typography>
                    </Box>

                    {/* Avatar with gradient background */}
                    <Box
                        sx={{
                            position: "relative",
                            width: 80,
                            height: 80,
                        }}
                    >
                        {/* Gradient blur background */}
                        <Box
                            sx={{
                                position: "absolute",
                                inset: 0,
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)",
                                filter: "blur(20px)",
                                opacity: 0.6,
                            }}
                        />

                        {/* Avatar */}
                        <Avatar
                            sx={{
                                position: "relative",
                                width: 80,
                                height: 80,
                                background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                                fontSize: "1.5rem",
                                fontWeight: 600,
                                boxShadow: "0 8px 16px rgba(139, 92, 246, 0.3)",
                            }}
                        >
                            <StarIcon sx={{ fontSize: 32, color: "#fbbf24" }} />
                        </Avatar>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}