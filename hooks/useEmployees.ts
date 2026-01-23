import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EmployeeRow, EmployeeForm } from "@/types/employee";

// Query keys
export const employeeKeys = {
    all: ["employees"] as const,
    lists: () => [...employeeKeys.all, "list"] as const,
    list: () => [...employeeKeys.lists()] as const,
};

// Fetch function
const fetchEmployees = async (): Promise<EmployeeRow[]> => {
    const res = await fetch("/api/employees", { cache: "no-store" });
    const data = await res.json();

    // Handle both old format (direct array) and new format ({ success, data })
    if (data.success && data.data) {
        return Array.isArray(data.data) ? data.data : [];
    } else if (Array.isArray(data)) {
        return data;
    } else {
        return [];
    }
};

// Create function
const createEmployee = async (newEmployee: EmployeeForm): Promise<void> => {
    const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...newEmployee,
            salary: Number(newEmployee.salary),
            age: Number(newEmployee.age),
            performance: Number(newEmployee.performance),
        }),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create employee" }));
        throw new Error(errorData.message || "Failed to create employee");
    }
};

// Update function
const updateEmployee = async ({ id, data }: { id: string; data: Partial<EmployeeForm> }): Promise<void> => {
    const res = await fetch(`/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update employee" }));
        throw new Error(errorData.message || "Failed to update employee");
    }
};

// Delete function
const deleteEmployee = async (id: string): Promise<void> => {
    const res = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete employee" }));
        throw new Error(errorData.message || "Failed to delete employee");
    }
};

export const useEmployees = () => {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState<string>("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("");

    // Query for fetching employees
    const {
        data: employees = [],
        isLoading,
        isError,
        error,
        refetch: refetchEmployees,
    } = useQuery({
        queryKey: employeeKeys.list(),
        queryFn: fetchEmployees,
    });

    // Mutation for creating employee
    const createMutation = useMutation({
        mutationFn: createEmployee,
        onSuccess: () => {
            // Invalidate and refetch employees list
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
        },
    });

    // Mutation for updating employee
    const updateMutation = useMutation({
        mutationFn: updateEmployee,
        onSuccess: () => {
            // Invalidate and refetch employees list
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
        },
    });

    // Mutation for deleting employee
    const deleteMutation = useMutation({
        mutationFn: deleteEmployee,
        onSuccess: () => {
            // Invalidate and refetch employees list
            queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
        },
    });

    // Filtering logic
    const filteredEmployees = useMemo(() => {
        return employees?.filter?.((emp) => {
            const search = searchText.toLowerCase();
            const matchesSearch =
                emp.name.toLowerCase().includes(search) ||
                emp.email.toLowerCase().includes(search) ||
                emp.title.toLowerCase().includes(search);

            const matchesDepartment =
                !departmentFilter || emp.department === departmentFilter;

            return matchesSearch && matchesDepartment;
        });
    }, [searchText, departmentFilter, employees]);

    // Add employee handler (backward compatible)
    const handleAddEmployee = async (newEmployee: EmployeeForm) => {
        await createMutation.mutateAsync(newEmployee);
    };

    // Fetch employees handler (backward compatible)
    const fetchEmployeesHandler = async () => {
        await refetchEmployees();
    };

    // Loading state combines query loading and mutation loading
    const loading = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return {
        employees,
        filteredEmployees,
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        handleAddEmployee,
        fetchEmployees: fetchEmployeesHandler,
        loading,
        // Additional React Query states for advanced usage
        error: isError ? error : null,
        isRefetching: false, // Can be exposed if needed
        // Mutation helpers for update/delete (optional, for advanced usage)
        updateEmployee: updateMutation.mutateAsync,
        deleteEmployee: deleteMutation.mutateAsync,
        invalidateEmployees: () => queryClient.invalidateQueries({ queryKey: employeeKeys.list() }),
    };
};
