"use client";

import { Drawer, Typography, Divider, Box, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useEmployee from "../hooks/useEmployee";

interface EmployeeDrawerProps {
  id: number | null;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export default function EmployeeDrawer({ id, onClose, onDeleteSuccess }: EmployeeDrawerProps) {
  const { employee, loading } = useEmployee(id);

  const handleDelete = async () => {
    if (!employee) return;
    if (!confirm("Are you sure you want to delete this employee?")) return;

    await fetch(`/api/employees/${employee.id}`, { method: "DELETE" });

    onDeleteSuccess();
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={!!id}
      onClose={onClose}
      PaperProps={{ sx: { width: 350, p: 2 } }}
    >
      {loading && (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      )}

      {!loading && employee && (
        <>
          <Box display="flex" justifyContent="space-between" mb={2}>
            <Typography variant="h5">{employee.name}</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider />

          <Typography mt={2} fontWeight="bold">Department</Typography>
          <Typography>{employee.department}</Typography>

          <Typography mt={2} fontWeight="bold">Job Title</Typography>
          <Typography>{employee.title}</Typography>

          <Typography mt={2} fontWeight="bold">Email</Typography>
          <Typography>{employee.email}</Typography>

          <Typography mt={2} fontWeight="bold">Phone</Typography>
          <Typography>{employee.phone}</Typography>

          <Typography mt={2} fontWeight="bold">Location</Typography>
          <Typography>{employee.location}</Typography>

          <Typography mt={2} fontWeight="bold">Salary</Typography>
          <Typography>${employee.salary}</Typography>

          <Typography mt={2} fontWeight="bold">Age</Typography>
          <Typography>{employee.age}</Typography>

          <Typography mt={2} fontWeight="bold">Hire Date</Typography>
          <Typography>{employee.hireDate}</Typography>

          {employee.performance !== undefined && (
            <>
              <Typography mt={2} fontWeight="bold">Performance</Typography>
              <Typography>{employee.performance}%</Typography>
            </>
          )}

          <Box mt={4}>
            <button
              style={{
                width: "100%",
                padding: "10px",
                background: "#d32f2f",
                color: "white",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                fontWeight: "bold",
              }}
              onClick={handleDelete}
            >
              Delete Employee
            </button>
          </Box>
        </>
      )}
    </Drawer>
  );
}
