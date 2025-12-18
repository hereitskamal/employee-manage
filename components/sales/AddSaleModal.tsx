// components/sales/AddSaleModal.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { useProducts } from "@/hooks/useProducts";
import { useSession } from "next-auth/react";
import { useSales } from "@/hooks/useSales";

interface AddSaleModalProps {
    open: boolean;
    onClose: () => void;
}

interface SaleProduct {
    productId: string;
    quantity: number;
    price: number;
}

export default function AddSaleModal({ open, onClose }: AddSaleModalProps) {
    const { data: session } = useSession();
    const { products } = useProducts();
    const { createSale, refetch } = useSales();
    const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            setSaleProducts([]);
            setSaleDate(new Date().toISOString().split("T")[0]);
        }
    }, [open]);

    const handleAddProduct = () => {
        setSaleProducts([
            ...saleProducts,
            { productId: "", quantity: 1, price: 0 },
        ]);
    };

    const handleRemoveProduct = (index: number) => {
        setSaleProducts(saleProducts.filter((_, i) => i !== index));
    };

    const handleProductChange = (
        index: number,
        field: keyof SaleProduct,
        value: string | number
    ) => {
        const updated = [...saleProducts];
        updated[index] = { ...updated[index], [field]: value };

        // Auto-fill price from product
        if (field === "productId" && value) {
            const product = products.find((p) => p._id === value || p.id === value);
            if (product && product.minSaleRate) {
                updated[index].price = product.minSaleRate;
            }
        }

        setSaleProducts(updated);
    };

    const calculateTotal = () => {
        return saleProducts.reduce(
            (sum, p) => sum + p.quantity * p.price,
            0
        );
    };

    const handleSubmit = async () => {
        if (saleProducts.length === 0) {
            alert("Please add at least one product");
            return;
        }

        for (const product of saleProducts) {
            if (!product.productId || product.quantity <= 0 || product.price <= 0) {
                alert("Please fill all product fields correctly");
                return;
            }
        }

        if (!session?.user?.id) {
            alert("User session not found");
            return;
        }

        setLoading(true);
        try {
            await createSale({
                products: saleProducts,
                soldBy: session.user.id,
                saleDate: saleDate,
                status: "completed",
            });
            await refetch();
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to create sale");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Create New Sale</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                    <TextField
                        label="Sale Date"
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography variant="h6">Products</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            onClick={handleAddProduct}
                            variant="outlined"
                            size="small"
                        >
                            Add Product
                        </Button>
                    </Box>

                    {saleProducts.length > 0 && (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Product</TableCell>
                                        <TableCell align="right">Quantity</TableCell>
                                        <TableCell align="right">Price</TableCell>
                                        <TableCell align="right">Subtotal</TableCell>
                                        <TableCell align="center">Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {saleProducts.map((product, index) => (
                                        <TableRow key={index}>
                                            <TableCell>
                                                <FormControl fullWidth size="small">
                                                    <Select
                                                        value={product.productId}
                                                        onChange={(e) =>
                                                            handleProductChange(
                                                                index,
                                                                "productId",
                                                                e.target.value
                                                            )
                                                        }
                                                    >
                                                        {products.map((p) => (
                                                            <MenuItem
                                                                key={p._id || p.id}
                                                                value={p._id || p.id}
                                                            >
                                                                {p.name} - Stock: {p.stock || 0}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={product.quantity}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            index,
                                                            "quantity",
                                                            parseInt(e.target.value) || 0
                                                        )
                                                    }
                                                    inputProps={{ min: 1 }}
                                                    sx={{ width: 80 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    value={product.price}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            index,
                                                            "price",
                                                            parseFloat(e.target.value) || 0
                                                        )
                                                    }
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                ₹{(product.quantity * product.price).toLocaleString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleRemoveProduct(index)}
                                                    color="error"
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {saleProducts.length > 0 && (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                            <Typography variant="h6">
                                Total: ₹{calculateTotal().toLocaleString()}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button onClick={handleSubmit} variant="contained" disabled={loading}>
                    Create Sale
                </Button>
            </DialogActions>
        </Dialog>
    );
}

