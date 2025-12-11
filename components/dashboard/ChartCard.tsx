import { Card, CardContent, Typography } from "@mui/material";

export default function ChartCard({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "none",
            }}
        >
            <CardContent>
                {children}
                <Typography
                    variant="body1"
                    fontWeight={400}
                    sx={{ color: "#3f3f3fff" }}
                >
                    {title}
                </Typography>

            </CardContent>
        </Card>
    );
}