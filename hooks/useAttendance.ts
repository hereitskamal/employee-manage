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
    success: boolean;
    data?: {
        attendance: AttendanceRow[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    };
    error?: string;
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
            const data: AttendanceResponse = await response.json();
            
            if (!response.ok || !data.success || !data.data) {
                throw new Error(data.error || "Failed to fetch attendance");
            }

            setAttendance(data.data.attendance);
            setPagination(data.data.pagination);
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

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to create attendance");
            }

            await fetchAttendance(); // Refresh list
            return data.data?.attendance;
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

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to update attendance");
            }

            await fetchAttendance(); // Refresh list
            return data.data?.attendance;
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

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to clock in");
            }

            // Update todayAttendance immediately from the response
            // Note: clock-in endpoint may not be refactored yet, so handle both formats
            const attendance = data.data?.attendance || data.attendance;
            if (attendance) {
                setTodayAttendance(attendance);
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

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.error || "Failed to clock out");
            }

            // Update todayAttendance immediately from the response
            // Note: clock-out endpoint may not be refactored yet, so handle both formats
            const attendance = data.data?.attendance || data.attendance;
            if (attendance) {
                setTodayAttendance(attendance);
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
            const data: AttendanceResponse = await response.json();
            
            if (!response.ok || !data.success || !data.data) {
                throw new Error(data.error || "Failed to fetch today's attendance");
            }

            // Find today's record by checking if loginTime is within today's range
            // This is more reliable than checking the date field due to timezone issues
            const todayRecord = data.data.attendance.find(record => {
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

