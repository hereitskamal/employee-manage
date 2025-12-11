"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Typography,
  Divider,
  InputAdornment,
  CircularProgress,
  Autocomplete,
  Box,
  IconButton,
} from "@mui/material";
import { useEffect, useState, FormEvent } from "react";
import { Save, PersonAdd, Close, WorkOutline, Email, Phone, LocationOn, CalendarToday, StarBorder } from "@mui/icons-material";
import { EmployeeForm } from "@/types/employee";

interface AddEmployeeModalProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function AddEmployeeModal({ open, onClose, onAdded }: AddEmployeeModalProps) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [form, setForm] = useState<EmployeeForm>({
    name: "",
    department: "",
    title: "",
    email: "",
    phone: "",
    location: "",
    salary: 0,
    age: 0,
    hireDate: "",
    performance: 0,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setForm({
        name: "",
        department: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        salary: 0,
        age: 0,
        hireDate: "",
        performance: 0,
      });
      setErrors({});
      setLoadingSubmit(false);
    }
  }, [open]);

  // Fetch departments
  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const res = await fetch("/api/departments");
        if (res.ok) {
          const data = await res.json();
          setDepartments(data);
        } else {
          console.error("Failed to load departments", await res.text());
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (field: keyof EmployeeForm, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: "" }));
    }
  };

  const validateDate = (dateStr: string): string | null => {
    if (!dateStr) return null;

    const [year, month, day] = dateStr.split("-").map(Number);
    const date = new Date(dateStr);

    if (
      !year ||
      !month ||
      !day ||
      isNaN(date.getTime()) ||
      date.getFullYear() !== year ||
      date.getMonth() + 1 !== month ||
      date.getDate() !== day
    ) {
      return "Please select a valid date";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date > today) {
      return "Hire date cannot be in the future";
    }

    return null;
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.name.trim()) newErrors.name = "Name is required";

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.department?.trim()) newErrors.department = "Department is required";

    if (!form.salary || form.salary <= 0) newErrors.salary = "Valid salary is required";

    if (!form.age || form.age <= 0) {
      newErrors.age = "Valid age is required";
    } else if (form.age < 18 || form.age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    if (form.phone) {
      const digitsOnly = form.phone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
    }

    const dateError = validateDate(form.hireDate);
    if (dateError) newErrors.hireDate = dateError;

    if (
      form.performance !== undefined &&
      form.performance !== null &&
      form.performance !== 0 &&
      (form.performance < 0 || form.performance > 100)
    ) {
      newErrors.performance = "Performance must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setLoadingSubmit(true);
    try {
      const response = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        let message = "Failed to save employee";
        try {
          const data = await response.json();
          if (data?.message) message = data.message;
        } catch {
          const text = await response.text();
          if (text) message = text;
        }
        console.error(message);
        alert(message);
        return;
      }

      onAdded?.();
      onClose();
    } catch (error) {
      console.error("Failed to save employee:", error);
      alert("Something went wrong while saving the employee. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={(e, reason) => reason !== "backdropClick" && onClose()}
      fullWidth
      maxWidth="sm"
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          p: 0,
          overflow: "hidden",
          bgcolor: "#f5f6fa",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          px: 2.5,
          py: 1.5,
          borderBottom: "1px solid #e0e0e0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "white",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <PersonAdd color="primary" fontSize="small" />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ height: 16 }} fontWeight={600}>
              Add New Employee
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Fill in the details to create a new record
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0}}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 2,
            // boxShadow: "0 1px 4px rgba(15, 23, 42, 0.05)",
          }}
        >
          <Stack spacing={2.5}>
            {/* Section: Basic Info */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
                Basic Information
              </Typography>
              <Stack spacing={2}>
                <TextField
                  size="small"
                  label="Full Name"
                  fullWidth
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={!!errors.name}
                  helperText={errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonAdd fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Stack direction="row" spacing={2}>
                  <Autocomplete
                    fullWidth
                    freeSolo
                    options={departments}
                    loading={loadingDepartments}
                    value={form.department || ""}
                    onChange={(_, value) => handleChange("department", value || "")}
                    onInputChange={(_, value) => handleChange("department", value || "")}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Department"
                        required
                        error={!!errors.department}
                        helperText={errors.department || "Type to search or add department"}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <InputAdornment position="start">
                                <WorkOutline fontSize="small" />
                              </InputAdornment>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  <TextField
                    size="small"
                    label="Job Title"
                    fullWidth
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Section: Contact */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
                Contact Details
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="Email"
                    type="email"
                    required
                    fullWidth
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ inputMode: "email" }}
                  />
                  <TextField
                    size="small"
                    label="Phone"
                    fullWidth
                    value={form.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleChange("phone", digitsOnly);
                    }}
                    error={!!errors.phone}
                    helperText={errors.phone || "10-digit phone number"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ maxLength: 10, inputMode: "numeric" }}
                  />
                </Stack>

                <TextField
                  size="small"
                  label="Location"
                  fullWidth
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            </Box>

            <Divider />

            {/* Section: Work & Performance */}
            <Box>
              <Typography variant="subtitle2" fontWeight={600} mb={2} color="text.secondary">
                Work & Performance
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="Salary"
                    type="number"
                    required
                    fullWidth
                    value={form.salary || ""}
                    onChange={(e) => handleChange("salary", Number(e.target.value) || 0)}
                    error={!!errors.salary}
                    helperText={errors.salary}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    size="small"
                    label="Age"
                    type="number"
                    required
                    fullWidth
                    value={form.age || ""}
                    onChange={(e) => handleChange("age", Number(e.target.value) || 0)}
                    error={!!errors.age}
                    helperText={errors.age}
                    inputProps={{ min: 18, max: 100 }}
                  />
                </Stack>

                <Stack direction="row" spacing={2}>
                  <TextField
                    size="small"
                    label="Hire Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    value={form.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                    InputProps={{
                      inputProps: { max: new Date().toISOString().split("T")[0] },
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.hireDate}
                    helperText={errors.hireDate}
                  />
                  <TextField
                    size="small"
                    label="Performance Score"
                    type="number"
                    fullWidth
                    value={form.performance || ""}
                    onChange={(e) => handleChange("performance", Number(e.target.value) || 0)}
                    error={!!errors.performance}
                    helperText={errors.performance || "0–100"}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <StarBorder fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                    inputProps={{ min: 0, max: 100, step: 0.1 }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Hidden actual submit button for Enter key if needed */}
            <button type="submit" hidden />
          </Stack>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 2.5,
          py: 1.5,
          borderTop: "1px solid #e0e0e0",
          bgcolor: "white",
        }}
      >
        <Button onClick={onClose} disabled={loadingSubmit}>
          Cancel
        </Button>
        <Button
          type="submit"
          form={undefined} // form is the Box with onSubmit; submit via hidden button OR keep this as onClick if you prefer
          startIcon={
            loadingSubmit ? <CircularProgress size={18} color="inherit" /> : <Save />
          }
          variant="contained"
          disabled={loadingSubmit}
          onClick={() => {
            // manually trigger submit by dispatching submit event on the form
            const formEl = document.querySelector(
              'form[noValidate]'
            ) as HTMLFormElement | null;
            formEl?.requestSubmit();
          }}
        >
          {loadingSubmit ? "Adding..." : "Add Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
