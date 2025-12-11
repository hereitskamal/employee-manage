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
    Divider,
    IconButton,
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CircularProgress from "@mui/material/CircularProgress";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";


    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [formError, setFormError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);


    const validate = () => {
        const nextErrors: typeof errors = {};
        if (!email.trim()) nextErrors.email = "Email is required";
        else if (!EMAIL_REGEX.test(email.trim())) nextErrors.email = "Please enter a valid email";

        if (!password) nextErrors.password = "Password is required";
        else if (password.length < 6) nextErrors.password = "Password must be at least 6 characters";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email,
                password,
                callbackUrl,
            });

            if (res?.error) {
                setFormError(res.error || "Invalid email or password");
            } else if (res?.ok) {
                router.push(callbackUrl);
            }
        } catch (err) {
            console.error("Login error:", err);
            setFormError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await signIn("google", { callbackUrl });
    };

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
                    {/* Top back button (optional) */}


                    <Typography variant="h4" fontWeight={700} textAlign="left" mb={0.5}>
                        Welcome back
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="left"
                        mb={6}
                    >
                        Log in to manage your employees and dashboard.
                    </Typography>

                    {formError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {formError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2.2}>
                            <TextField
                                label="Work email"
                                type="email"
                                size="small"
                                fullWidth
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
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
                                helperText={errors.password}
                            />

                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    component="a"
                                    href="/forgot-password"
                                    type="button"
                                    size="small"
                                    sx={{
                                        textTransform: "none",
                                        fontSize: 12,
                                        p: 0,
                                        minWidth: "auto",
                                        background: "transparent",
                                        boxShadow: "none",
                                        color: "primary.main",
                                        "&:hover": { color: "text.secondary", boxShadow: "none", background: "transparent" },
                                    }}
                                >
                                    Forgot password?
                                </Button>
                            </Box>

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
                                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                        <CircularProgress size={18} color="inherit" />
                                        <span>Logging in...</span>
                                    </Stack>
                                ) : (
                                    "Log in"
                                )}
                            </Button>

                            <Divider sx={{ my: 1.5, fontSize: 12, color: "text.secondary" }}>
                                or continue with
                            </Divider>

                            <Button
                                variant="outlined"
                                size="large"
                                onClick={handleGoogleLogin}
                                startIcon={<GoogleIcon />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    py: 1.05,
                                    borderColor: "rgba(148, 163, 184, 0.6)",
                                    "&:hover": {
                                        borderColor: "primary.main",
                                        backgroundColor: "rgba(37, 99, 235, 0.03)",
                                    },
                                }}
                            >
                                Google
                            </Button>
                        </Stack>
                    </Box>

                    <Typography mt={3} textAlign="center" variant="body2" color="text.secondary">
                        Don&apos;t have an account?{" "}
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => router.push("/register")}
                            sx={{
                                textTransform: "none",
                                fontWeight: 600,
                                px: 0.3,
                                minWidth: "auto",
                            }}
                        >
                            Sign up
                        </Button>
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
}
