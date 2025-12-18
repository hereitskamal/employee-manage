// hooks/useAttendance.ts
import { useState, useEffect } from "react";
import { AttendanceRow } from "@/types/attendance";

interface UseAttendanceOptions {
    startDate?: string;
    endDate?: string;
    userId?: string;
    status?: string;
    limit?: number;
    page?: number;
}

interface AttendanceResponse {
    attendance: AttendanceRow[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export function useAttendance(options: UseAttendanceOptions = {}) {
    const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<AttendanceResponse["pagination"] | null>(null);
    const [todayAttendance, setTodayAttendance] = useState<AttendanceRow | null>(null);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams();
            if (options.startDate) params.append("startDate", options.startDate);
            if (options.endDate) params.append("endDate", options.endDate);
            if (options.userId) params.append("userId", options.userId);
            if (options.status) params.append("status", options.status);
            if (options.limit) params.append("limit", options.limit.toString());
            if (options.page) params.append("page", options.page.toString());

            const response = await fetch(`/api/attendance?${params.toString()}`);
            if (!response.ok) {
                throw new Error("Failed to fetch attendance");
            }

            const data: AttendanceResponse = await response.json();
            setAttendance(data.attendance);
            setPagination(data.pagination);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendance();
    }, [
        options.startDate,
        options.endDate,
        options.userId,
        options.status,
        options.limit,
        options.page,
    ]);

    const createAttendance = async (attendanceData: {
        userId?: string;
        loginTime?: string;
        date?: string;
        notes?: string;
    }) => {
        try {
            const response = await fetch("/api/attendance", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(attendanceData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to create attendance");
            }

            const data = await response.json();
            await fetchAttendance(); // Refresh list
            return data.attendance;
        } catch (err) {
            throw err;
        }
    };

    const updateAttendance = async (id: string, updates: {
        logoutTime?: string | null;
        status?: string;
        notes?: string;
    }) => {
        try {
            const response = await fetch(`/api/attendance/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to update attendance");
            }

            const data = await response.json();
            await fetchAttendance(); // Refresh list
            return data.attendance;
        } catch (err) {
            throw err;
        }
    };

    const clockIn = async () => {
        try {
            const response = await fetch("/api/attendance/clock-in", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to clock in");
            }

            const data = await response.json();
            // Update todayAttendance immediately from the response
            if (data.attendance) {
                setTodayAttendance(data.attendance);
            }
            await fetchAttendance(); // Refresh list
            await getTodayAttendance(); // Refresh today's attendance to ensure consistency
            return data;
        } catch (err) {
            throw err;
        }
    };

    const clockOut = async () => {
        try {
            const response = await fetch("/api/attendance/clock-out", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to clock out");
            }

            const data = await response.json();
            // Update todayAttendance immediately from the response
            if (data.attendance) {
                setTodayAttendance(data.attendance);
            }
            await fetchAttendance(); // Refresh list
            await getTodayAttendance(); // Refresh today's attendance to ensure consistency
            return data;
        } catch (err) {
            throw err;
        }
    };

    const getTodayAttendance = async () => {
        try {
            // Get today's date range in local timezone
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todayEnd = new Date(today);
            todayEnd.setHours(23, 59, 59, 999);
            
            // Format dates as YYYY-MM-DD for API query
            const todayStr = today.toISOString().split('T')[0];
            const todayEndStr = todayEnd.toISOString().split('T')[0];

            const response = await fetch(`/api/attendance?startDate=${todayStr}&endDate=${todayEndStr}&limit=10`);
            if (!response.ok) {
                throw new Error("Failed to fetch today's attendance");
            }

            const data: AttendanceResponse = await response.json();
            
            // Find today's record by checking if loginTime is within today's range
            // This is more reliable than checking the date field due to timezone issues
            const todayRecord = data.attendance.find(record => {
                if (!record.loginTime) return false;
                const loginTime = new Date(record.loginTime);
                return loginTime >= today && loginTime <= todayEnd;
            });

            setTodayAttendance(todayRecord || null);
            return todayRecord || null;
        } catch (err) {
            console.error("Failed to fetch today's attendance:", err);
            setTodayAttendance(null);
            return null;
        }
    };

    // Fetch today's attendance on mount and when options change
    useEffect(() => {
        getTodayAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [options.userId]);

    return {
        attendance,
        loading,
        error,
        pagination,
        todayAttendance,
        setTodayAttendance,
        refetch: fetchAttendance,
        createAttendance,
        updateAttendance,
        clockIn,
        clockOut,
        getTodayAttendance,
    };
}

