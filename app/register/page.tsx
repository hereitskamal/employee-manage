"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
  Alert,
  Paper,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirm?: string;
  }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Name is required";

    if (!email.trim()) nextErrors.email = "Email is required";
    else if (!EMAIL_REGEX.test(email.trim()))
      nextErrors.email = "Please enter a valid email";

    if (!password) nextErrors.password = "Password is required";
    else if (password.length < 6)
      nextErrors.password = "Password must be at least 6 characters";

    if (!confirm) nextErrors.confirm = "Please confirm your password";
    else if (password !== confirm)
      nextErrors.confirm = "Passwords do not match";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "Failed to register. Please try again.");
        return;
      }

      setFormSuccess("Account created! Logging you in…");

      // auto-login
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (loginRes?.ok) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Register error:", err);
      setFormError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at top, #f4f7ff 0, #f8f9fb 40%, #eef1f7 100%)",
        px: 2,
        py: 6,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            p: 4,
            bgcolor: "rgba(255,255,255,0.9)",
            // backdropFilter: "blur(10px)",
            // border: "1px solid rgba(15, 23, 42, 0.06)",
            // boxShadow: "0 18px 45px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Typography variant="h4" fontWeight={700} textAlign="left" mb={0.5}>
            Create an account
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="left"
            mb={4}
          >
            Sign up with your email and start managing employees.
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
                label="Full name"
                size="small"
                fullWidth
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name)
                    setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                        color: "text.secondary",
                      }}
                    >
                      <PersonOutlineOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
              <TextField
                label="Work email"
                type="email"
                size="small"
                fullWidth
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                        color: "text.secondary",
                      }}
                    >
                      <EmailOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
              <TextField
                label="Password"
                type="password"
                size="small"
                fullWidth
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                error={!!errors.password}
                helperText={errors.password || "At least 6 characters"}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                        color: "text.secondary",
                      }}
                    >
                      <LockOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />
              <TextField
                label="Confirm password"
                type="password"
                size="small"
                fullWidth
                value={confirm}
                onChange={(e) => {
                  setConfirm(e.target.value);
                  if (errors.confirm)
                    setErrors((prev) => ({ ...prev, confirm: undefined }));
                }}
                error={!!errors.confirm}
                helperText={errors.confirm}
                InputProps={{
                  startAdornment: (
                    <Box
                      component="span"
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mr: 1,
                        color: "text.secondary",
                      }}
                    >
                      <LockOutlinedIcon fontSize="small" />
                    </Box>
                  ),
                }}
              />

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
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <CircularProgress size={18} color="inherit" />
                    <span>Creating account...</span>
                  </Stack>
                ) : (
                  "Sign up"
                )}
              </Button>
            </Stack>
          </Box>

          <Typography
            mt={3}
            textAlign="center"
            variant="body2"
            color="text.secondary"
          >
            Already have an account?{" "}
            <Button
              variant="text"
              size="small"
              onClick={() => router.push("/login")}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                px: 0.3,
                minWidth: "auto",
              }}
            >
              Log in
            </Button>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
