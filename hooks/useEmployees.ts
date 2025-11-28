import { useState, useMemo, useEffect } from "react";
import { EmployeeRow, EmployeeForm } from "@/types/employee";

export const useEmployees = () => {
    const [employees, setEmployees] = useState<EmployeeRow[]>([]);
    const [searchText, setSearchText] = useState<string>("");
    const [departmentFilter, setDepartmentFilter] = useState<string>("");

    // -----------------------------------
    // Fetch employees from API
    // -----------------------------------
    const fetchEmployees = async () => {
        const res = await fetch("/api/employees", { cache: "no-store" });
        const data = await res.json();
        setEmployees(data);
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    // -----------------------------------
    // Filtering logic
    // -----------------------------------
    const filteredEmployees = useMemo(() => {
        return employees.filter((emp) => {
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
        await fetch("/api/employees", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...newEmployee,
                salary: Number(newEmployee.salary),
                age: Number(newEmployee.age),
                performance: Number(newEmployee.performance)
            })
        });
        await fetchEmployees();
    };

    return {
        employees,
        filteredEmployees,
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        handleAddEmployee,
        fetchEmployees       
    };
};
