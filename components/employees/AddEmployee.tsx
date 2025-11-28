"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    MenuItem,
    Typography,
    Divider,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState, FormEvent } from "react";
import { Save, PersonAdd, Close } from "@mui/icons-material";
import { EmployeeForm } from "@/types/employee";


interface AddEmployeeModalProps {
    open: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

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
        // Clear error on change
        if (errors[field as string]) {
            setErrors((prev) => ({ ...prev, [field as string]: "" }));
        }
    };

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.trim()) newErrors.email = "Email is required";
        if (!form.department) newErrors.department = "Department is required";
        if (!form.salary || form.salary <= 0) newErrors.salary = "Valid salary is required";
        if (!form.age || form.age <= 0) newErrors.age = "Valid age is required";
        if (form.performance && (form.performance < 0 || form.performance > 100)) {
            newErrors.performance = "Performance must be 0-100";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoadingSubmit(true);
        try {
            const response = await fetch("/api/employees", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (response.ok) {
                onAdded?.();
                onClose();
            } else {
                console.error("Failed to save employee");
            }
        } catch (error) {
            console.error("Failed to save employee:", error);
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
                    borderRadius: 4,
                    p: 2,
                },
            }}
        >
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <PersonAdd color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Add New Employee
                        </Typography>
                    </Stack>
                    <Button onClick={onClose} variant="text">
                        <Close fontSize="small" />
                    </Button>
                </Stack>
            </DialogTitle>

            <Divider sx={{ mb: 3 }} />

            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Stack spacing={3}>
                        <TextField
                            size="small"
                            label="Full Name *"
                            fullWidth
                            required
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            error={!!errors.name}
                            helperText={errors.name}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">👤</InputAdornment>,
                            }}
                        />

                        <TextField
                            select
                            size="small"
                            label="Department *"
                            required
                            value={form.department}
                            onChange={(e) => handleChange("department", e.target.value)}
                            fullWidth
                            error={!!errors.department}
                            helperText={errors.department}
                            disabled={loadingDepartments}
                        >
                            <MenuItem value="">Select Department</MenuItem>
                            {departments.map((dep) => (
                                <MenuItem key={dep} value={dep}>
                                    {dep}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                label="Job Title"
                                fullWidth
                                value={form.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                            />
                            <TextField
                                size="small"
                                label="Email *"
                                type="email"
                                required
                                fullWidth
                                value={form.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Stack>

                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                label="Phone"
                                fullWidth
                                value={form.phone}
                                onChange={(e) => handleChange("phone", e.target.value)}
                            />
                            <TextField
                                size="small"
                                label="Location"
                                fullWidth
                                value={form.location}
                                onChange={(e) => handleChange("location", e.target.value)}
                            />
                        </Stack>

                        <Divider sx={{ my: 2 }} />

                        <Stack direction="row" spacing={2}>
                            <TextField
                                size="small"
                                label="Salary *"
                                type="number"
                                required
                                fullWidth
                                value={form.salary || ""}
                                onChange={(e) => handleChange("salary", Number(e.target.value) || 0)}
                                error={!!errors.salary}
                                helperText={errors.salary}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                }}
                            />
                            <TextField
                                size="small"
                                label="Age *"
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
                                    inputProps: { max: new Date().toISOString().split('T')[0] }
                                }}
                            />
                            <TextField
                                size="small"
                                label="Performance Score"
                                type="number"
                                fullWidth
                                value={form.performance || ""}
                                onChange={(e) => handleChange("performance", Number(e.target.value) || 0)}
                                error={!!errors.performance}
                                helperText={errors.performance || "0-100"}
                                inputProps={{ min: 0, max: 100, step: 0.1 }}
                            />
                        </Stack>
                    </Stack>
                </form>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button onClick={onClose} disabled={loadingSubmit}>
                    Cancel
                </Button>
                <Button
                    startIcon={loadingSubmit ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    variant="contained"
                    disabled={loadingSubmit}
                    onClick={handleSubmit as any}
                >
                    {loadingSubmit ? "Adding..." : "Add Employee"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
