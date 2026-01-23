/**
 * Example component demonstrating React Query usage with useEmployees and useProducts hooks
 * 
 * This file shows how to use the migrated hooks in a real component.
 * The hooks maintain backward compatibility while adding React Query benefits.
 */

"use client";

import { useEmployees } from "@/hooks/useEmployees";
import { useProducts } from "@/hooks/useProducts";
import { Box, Typography, Button, CircularProgress, Alert } from "@mui/material";

/**
 * Example: Basic usage of useEmployees hook
 * 
 * All existing APIs work exactly as before, but now with React Query benefits:
 * - Automatic caching
 * - Background refetching
 * - Request deduplication
 * - Error states
 */
export function EmployeesExample() {
    const {
        employees,
        filteredEmployees,
        searchText,
        setSearchText,
        departmentFilter,
        setDepartmentFilter,
        handleAddEmployee,
        fetchEmployees,
        loading,
        error,
    } = useEmployees();

    if (error) {
        return <Alert severity="error">Error: {error.message}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5">Employees Example</Typography>
            
            {loading && <CircularProgress />}
            
            <Typography variant="body2">
                Total: {employees.length} | Filtered: {filteredEmployees.length}
            </Typography>

            {/* All existing functionality works */}
            <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search employees..."
            />

            <Button onClick={() => fetchEmployees()}>
                Manual Refresh
            </Button>
        </Box>
    );
}

/**
 * Example: Using mutation helpers for update/delete
 * 
 * The hooks now expose mutation helpers that automatically invalidate cache:
 * - updateEmployee({ id, data })
 * - deleteEmployee(id)
 * - invalidateEmployees()
 */
export function EmployeesMutationsExample() {
    const {
        updateEmployee,
        deleteEmployee,
        invalidateEmployees,
        loading,
    } = useEmployees();

    const handleUpdate = async (id: string) => {
        try {
            // Update employee - cache is automatically invalidated
            await updateEmployee({
                id,
                data: { name: "Updated Name" },
            });
            // No need to call fetchEmployees() - React Query handles it!
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            // Delete employee - cache is automatically invalidated
            await deleteEmployee(id);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const handleManualInvalidate = () => {
        // Manually invalidate if needed (e.g., after bulk operations)
        invalidateEmployees();
    };

    return (
        <Box>
            <Typography variant="h5">Mutations Example</Typography>
            {loading && <CircularProgress />}
            
            <Button onClick={() => handleUpdate("employee-id")}>
                Update Employee
            </Button>
            
            <Button onClick={() => handleDelete("employee-id")}>
                Delete Employee
            </Button>
            
            <Button onClick={handleManualInvalidate}>
                Manual Invalidate
            </Button>
        </Box>
    );
}

/**
 * Example: Basic usage of useProducts hook
 */
export function ProductsExample() {
    const {
        products,
        filteredProducts,
        categories,
        brands,
        searchText,
        setSearchText,
        categoryFilter,
        setCategoryFilter,
        brandFilter,
        setBrandFilter,
        fetchProducts,
        loading,
        error,
    } = useProducts();

    if (error) {
        return <Alert severity="error">Error: {error.message}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5">Products Example</Typography>
            
            {loading && <CircularProgress />}
            
            <Typography variant="body2">
                Total: {products.length} | Filtered: {filteredProducts.length}
            </Typography>
            
            <Typography variant="body2">
                Categories: {categories.length} | Brands: {brands.length}
            </Typography>

            {/* All existing functionality works */}
            <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search products..."
            />

            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                    <option key={cat} value={cat}>
                        {cat}
                    </option>
                ))}
            </select>

            <Button onClick={() => fetchProducts()}>
                Manual Refresh
            </Button>
        </Box>
    );
}

/**
 * Example: Using product mutations
 */
export function ProductsMutationsExample() {
    const {
        updateProduct,
        deleteProduct,
        invalidateProducts,
        loading,
    } = useProducts();

    const handleUpdate = async (id: string) => {
        try {
            await updateProduct({
                id,
                data: { name: "Updated Product" },
            });
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteProduct(id);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    return (
        <Box>
            <Typography variant="h5">Product Mutations Example</Typography>
            {loading && <CircularProgress />}
            
            <Button onClick={() => handleUpdate("product-id")}>
                Update Product
            </Button>
            
            <Button onClick={() => handleDelete("product-id")}>
                Delete Product
            </Button>
            
            <Button onClick={invalidateProducts}>
                Manual Invalidate
            </Button>
        </Box>
    );
}




