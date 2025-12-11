import { useState, useMemo, useEffect } from "react";
import { EmployeeRow, EmployeeForm } from "@/types/employee";

export const useEmployees = () => {
    const [employees, setEmployees] = useState<EmployeeRow[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false); // 👈 NEW

    // -----------------------------------
    // Fetch employees from API
    // -----------------------------------
    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/employees", { cache: "no-store" });
            const data = await res.json();
            setEmployees(data);
        } catch (err) {
            console.error("Failed to fetch employees", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // -----------------------------------
    // Filtering logic
    // -----------------------------------
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

    // -----------------------------------
    // Add employee
    // -----------------------------------
    const handleAddEmployee = async (newEmployee: EmployeeForm) => {
        try {
            setLoading(true);
            await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newEmployee,
                    salary: Number(newEmployee.salary),
                    age: Number(newEmployee.age),
                    performance: Number(newEmployee.performance),
                }),
            });
            await fetchEmployees();
        } finally {
            setLoading(false);
        }
    };

    return {
        employees,
        filteredEmployees,
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        handleAddEmployee,
        fetchEmployees,
        loading,
    };
};
