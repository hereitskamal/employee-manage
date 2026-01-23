// components/ui/ErrorState.tsx
"use client";

import { Box, Typography, Button, Alert } from "@mui/material";
import { ErrorOutline } from "@mui/icons-material";

interface ErrorStateProps {
    title?: string;
    message?: string;
    error?: Error | null;
    onRetry?: () => void;
    retryLabel?: string;
}

/**
 * Reusable error state component
 * Displays when an error occurs during data fetching
 */
export default function ErrorState({
    title = "Something went wrong",
    message,
    error,
    onRetry,
    retryLabel = "Try again",
}: ErrorStateProps) {
    const displayMessage = message || error?.message || "An unexpected error occurred. Please try again.";

    return (
        <Box
            className="flex flex-col items-center justify-center py-12 px-4"
            sx={{
                minHeight: 200,
            }}
        >
            <ErrorOutline
                sx={{
                    fontSize: 64,
                    color: "error.main",
                    mb: 2,
                }}
            />
            <Typography variant="h6" color="error" gutterBottom>
                {title}
            </Typography>
            <Alert
                severity="error"
                sx={{
                    mt: 1,
                    mb: 2,
                    maxWidth: 500,
                    width: "100%",
                }}
            >
                {displayMessage}
            </Alert>
            {onRetry && (
                <Button
                    variant="contained"
                    onClick={onRetry}
                    sx={{ mt: 1 }}
                >
                    {retryLabel}
                </Button>
            )}
        </Box>
    );
}




