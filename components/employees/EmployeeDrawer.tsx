"use client";

import {
  Drawer,
  Typography,
  Divider,
  Box,
  IconButton,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import RoomIcon from "@mui/icons-material/Room";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import useEmployee from "@/hooks/useEmployee";

interface EmployeeDrawerProps {
  id: string | null;
  onClose: () => void;
  onDeleteSuccess: () => void;
}

export default function EmployeeDrawer({
  id,
  onClose,
  onDeleteSuccess,
}: EmployeeDrawerProps) {
  const { employee, loading } = useEmployee(id ? Number(id) : null);

  const formatDate = (value?: string | Date) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDelete = async () => {
    if (!employee) return;
    if (!confirm("Are you sure you want to delete this employee?")) return;

    const employeeId = (employee as any)._id ?? (employee as any).id;

    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let message = "Failed to delete employee";
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch {
          const text = await res.text();
          if (text) message = text;
        }
        alert(message);
        return;
      }

      onDeleteSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to delete employee:", err);
      alert(
        "Something went wrong while deleting the employee. Please try again."
      );
    }
  };

  return (
    <Drawer
      anchor="right"
      open={!!id}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          p: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#f5f6fa",
        },
      }}
    >
      {/* Top bar */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "white",
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          Employee Details
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
        {loading && (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        )}

        {!loading && employee && (
          <>
            {/* Header section */}
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: "white",
                // boxShadow: "0 1px 3px rgba(15, 23, 42, 0.08)",
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ width: 52, height: 52 }}>
                  {getInitials(employee.name)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {employee.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                    {employee.department && (
                      <Chip
                        size="small"
                        icon={<WorkOutlineIcon fontSize="small" />}
                        label={employee.department}
                        sx={{ borderRadius: "999px" }}
                      />
                    )}
                    {employee.title && (
                      <Chip
                        size="small"
                        label={employee.title}
                        variant="outlined"
                        sx={{ borderRadius: "999px" }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Contact section */}
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: "white",
                // boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                gutterBottom
              >
                Contact
              </Typography>

              <InfoRow
                icon={<EmailIcon fontSize="small" />}
                label="Email"
                value={employee.email}
              />
              <InfoRow
                icon={<PhoneIcon fontSize="small" />}
                label="Phone"
                value={employee.phone}
              />
              <InfoRow
                icon={<RoomIcon fontSize="small" />}
                label="Location"
                value={employee.location || "-"}
              />
            </Box>

            {/* Work section */}
            <Box
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: "white",
                // boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={600}
                color="text.secondary"
                gutterBottom
              >
                Work & Compensation
              </Typography>

              <InfoRow
                icon={<MonetizationOnIcon fontSize="small" />}
                label="Salary"
                value={`₹${employee.salary}`}
              />
              <InfoRow
                icon={<CalendarTodayIcon fontSize="small" />}
                label="Hire Date"
                value={formatDate(employee.hireDate)}
              />
              <InfoRow label="Age" value={employee.age ?? "-"} />
              {employee.performance !== undefined &&
                employee.performance !== null && (
                  <InfoRow
                    label="Performance"
                    value={`${employee.performance}%`}
                  />
                )}
            </Box>
          </>
        )}
      </Box>

      {/* Footer actions */}
      {!loading && employee && (
        <Box
          sx={{
            p: 2,
            bgcolor: "white",
          }}
        >
          <Button
            fullWidth
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
          >
            Delete Employee
          </Button>
        </Box>
      )}
    </Drawer>
  );
}

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        py: 0.6,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        {icon && <Box sx={{ color: "text.secondary" }}>{icon}</Box>}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ minWidth: 90 }}
        >
          {label}
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{ fontWeight: 500, textAlign: "right", ml: 2 }}
      >
        {value}
      </Typography>
    </Box>
  );
}
