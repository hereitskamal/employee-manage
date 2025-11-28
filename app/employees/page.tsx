'use client';

import { Box, Breadcrumbs, Button, Container, Stack, Typography } from "@mui/material";
import { useState } from "react";

import { useEmployees } from "@/hooks/useEmployees";
import EmployeeFilters from "@/components/employees/EmployeeFilter";
import EmployeeTable from "@/components/employees/EmployeeTable";
import AddEmployeeModal from "@/components/employees/AddEmployee";
import { departments } from "@/data/departments"

import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
    const {
        filteredEmployees,
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        fetchEmployees,
    } = useEmployees();

    const [modalOpen, setModalOpen] = useState(false);
    const router = useRouter();

    return (
        <Box sx={{ backgroundColor: "#f8f9fa", minHeight: "100vh", p: 4 }}>
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                <Link
                    underline="hover"
                    color="inherit"
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        router.push("/");
                    }}
                    sx={{ cursor: "pointer" }}
                >
                    Home
                </Link>
                <Typography color="text.primary">Employee Dashboard</Typography>
            </Breadcrumbs>
            <Container maxWidth="xl" sx={{ backgroundColor: "white", p: 4, pb: 0, borderRadius: 2 }}>
                <EmployeeFilters
                    searchText={searchText}
                    setSearchText={setSearchText}
                    departments={departments}
                    departmentFilter={departmentFilter}
                    setDepartmentFilter={setDepartmentFilter}
                    onAddClick={() => setModalOpen(true)}
                />

                <Box sx={{ mt: 2 }}>
                    <EmployeeTable rows={filteredEmployees}  fetchEmployees={fetchEmployees}  />
                </Box>
            </Container>

            <AddEmployeeModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAdded={fetchEmployees}   
            />
        </Box>
    );
}
