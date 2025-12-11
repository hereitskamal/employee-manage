// components/products/AddProductModal.tsx
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
    InputAdornment,
    IconButton,
    Box,
    CircularProgress,
    Autocomplete,
} from "@mui/material";
import {
    Save,
    Close,
    Inventory2Outlined,
    StarBorder,
} from "@mui/icons-material";
import { FormEvent, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

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
    const isPrivileged =
        session?.user?.role === "admin" || session?.user?.role === "manager";

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

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
        }
    }, [open]);

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
            onClose();
        } catch (err) {
            console.error("Failed to save product:", err);
            alert("Something went wrong while saving the product.");
        } finally {
            setLoadingSubmit(false);
        }
    };

    if (!isPrivileged) return null; // no modal if not admin/manager

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
                        <Inventory2Outlined color="primary" fontSize="small" />
                    </Box>
                    <Box>
                        <Typography variant="subtitle1" sx={{ height: 16 }} fontWeight={600}>
                            Add New Product
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Fill in the details to add a new item
                        </Typography>
                    </Box>
                </Stack>
                <IconButton size="small" onClick={onClose}>
                    <Close />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{
                        bgcolor: "white",
                        borderRadius: 2,
                        p: 2,
                    }}
                >
                    <Stack spacing={2.5}>
                        <Stack spacing={2}>
                            <TextField
                                size="small"
                                label="Name"
                                fullWidth
                                required
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
                            />

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <Autocomplete
                                    fullWidth
                                    freeSolo
                                    options={CATEGORY_OPTIONS}
                                    value={form.category}
                                    onChange={(_, value) =>
                                        handleChange("category", (value as string) || "")
                                    }
                                    onInputChange={(_, value) =>
                                        handleChange("category", (value as string) || "")
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            label="Category"
                                            required
                                            error={!!errors.category}
                                            helperText={
                                                errors.category || "Type or select category"
                                            }
                                        />
                                    )}
                                />

                                <Autocomplete
                                    fullWidth
                                    freeSolo
                                    options={BRAND_OPTIONS}
                                    value={form.brand}
                                    onChange={(_, value) =>
                                        handleChange("brand", (value as string) || "")
                                    }
                                    onInputChange={(_, value) =>
                                        handleChange("brand", (value as string) || "")
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            size="small"
                                            label="Brand"
                                            required
                                            error={!!errors.brand}
                                            helperText={errors.brand || "Type or select brand"}
                                        />
                                    )}
                                />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                <TextField
                                    size="small"
                                    label="Model No"
                                    fullWidth
                                    required
                                    value={form.modelNo}
                                    onChange={(e) => handleChange("modelNo", e.target.value)}
                                    error={!!errors.modelNo}
                                    helperText={errors.modelNo}
                                />
                                <TextField
                                    size="small"
                                    label="Model Year"
                                    type="number"
                                    fullWidth
                                    value={form.modelYear}
                                    onChange={(e) => handleChange("modelYear", e.target.value)}
                                />
                            </Stack>

                            <TextField
                                size="small"
                                label="Image URL"
                                fullWidth
                                value={form.image}
                                onChange={(e) => handleChange("image", e.target.value)}
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                size="small"
                                label="Purchase Rate"
                                type="number"
                                fullWidth
                                value={form.purchaseRate}
                                onChange={(e) => handleChange("purchaseRate", e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                size="small"
                                label="Distributor Rate"
                                type="number"
                                fullWidth
                                value={form.distributorRate}
                                onChange={(e) =>
                                    handleChange("distributorRate", e.target.value)
                                }
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                size="small"
                                label="Min Sale Rate"
                                type="number"
                                fullWidth
                                required
                                value={form.minSaleRate}
                                onChange={(e) => handleChange("minSaleRate", e.target.value)}
                                error={!!errors.minSaleRate}
                                helperText={errors.minSaleRate}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                size="small"
                                label="Tag Rate"
                                type="number"
                                fullWidth
                                value={form.tagRate}
                                onChange={(e) => handleChange("tagRate", e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">₹</InputAdornment>
                                    ),
                                }}
                            />
                        </Stack>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                            <TextField
                                size="small"
                                label="Star Rating"
                                type="number"
                                fullWidth
                                value={form.starRating}
                                onChange={(e) => handleChange("starRating", e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <StarBorder fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{ min: 0, max: 5, step: 0.1 }}
                            />
                            <TextField
                                size="small"
                                label="Critical Sell Score"
                                type="number"
                                fullWidth
                                value={form.criticalSellScore}
                                onChange={(e) =>
                                    handleChange("criticalSellScore", e.target.value)
                                }
                                helperText="1–10 (how urgent to sell)"
                                inputProps={{ min: 0, max: 10, step: 1 }}
                            />
                        </Stack>

                        <TextField
                            size="small"
                            label="Stock"
                            type="number"
                            fullWidth
                            required
                            value={form.stock}
                            onChange={(e) => handleChange("stock", e.target.value)}
                            error={!!errors.stock}
                            helperText={errors.stock}
                            inputProps={{ min: 0 }}
                        />

                        <button type="submit" hidden />
                    </Stack>
                </Box>
            </DialogContent>

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
                    form=""
                    startIcon={
                        loadingSubmit ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <Save />
                        )
                    }
                    variant="contained"
                    disabled={loadingSubmit}
                    onClick={() => {
                        const formEl = document.querySelector(
                            "form[noValidate]"
                        ) as HTMLFormElement | null;
                        formEl?.requestSubmit();
                    }}
                >
                    {loadingSubmit ? "Adding..." : "Add Product"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
