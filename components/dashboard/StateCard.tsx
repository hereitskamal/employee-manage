import { Box, Card, CardContent, Typography } from "@mui/material";

export default function StatCard({
    icon,
    label,
    value,
    subtitle,
    color,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtitle?: string;
    color: string;
}) {
    return (
        <Card
            sx={{
                height: "100%",
                background: "white",
                borderRadius: 3,
                boxShadow: "none",
                transition: "transform 0.2s, box-shadow 0.2s",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                },
            }}
        >
            <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            bgcolor: `${color}15`,
                            color: color,
                            mr: 2,
                        }}
                    >
                        {icon}
                    </Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {label}
                    </Typography>
                </Box>
                <Typography variant="h5" fontWeight={400} sx={{ mb: 0.5 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="caption" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
}