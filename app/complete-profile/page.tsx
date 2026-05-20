"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { Autocomplete } from "@/components/ui/Autocomplete";

export default function CompleteProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Flags from session token
  const userFlags = session?.user;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-gray-100 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-1">Complete your profile</h1>
          <p className="text-sm text-gray-600 mb-8">
            Just a few more details to finish setting up your account.
          </p>

          {formError && (
            <div className="mb-6">
              <Alert severity="error">{formError}</Alert>
            </div>
          )}

          {formSuccess && (
            <div className="mb-6">
              <Alert severity="success">{formSuccess}</Alert>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Input
              label="Phone"
              required
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={errors.phone}
              fullWidth
            />

            <Autocomplete
              label="Department"
              required
              options={departments}
              value={department}
              onChange={(value) => {
                setDepartment(value);
                if (errors.department) setErrors((prev) => ({ ...prev, department: undefined }));
              }}
              error={errors.department}
              helperText={errors.department || "Type to search or add department"}
              loading={loadingDepartments}
              freeSolo
              fullWidth
            />

            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              error={errors.title}
              fullWidth
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Salary"
                type="number"
                value={salary}
                onChange={(e) => {
                  setSalary(e.target.value);
                  if (errors.salary) setErrors((prev) => ({ ...prev, salary: undefined }));
                }}
                error={errors.salary}
                helperText={errors.salary || "Optional"}
                fullWidth
              />

              <Input
                label="Hire date"
                type="date"
                required
                value={hireDate}
                onChange={(e) => {
                  setHireDate(e.target.value);
                  if (errors.hireDate) setErrors((prev) => ({ ...prev, hireDate: undefined }));
                }}
                error={errors.hireDate}
                fullWidth
              />
            </div>

            <Input
              label="Location"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location) setErrors((prev) => ({ ...prev, location: undefined }));
              }}
              error={errors.location}
              helperText={errors.location || "Optional"}
              fullWidth
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => {
                  setAge(e.target.value);
                  if (errors.age) setErrors((prev) => ({ ...prev, age: undefined }));
                }}
                error={errors.age}
                helperText={errors.age || "Optional"}
                fullWidth
              />

              <Input
                label="Performance score"
                type="number"
                value={performance}
                onChange={(e) => {
                  setPerformance(e.target.value);
                  if (errors.performance) setErrors((prev) => ({ ...prev, performance: undefined }));
                }}
                error={errors.performance}
                helperText={errors.performance || "Optional (0–100)"}
                fullWidth
              />
            </div>

            {mustSetPassword && (
              <>
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-gray-600 mb-4">Create your password</h3>
                  <div className="space-y-4">
                    <Input
                      label="New password"
                      type="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      error={errors.password}
                      helperText={errors.password || "At least 6 characters"}
                      fullWidth
                    />

                    <Input
                      label="Confirm password"
                      type="password"
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        if (errors.confirm) setErrors((prev) => ({ ...prev, confirm: undefined }));
                      }}
                      error={errors.confirm}
                      fullWidth
                    />
                  </div>
                </div>
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              fullWidth
            >
              {loading ? "Saving..." : "Save and continue"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
