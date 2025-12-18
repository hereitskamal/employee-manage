// components/attendance/DailyLogsView.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Card,
    CardContent,
    Grid,
} from "@mui/material";
import { useSession } from "next-auth/react";

interface DailyLogsData {
    date: string;
    records: Array<{
        _id: string;
        userId: { _id: string; name: string; email: string; role: string; department?: string };
        loginTime: string;
        logoutTime?: string | null;
        duration?: number;
        status: string;
    }>;
    statistics: {
        present: number;
        absent: number;
        partial: number;
        total: number;
    };
    absentUsers: Array<{
        _id: string;
        name: string;
        email: string;
        role: string;
        department?: string;
    }>;
}

export default function DailyLogsView() {
    const { data: session } = useSession();
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [data, setData] = useState<DailyLogsData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchDailyLogs = async () => {
        if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`/api/attendance/daily?date=${date}`);
            if (!response.ok) {
                throw new Error("Failed to fetch daily logs");
            }
            const logsData: DailyLogsData = await response.json();
            setData(logsData);
        } catch (error) {
            console.error("Failed to fetch daily logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyLogs();
    }, [date, session]);

    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
        return (
            <Box sx={{ p: 3 }}>
                <Typography>Access denied. Admin or Manager access required.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
                <TextField
                    label="Date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" onClick={fetchDailyLogs} disabled={loading}>
                    Refresh
                </Button>
            </Box>

            {data && (
                <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid item xs={12} sm={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Present
                                    </Typography>
                                    <Typography variant="h4">{data.statistics.present}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Absent
                                    </Typography>
                                    <Typography variant="h4">{data.statistics.absent}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Partial
                                    </Typography>
                                    <Typography variant="h4">{data.statistics.partial}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <Card>
                                <CardContent>
                                    <Typography color="text.secondary" gutterBottom>
                                        Total
                                    </Typography>
                                    <Typography variant="h4">{data.statistics.total}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Attendance Records
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Employee</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Login Time</TableCell>
                                    <TableCell>Logout Time</TableCell>
                                    <TableCell>Duration</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.records.map((record) => (
                                    <TableRow key={record._id}>
                                        <TableCell>
                                            {record.userId.name}
                                            <br />
                                            <Typography variant="caption" color="text.secondary">
                                                {record.userId.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{record.userId.department || "N/A"}</TableCell>
                                        <TableCell>
                                            {new Date(record.loginTime).toLocaleTimeString()}
                                        </TableCell>
                                        <TableCell>
                                            {record.logoutTime
                                                ? new Date(record.logoutTime).toLocaleTimeString()
                                                : "Not logged out"}
                                        </TableCell>
                                        <TableCell>
                                            {record.duration
                                                ? `${Math.floor(record.duration / 60)}h ${record.duration % 60}m`
                                                : "N/A"}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={record.status}
                                                color={
                                                    record.status === "present"
                                                        ? "success"
                                                        : record.status === "partial"
                                                        ? "warning"
                                                        : "error"
                                                }
                                                size="small"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {data.absentUsers.length > 0 && (
                        <>
                            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                                Absent Employees
                            </Typography>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Email</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Role</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {data.absentUsers.map((user) => (
                                            <TableRow key={user._id}>
                                                <TableCell>{user.name}</TableCell>
                                                <TableCell>{user.email}</TableCell>
                                                <TableCell>{user.department || "N/A"}</TableCell>
                                                <TableCell>{user.role}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </>
            )}

            {loading && <Typography>Loading...</Typography>}
        </Box>
    );
}

