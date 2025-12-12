"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Alert,
  Paper,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Flags from session token
  const userFlags = (session?.user as any) ?? undefined;
  const mustSetPassword = userFlags?.mustSetPassword ?? false;

  // Form fields
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [title, setTitle] = useState("");
  const [salary, setSalary] = useState<string>("");
  const [hireDate, setHireDate] = useState("");
  const [location, setLocation] = useState("");
  const [age, setAge] = useState<string>("");
  const [performance, setPerformance] = useState<string>("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // Departments dropdown
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);

  // UI state
  // allow undefined so we can clear individual keys with undefined
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Redirect if unauthenticated or already complete
  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (
      status === "authenticated" &&
      userFlags &&
      !userFlags.mustSetPassword &&
      userFlags.isProfileComplete
    ) {
      router.replace("/dashboard");
    }
  }, [status, router, userFlags]);

  // Load departments for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/departments");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setDepartments(data);
        } else {
          console.error("Failed to load departments", await res.text());
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoadingDepartments(false);
      }
    };
    load();
  }, []);

  // Basic validation
  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!phone.trim()) nextErrors.phone = "Phone is required";
    if (!department.trim()) nextErrors.department = "Department is required";
    if (!title.trim()) nextErrors.title = "Title is required";
    if (!hireDate) nextErrors.hireDate = "Hire date is required";

    if (salary && Number(salary) < 0) nextErrors.salary = "Salary must be positive";

    if (mustSetPassword) {
      if (!password) nextErrors.password = "Password is required";
      else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";

      if (!confirm) nextErrors.confirm = "Please confirm your password";
      else if (password !== confirm) nextErrors.confirm = "Passwords do not match";
    }

    // setErrors accepts Record<string, string | undefined>
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/profile/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          department,
          title,
          salary: salary ? Number(salary) : undefined,
          hireDate: hireDate || undefined,
          location: location || undefined,
          age: age ? Number(age) : undefined,
          performance: performance ? Number(performance) : undefined,
          password: mustSetPassword ? password : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "Failed to update profile");
        return;
      }

      setFormSuccess("Profile completed successfully! Redirecting…");

      setTimeout(() => {
        router.replace("/dashboard");
      }, 1200);
    } catch (err) {
      console.error("Complete profile error:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Loading skeleton
  if (status === "loading") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at top, #f4f7ff 0, #f8f9fb 40%, #eef1f7 100%)",
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            p: 4,
            bgcolor: "rgba(255,255,255,0.9)",
          }}
        >
          <Typography variant="h4" fontWeight={700} mb={0.5}>
            Complete your profile
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={4}>
            Just a few more details to finish setting up your account.
          </Typography>

          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}

          {formSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {formSuccess}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.2}>
              <TextField
                label="Phone"
                size="small"
                fullWidth
                required
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                error={!!errors.phone}
                helperText={errors.phone}
              />

              {/* Department dropdown */}
              <Autocomplete
                freeSolo
                options={departments}
                loading={loadingDepartments}
                value={department}
                onChange={(_, value) => {
                  setDepartment(value || "");
                  if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
                }}
                onInputChange={(_, value) => {
                  setDepartment(value);
                  if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    size="small"
                    required
                    error={!!errors.department}
                    helperText={errors.department || "Type to search or add department"}
                  />
                )}
              />

              <TextField
                label="Title"
                size="small"
                fullWidth
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                error={!!errors.title}
                helperText={errors.title}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Salary"
                  type="number"
                  size="small"
                  fullWidth
                  value={salary}
                  onChange={(e) => {
                    setSalary(e.target.value);
                    if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
                  }}
                  error={!!errors.salary}
                  helperText={errors.salary || "Optional"}
                />

                <TextField
                  label="Hire date"
                  type="date"
                  size="small"
                  fullWidth
                  required
                  value={hireDate}
                  onChange={(e) => {
                    setHireDate(e.target.value);
                    if (errors.hireDate) setErrors((prev) => ({ ...prev, hireDate: undefined }));
                  }}
                  error={!!errors.hireDate}
                  helperText={errors.hireDate}
                  InputLabelProps={{ shrink: true }}
                />
              </Stack>

              <TextField
                label="Location"
                size="small"
                fullWidth
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
                }}
                error={!!errors.location}
                helperText={errors.location || "Optional"}
              />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Age"
                  type="number"
                  size="small"
                  fullWidth
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                  }}
                  error={!!errors.age}
                  helperText={errors.age || "Optional"}
                />

                <TextField
                  label="Performance score"
                  type="number"
                  size="small"
                  fullWidth
                  value={performance}
                  onChange={(e) => {
                    setPerformance(e.target.value);
                    if (errors.performance) setErrors((prev) => ({ ...prev, performance: undefined }));
                  }}
                  error={!!errors.performance}
                  helperText={errors.performance || "Optional (0–100)"}
                />
              </Stack>

              {mustSetPassword && (
                <>
                  <Typography variant="subtitle2" color="text.secondary" mt={1}>
                    Create your password
                  </Typography>

                  <TextField
                    label="New password"
                    type="password"
                    size="small"
                    fullWidth
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    error={!!errors.password}
                    helperText={errors.password || "At least 6 characters"}
                  />

                  <TextField
                    label="Confirm password"
                    type="password"
                    size="small"
                    fullWidth
                    value={confirm}
                    onChange={(e) => {
                      setConfirm(e.target.value);
                      if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
                    }}
                    error={!!errors.confirm}
                    helperText={errors.confirm}
                  />
                </>
              )}

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 0.5,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                  py: 1.1,
                }}
              >
                {loading ? (
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CircularProgress size={18} color="inherit" />
                    <span>Saving...</span>
                  </Stack>
                ) : (
                  "Save and continue"
                )}
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
