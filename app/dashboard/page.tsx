"use client";

import React, { useEffect, useState } from "react";
import { Box, Typography, Avatar, Container, IconButton, Tooltip } from "@mui/material";
import { useSession } from "next-auth/react";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";

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

    // mic listening state
    const [listening, setListening] = useState(false);

    // optional: auto-stop listening after N seconds (uncomment if desired)
    // useEffect(() => {
    //   if (!listening) return;
    //   const t = setTimeout(() => setListening(false), 15000); // stop after 15s
    //   return () => clearTimeout(t);
    // }, [listening]);

    const toggleListening = () => {
        setListening((s) => !s);

        // TODO: hook into real mic/voice logic here (Web Speech API or similar)
    };

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
                                background:
                                    "linear-gradient(90deg, #06cad4ff 0%, #3bd4f6ff 50%, #8b5cf6 100%)",
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                lineHeight: 1.2,
                            }}
                        >
                            How can I help you today?
                        </Typography>
                    </Box>

                    {/* Avatar with clickable mic */}
                    <Box
                        sx={{
                            position: "relative",
                            width: 80,
                            height: 80,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {/* listening ring (animated) */}
                        {listening && (
                            <Box
                                aria-hidden
                                sx={{
                                    position: "absolute",
                                    width: 110,
                                    height: 110,
                                    borderRadius: "50%",
                                    display: "block",
                                    // ring style
                                    boxShadow: "0 0 0 4px rgba(59,130,246,0.08), 0 0 30px rgba(59,130,246,0.18)",
                                    // create a subtle expanding pulse using keyframes
                                    "&::after": {
                                        content: '""',
                                        position: "absolute",
                                        inset: 0,
                                        borderRadius: "50%",
                                        animation: "pulse 1400ms ease-out infinite",
                                        // stroke ring
                                        boxShadow: "0 0 0 2px rgba(59,130,246,0.12) inset",
                                    },
                                    // keyframes defined here
                                    "@keyframes pulse": {
                                        "0%": { transform: "scale(0.85)", opacity: 0.9 },
                                        "50%": { transform: "scale(1.05)", opacity: 0.55 },
                                        "100%": { transform: "scale(1.35)", opacity: 0 },
                                    },
                                }}
                            />
                        )}

                        {/* Avatar inside an IconButton so it's clickable and accessible */}
                        <IconButton
                            onClick={toggleListening}
                            aria-pressed={listening}
                            aria-label={listening ? "Stop voice input" : "Start voice input"}
                            sx={{
                                p: 0,
                                borderRadius: "50%",
                                // keep relative so the ring sits behind
                                position: "relative",
                                zIndex: 2,
                            }}
                        >
                            <Avatar
                                sx={{
                                    position: "relative",
                                    width: 80,
                                    height: 80,
                                    background:
                                        listening
                                            ? "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)"
                                            : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                                    fontSize: "1.5rem",
                                    fontWeight: 600,
                                    boxShadow: listening
                                        ? "0 10px 30px rgba(59,130,246,0.25)"
                                        : "0 8px 16px rgba(139, 92, 246, 0.3)",
                                }}
                            >
                                {listening ? (
                                    <MicIcon sx={{ fontSize: 32, color: "#ffffff" }} />
                                ) : (
                                    <MicOffIcon sx={{ fontSize: 32, color: "#fbbf24" }} />
                                )}
                            </Avatar>
                        </IconButton>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}
