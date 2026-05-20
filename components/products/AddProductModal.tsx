// components/products/AddProductModal.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Package, Star } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Autocomplete } from "@/components/ui/Autocomplete";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { canManageProducts } from "@/lib/access";
import { getCurrencySymbol } from "@/lib/utils/currency";

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

// preset electronics categories & brands (still freeSolo)
const CATEGORY_OPTIONS = [
    "Television",
    "Refrigerator",
    "Washing Machine",
    "Air Conditioner",
    "Microwave Oven",
    "Water Purifier",
    "Geyser",
    "Cooler",
    "Dishwasher",
];

const BRAND_OPTIONS = [
    "Samsung",
    "LG",
    "Whirlpool",
    "Sony",
    "Panasonic",
    "Bosch",
    "Haier",
    "IFB",
    "Voltas",
    "Godrej",
    "Onida",
];

export default function AddProductModal({
    open,
    onClose,
    onAdded,
}: AddProductModalProps) {
    const { data: session } = useSession();
    const isPrivileged = canManageProducts(session?.user?.role);
    const isAdminOrManager = session?.user?.role === "admin" || session?.user?.role === "manager";

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingClose, setPendingClose] = useState(false);

    const [form, setForm] = useState({
        name: "",
        category: "",
        brand: "",
        modelNo: "",
        modelYear: "",
        image: "",
        purchaseRate: "",
        distributorRate: "",
        minSaleRate: "",
        tagRate: "",
        starRating: "",
        criticalSellScore: "",
        stock: "",
    });

    // Check if form has been modified
    const hasUnsavedChanges = () => {
        return !!(
            form.name.trim() ||
            form.category.trim() ||
            form.brand.trim() ||
            form.modelNo.trim() ||
            form.modelYear.trim() ||
            form.image.trim() ||
            form.purchaseRate.trim() ||
            form.distributorRate.trim() ||
            form.minSaleRate.trim() ||
            form.tagRate.trim() ||
            form.starRating.trim() ||
            form.criticalSellScore.trim() ||
            form.stock.trim()
        );
    };

    useEffect(() => {
        if (open) {
            setForm({
                name: "",
                category: "",
                brand: "",
                modelNo: "",
                modelYear: "",
                image: "",
                purchaseRate: "",
                distributorRate: "",
                minSaleRate: "",
                tagRate: "",
                starRating: "",
                criticalSellScore: "",
                stock: "",
            });
            setErrors({});
            setLoadingSubmit(false);
            setPendingClose(false);
        }
    }, [open]);

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

    const handleChange = (field: keyof typeof form, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.name.trim()) e.name = "Name is required";
        if (!form.category.trim()) e.category = "Category is required";
        if (!form.brand.trim()) e.brand = "Brand is required";
        if (!form.modelNo.trim()) e.modelNo = "Model number is required";
        if (!form.minSaleRate || Number(form.minSaleRate) <= 0)
            e.minSaleRate = "Min sale rate is required";
        if (!form.stock || Number(form.stock) < 0)
            e.stock = "Stock is required";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!isPrivileged) return; // backend also blocks, but just in case

        setLoadingSubmit(true);
        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...form,
                    modelYear: form.modelYear ? Number(form.modelYear) : undefined,
                    purchaseRate: form.purchaseRate
                        ? Number(form.purchaseRate)
                        : undefined,
                    distributorRate: form.distributorRate
                        ? Number(form.distributorRate)
                        : undefined,
                    minSaleRate: Number(form.minSaleRate),
                    tagRate: form.tagRate ? Number(form.tagRate) : undefined,
                    starRating: form.starRating ? Number(form.starRating) : undefined,
                    criticalSellScore: form.criticalSellScore
                        ? Number(form.criticalSellScore)
                        : undefined,
                    stock: Number(form.stock),
                }),
            });

            if (!res.ok) {
                let message = "Failed to save product";
                try {
                    const data = await res.json();
                    if (data?.message) message = data.message;
                } catch {
                    const text = await res.text();
                    if (text) message = text;
                }
                console.error(message);
                alert(message);
                return;
            }

            onAdded?.();
            // Reset form state before closing
            setForm({
                name: "",
                category: "",
                brand: "",
                modelNo: "",
                modelYear: "",
                image: "",
                purchaseRate: "",
                distributorRate: "",
                minSaleRate: "",
                tagRate: "",
                starRating: "",
                criticalSellScore: "",
                stock: "",
            });
            onClose();
        } catch (err) {
            console.error("Failed to save product:", err);
            alert("Something went wrong while saving the product.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    // Only admin and manager can create products (API restriction)
    if (!isAdminOrManager) return null;

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
            title="Add New Product"
            subtitle="Fill in the details to add a new item"
            maxWidth="sm"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} disabled={loadingSubmit}>
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        isLoading={loadingSubmit}
                        startIcon={<Save className="w-4 h-4" />}
                        onClick={(e) => {
                            e.preventDefault();
                            const formEl = document.querySelector("form[noValidate]") as HTMLFormElement | null;
                            formEl?.requestSubmit();
                        }}
                    >
                        {loadingSubmit ? "Adding..." : "Add Product"}
                    </Button>
                </>
            }
        >
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="space-y-4">
                    <Input
                        label="Name"
                        required
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        error={errors.name}
                        fullWidth
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Autocomplete
                            label="Category"
                            required
                            options={CATEGORY_OPTIONS}
                            value={form.category}
                            onChange={(value) => handleChange("category", value)}
                            error={errors.category}
                            helperText={errors.category || "Type or select category"}
                            freeSolo
                            fullWidth
                        />

                        <Autocomplete
                            label="Brand"
                            required
                            options={BRAND_OPTIONS}
                            value={form.brand}
                            onChange={(value) => handleChange("brand", value)}
                            error={errors.brand}
                            helperText={errors.brand || "Type or select brand"}
                            freeSolo
                            fullWidth
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Model No"
                            required
                            value={form.modelNo}
                            onChange={(e) => handleChange("modelNo", e.target.value)}
                            error={errors.modelNo}
                            fullWidth
                        />
                        <Input
                            label="Model Year"
                            type="number"
                            value={form.modelYear}
                            onChange={(e) => handleChange("modelYear", e.target.value)}
                            fullWidth
                        />
                    </div>

                    <Input
                        label="Image URL"
                        value={form.image}
                        onChange={(e) => handleChange("image", e.target.value)}
                        fullWidth
                    />
                </div>

                {isAdminOrManager && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Purchase Rate"
                            type="number"
                            value={form.purchaseRate}
                            onChange={(e) => handleChange("purchaseRate", e.target.value)}
                            startIcon={<span className="text-gray-500">{getCurrencySymbol()}</span>}
                            fullWidth
                        />
                        <Input
                            label="Distributor Rate"
                            type="number"
                            value={form.distributorRate}
                            onChange={(e) => handleChange("distributorRate", e.target.value)}
                            startIcon={<span className="text-gray-500">{getCurrencySymbol()}</span>}
                            fullWidth
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Min Sale Rate"
                        type="number"
                        required
                        value={form.minSaleRate}
                        onChange={(e) => handleChange("minSaleRate", e.target.value)}
                        error={errors.minSaleRate}
                        startIcon={<span className="text-gray-500">{getCurrencySymbol()}</span>}
                        fullWidth
                    />
                    <Input
                        label="Tag Rate"
                        type="number"
                        value={form.tagRate}
                        onChange={(e) => handleChange("tagRate", e.target.value)}
                        startIcon={<span className="text-gray-500">{getCurrencySymbol()}</span>}
                        fullWidth
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Star Rating"
                        type="number"
                        value={form.starRating}
                        onChange={(e) => handleChange("starRating", e.target.value)}
                        startIcon={<Star className="w-4 h-4" />}
                        min={0}
                        max={5}
                        step={0.1}
                        fullWidth
                    />
                    <Input
                        label="Critical Sell Score"
                        type="number"
                        value={form.criticalSellScore}
                        onChange={(e) => handleChange("criticalSellScore", e.target.value)}
                        helperText="1–10 (how urgent to sell)"
                        min={0}
                        max={10}
                        step={1}
                        fullWidth
                    />
                </div>

                <Input
                    label="Stock"
                    type="number"
                    required
                    value={form.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                    error={errors.stock}
                    min={0}
                    fullWidth
                />
            </form>
        </Modal>
        </>
    );
}
