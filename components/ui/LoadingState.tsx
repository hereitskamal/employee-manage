// components/ui/LoadingState.tsx
"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

interface LoadingStateProps {
    message?: string;
    size?: number;
}

/**
 * Reusable loading state component
 * Displays a centered spinner with optional message
 */
export default function LoadingState({ 
    message = "Loading...", 
    size = 40 
}: LoadingStateProps) {
    return (
        <Box
            className="flex flex-col items-center justify-center py-12"
            sx={{
                minHeight: 200,
            }}
        >
            <CircularProgress size={size} />
            {message && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 2 }}
                >
                    {message}
                </Typography>
            )}
        </Box>
    );
}




