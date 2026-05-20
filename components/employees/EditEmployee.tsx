"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import { Save, UserPlus, Briefcase, Mail, Phone, MapPin, Calendar, Star, Shield } from "lucide-react";
import { EmployeeForm } from "@/types/employee";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { canManageEmployees } from "@/lib/access";
import { ROLES } from "@/lib/roles";
import { getCurrencySymbol } from "@/lib/utils/currency";
import { useEmployees } from "@/hooks/useEmployees";
import useEmployee from "@/hooks/useEmployee";
import { getId } from "@/types/nextjs";

interface EditEmployeeModalProps {
  open: boolean;
  employeeId: string | null;
  onClose: () => void;
  onUpdated?: () => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EditEmployeeModal({ open, employeeId, onClose, onUpdated }: EditEmployeeModalProps) {
  const { data: session } = useSession();
  const canManage = canManageEmployees(session?.user?.role);
  const { employee, loading: loadingEmployee } = useEmployee(employeeId);
  const { updateEmployee } = useEmployees();
  
  const [departments, setDepartments] = useState<string[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  type FormState = {
    name: string;
    department: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    salary: number;
    age: number;
    hireDate: string;
    performance: number;
    role: string;
  };

  const [form, setForm] = useState<FormState>({
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
    role: "employee",
  });

  const [initialForm, setInitialForm] = useState<FormState>({
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
    role: "employee",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  // Load employee data when modal opens and employee is loaded
  useEffect(() => {
    if (open && employee && !loadingEmployee) {
      const hireDateStr = employee.hireDate 
        ? new Date(employee.hireDate).toISOString().split("T")[0]
        : "";
      
      const formData: FormState = {
        name: employee.name || "",
        department: employee.department || "",
        title: employee.title || "",
        email: employee.email || "",
        phone: employee.phone || "",
        location: employee.location || "",
        salary: employee.salary || 0,
        age: employee.age || 0,
        hireDate: hireDateStr,
        performance: employee.performance || 0,
        role: employee.role || "employee",
      };
      
      setForm(formData);
      setInitialForm(formData);
      setErrors({});
    }
  }, [open, employee, loadingEmployee]);

  // Check if form has been modified
  const hasUnsavedChanges = () => {
    if (!employee) return false;
    return (
      form.name !== initialForm.name ||
      form.email !== initialForm.email ||
      form.phone !== initialForm.phone ||
      form.department !== initialForm.department ||
      form.title !== initialForm.title ||
      form.location !== initialForm.location ||
      form.salary !== initialForm.salary ||
      form.age !== initialForm.age ||
      form.hireDate !== initialForm.hireDate ||
      form.performance !== initialForm.performance ||
      form.role !== initialForm.role
    );
  };

  // Handle close with confirmation
  const handleClose = () => {
    if (hasUnsavedChanges() && !loadingSubmit) {
      setShowConfirmDialog(true);
      setPendingClose(true);
    } else {
      onClose();
    }
  };

  // Confirm discard changes
  const handleConfirmDiscard = () => {
    setShowConfirmDialog(false);
    setPendingClose(false);
    onClose();
  };

  // Cancel discard
  const handleCancelDiscard = () => {
    setShowConfirmDialog(false);
    setPendingClose(false);
  };

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

  // Hide modal if user doesn't have permission (after all hooks)
  if (!canManage) {
    return null;
  }

  const handleChange = (field: keyof FormState, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
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

    const name = String(form.name || "");
    if (!name.trim()) newErrors.name = "Name is required";

    const email = String(form.email || "");
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    const department = String(form.department || "");
    if (!department.trim()) newErrors.department = "Department is required";

    const salary = Number(form.salary || 0);
    if (!salary || salary <= 0) newErrors.salary = "Valid salary is required";

    const age = Number(form.age || 0);
    if (!age || age <= 0) {
      newErrors.age = "Valid age is required";
    } else if (age < 18 || age > 100) {
      newErrors.age = "Age must be between 18 and 100";
    }

    const phone = String(form.phone || "");
    if (phone) {
      const digitsOnly = phone.replace(/\D/g, "");
      if (digitsOnly.length !== 10) {
        newErrors.phone = "Phone number must be exactly 10 digits";
      }
    }

    const dateStr = form.hireDate || "";
    const dateError = validateDate(dateStr);
    if (dateError) newErrors.hireDate = dateError;

    const performance = Number(form.performance || 0);
    if (
      form.performance !== undefined &&
      form.performance !== null &&
      performance !== 0 &&
      (performance < 0 || performance > 100)
    ) {
      newErrors.performance = "Performance must be between 0 and 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate() || !employeeId) return;

    setLoadingSubmit(true);
    try {
      const id = getId(employee) || employeeId;
      await updateEmployee({
        id,
        data: {
          ...form,
          role: form.role || "employee",
        },
      });

      // Trigger a page reload or refetch to show updated data
      if (onUpdated) {
        onUpdated();
      } else {
        // Fallback: reload the page to show updated data
        window.location.reload();
      }
      onClose();
    } catch (error) {
      console.error("Failed to update employee:", error);
      alert(error instanceof Error ? error.message : "Something went wrong while updating the employee. Please try again.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Hide modal if user doesn't have permission (after all hooks)
  if (!canManage) {
    return null;
  }

  const isLoading = loadingEmployee || loadingSubmit;

  return (
    <>
      <ConfirmDialog
        open={showConfirmDialog}
        onClose={handleCancelDiscard}
        onConfirm={handleConfirmDiscard}
        title="Discard Changes?"
        message="You have unsaved changes. Are you sure you want to close without saving?"
        confirmText="Discard"
        cancelText="Keep Editing"
        variant="warning"
      />
      <Modal
        open={open && !showConfirmDialog}
        onClose={handleClose}
        title="Edit Employee"
        subtitle="Update employee information"
        maxWidth="sm"
        closeOnBackdrop={false}
        footer={
          <>
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              variant="primary"
              isLoading={isLoading}
              startIcon={<Save className="w-4 h-4" />}
              onClick={(e) => {
                e.preventDefault();
                const formEl = document.querySelector('form[noValidate]') as HTMLFormElement | null;
                formEl?.requestSubmit();
              }}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </>
        }
      >
        {loadingEmployee ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading employee data...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Section: Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  required
                  autoFocus
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  error={errors.name}
                  startIcon={<UserPlus className="w-4 h-4" />}
                  fullWidth
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Autocomplete
                    label="Department"
                    required
                    options={departments}
                    value={form.department || ""}
                    onChange={(value) => handleChange("department", value)}
                    error={errors.department}
                    helperText={errors.department || "Type to search or add department"}
                    startIcon={<Briefcase className="w-4 h-4" />}
                    loading={loadingDepartments}
                    freeSolo
                    fullWidth
                  />

                  <Input
                    label="Job Title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    fullWidth
                  />
                </div>

                {session?.user?.role === "admin" && (
                  <Select
                    label="Role"
                    options={ROLES.filter(r => r !== "admin").map(role => ({
                      value: role,
                      label: role.charAt(0).toUpperCase() + role.slice(1),
                    }))}
                    value={form.role || "employee"}
                    onChange={(e) => handleChange("role", e.target.value)}
                    startIcon={<Shield className="w-4 h-4" />}
                    fullWidth
                  />
                )}
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Section: Contact */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Contact Details</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    error={errors.email}
                    startIcon={<Mail className="w-4 h-4" />}
                    fullWidth
                  />
                  <Input
                    label="Phone"
                    value={form.phone}
                    onChange={(e) => {
                      const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleChange("phone", digitsOnly);
                    }}
                    error={errors.phone}
                    helperText={errors.phone || "10-digit phone number"}
                    startIcon={<Phone className="w-4 h-4" />}
                    maxLength={10}
                    inputMode="numeric"
                    fullWidth
                  />
                </div>

                <Input
                  label="Location"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  startIcon={<MapPin className="w-4 h-4" />}
                  fullWidth
                />
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Section: Work & Performance */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-4">Work & Performance</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Salary"
                    type="number"
                    required
                    value={form.salary || ""}
                    onChange={(e) => handleChange("salary", Number(e.target.value) || 0)}
                    error={errors.salary}
                    startIcon={<span className="text-gray-500">{getCurrencySymbol()}</span>}
                    fullWidth
                  />
                  <Input
                    label="Age"
                    type="number"
                    required
                    value={form.age || ""}
                    onChange={(e) => handleChange("age", Number(e.target.value) || 0)}
                    error={errors.age}
                    min={18}
                    max={100}
                    fullWidth
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Hire Date"
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => handleChange("hireDate", e.target.value)}
                    error={errors.hireDate}
                    startIcon={<Calendar className="w-4 h-4" />}
                    max={new Date().toISOString().split("T")[0]}
                    fullWidth
                  />
                  <Input
                    label="Performance Score"
                    type="number"
                    value={form.performance || ""}
                    onChange={(e) => handleChange("performance", Number(e.target.value) || 0)}
                    error={errors.performance}
                    helperText={errors.performance || "0–100"}
                    startIcon={<Star className="w-4 h-4" />}
                    min={0}
                    max={100}
                    step={0.1}
                    fullWidth
                  />
                </div>
              </div>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}

