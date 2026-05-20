// components/sales/AddSaleModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, User } from "lucide-react";
import { useProducts } from "@/hooks/useProducts";
import { useSession } from "next-auth/react";
import { useSales } from "@/hooks/useSales";
import { useEmployees } from "@/hooks/useEmployees";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { isPrivileged } from "@/lib/access";
import { formatCurrency } from "@/lib/utils/currency";

interface AddSaleModalProps {
    open: boolean;
    onClose: () => void;
    onAdded?: () => void;
}

interface SaleProduct {
    productId: string;
    quantity: number;
    price: number;
}

export default function AddSaleModal({ open, onClose, onAdded }: AddSaleModalProps) {
    const { data: session } = useSession();
    const { products } = useProducts();
    const { createSale, refetch } = useSales();
    const { employees } = useEmployees();
    const isPrivilegedUser = isPrivileged(session?.user?.role);
    
    const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([]);
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split("T")[0]);
    const [soldBy, setSoldBy] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingClose, setPendingClose] = useState(false);
    const [initialDate, setInitialDate] = useState(new Date().toISOString().split("T")[0]);

    // Check if form has been modified
    const hasUnsavedChanges = () => {
        const dateChanged = saleDate !== initialDate;
        const hasProducts = saleProducts.length > 0;
        const hasSoldBy = isPrivilegedUser && soldBy !== "";
        return dateChanged || hasProducts || hasSoldBy;
    };

    useEffect(() => {
        if (open) {
            const today = new Date().toISOString().split("T")[0];
            setSaleProducts([]);
            setSaleDate(today);
            setInitialDate(today);
            // Set default soldBy to current user for non-privileged users
            if (!isPrivilegedUser && session?.user?.id) {
                setSoldBy(session.user.id);
            } else {
                setSoldBy("");
            }
            setPendingClose(false);
        }
    }, [open, isPrivilegedUser, session?.user?.id]);

    // Handle close with confirmation
    const handleClose = () => {
        if (hasUnsavedChanges() && !loading) {
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

        // Determine soldBy - use selected employee for privileged users, or current user for others
        let targetSoldBy: string;
        if (isPrivilegedUser) {
            if (!soldBy) {
                alert("Please select an employee");
                return;
            }
            targetSoldBy = soldBy;
        } else {
            targetSoldBy = session.user.id;
        }
        
        if (!targetSoldBy) {
            alert("Unable to determine employee for sale");
            return;
        }

        setLoading(true);
        try {
            await createSale({
                products: saleProducts,
                soldBy: targetSoldBy,
                saleDate: saleDate,
                status: "completed",
            });
            await refetch();
            if (onAdded) {
                onAdded();
            }
            // Reset form state before closing
            setSaleProducts([]);
            const today = new Date().toISOString().split("T")[0];
            setSaleDate(today);
            setInitialDate(today);
            if (!isPrivilegedUser && session?.user?.id) {
                setSoldBy(session.user.id);
            } else {
                setSoldBy("");
            }
            onClose();
        } catch (error) {
            alert(error instanceof Error ? error.message : "Failed to create sale");
        } finally {
            setLoading(false);
        }
    };

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
            title="Create New Sale"
            maxWidth="md"
            closeOnBackdrop={false}
            footer={
                <>
                    <Button variant="outline" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={loading}>
                        Create Sale
                    </Button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                        label="Sale Date"
                        type="date"
                        value={saleDate}
                        onChange={(e) => setSaleDate(e.target.value)}
                        fullWidth
                    />
                    
                    {isPrivilegedUser && (
                        <Select
                            label="Sold By"
                            required
                            options={employees.map((emp) => ({
                                value: emp._id || emp.id || "",
                                label: `${emp.name} (${emp.email})`,
                            }))}
                            value={soldBy}
                            onChange={(e) => setSoldBy(e.target.value)}
                            startIcon={<User className="w-4 h-4" />}
                            placeholder="Select employee"
                            fullWidth
                        />
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                    <Button
                        variant="outline"
                        size="sm"
                        startIcon={<Plus className="w-4 h-4" />}
                        onClick={handleAddProduct}
                    >
                        Add Product
                    </Button>
                </div>

                {saleProducts.length > 0 && (
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Product</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Quantity</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                                        <th className="px-4 py-3 text-right font-semibold text-gray-700">Subtotal</th>
                                        <th className="px-4 py-3 text-center font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {saleProducts.map((product, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <select
                                                    value={product.productId}
                                                    onChange={(e) =>
                                                        handleProductChange(
                                                            index,
                                                            "productId",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                                >
                                                    <option value="">Select Product</option>
                                                    {products.map((p) => (
                                                        <option key={p._id || p.id} value={p._id || p.id}>
                                                            {p.name} - Stock: {p.stock || 0}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Input
                                                        type="number"
                                                        value={product.quantity}
                                                        onChange={(e) =>
                                                            handleProductChange(
                                                                index,
                                                                "quantity",
                                                                parseInt(e.target.value) || 0
                                                            )
                                                        }
                                                        min={1}
                                                        className="w-20"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end">
                                                    <Input
                                                        type="number"
                                                        value={product.price}
                                                        onChange={(e) =>
                                                            handleProductChange(
                                                                index,
                                                                "price",
                                                                parseFloat(e.target.value) || 0
                                                            )
                                                        }
                                                        min={0}
                                                        step={0.01}
                                                        className="w-24"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                {formatCurrency(product.quantity * product.price)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveProduct(index)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {saleProducts.length > 0 && (
                    <div className="flex justify-end pt-2">
                        <div className="text-lg font-semibold text-gray-900">
                            Total: {formatCurrency(calculateTotal())}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
        </>
    );
}

