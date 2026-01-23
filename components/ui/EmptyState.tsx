// components/ui/EmptyState.tsx
"use client";

import { Box, Typography, Button } from "@mui/material";
import { InboxOutlined } from "@mui/icons-material";

interface EmptyStateProps {
    title?: string;
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}

/**
 * Reusable empty state component
 * Displays when there's no data to show
 */
export default function EmptyState({
    title = "No data found",
    message = "There are no items to display.",
    actionLabel,
    onAction,
}: EmptyStateProps) {
    return (
        <Box
            className="flex flex-col items-center justify-center py-12 px-4"
            sx={{
                minHeight: 200,
            }}
        >
            <InboxOutlined
                sx={{
                    fontSize: 64,
                    color: "text.disabled",
                    mb: 2,
                }}
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
                {title}
            </Typography>
            {message && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, textAlign: "center", maxWidth: 400 }}
                >
                    {message}
                </Typography>
            )}
            {actionLabel && onAction && (
                <Button
                    variant="outlined"
                    onClick={onAction}
                    sx={{ mt: 1 }}
                >
                    {actionLabel}
                </Button>
            )}
        </Box>
    );
}




