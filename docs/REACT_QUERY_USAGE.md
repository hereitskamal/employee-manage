# React Query Usage Examples

This document provides examples of using the migrated `useEmployees` and `useProducts` hooks with TanStack React Query.

## Setup

The React Query provider is already configured in `app/layout.tsx`. No additional setup is required.

## Basic Usage

### useEmployees Hook

The hook maintains backward compatibility with the existing API:

```tsx
"use client";

import { useEmployees } from "@/hooks/useEmployees";

export default function EmployeesPage() {
    const {
        employees,              // All employees
        filteredEmployees,      // Filtered by search/department
        searchText,
        departmentFilter,
        setSearchText,
        setDepartmentFilter,
        handleAddEmployee,      // Create new employee
        fetchEmployees,         // Manual refetch
        loading,                // Loading state
    } = useEmployees();

    return (
        <div>
            {/* Your UI components */}
            {loading && <p>Loading...</p>}
            {filteredEmployees.map(emp => (
                <div key={emp._id}>{emp.name}</div>
            ))}
        </div>
    );
}
```

### useProducts Hook

Similar API structure:

```tsx
"use client";

import { useProducts } from "@/hooks/useProducts";

export default function ProductsPage() {
    const {
        products,               // All products
        filteredProducts,      // Filtered by search/category/brand
        categories,            // Derived categories list
        brands,                // Derived brands list
        searchText,
        categoryFilter,
        brandFilter,
        setSearchText,
        setCategoryFilter,
        setBrandFilter,
        fetchProducts,         // Manual refetch
        loading,               // Loading state
    } = useProducts();

    return (
        <div>
            {/* Your UI components */}
        </div>
    );
}
```

## Advanced Usage with Mutations

### Using Update/Delete Mutations

Both hooks now expose mutation helpers for update and delete operations:

```tsx
"use client";

import { useEmployees } from "@/hooks/useEmployees";
import { useProducts } from "@/hooks/useProducts";

// Example: Update Employee
function EmployeeComponent() {
    const { updateEmployee, deleteEmployee, invalidateEmployees } = useEmployees();

    const handleUpdate = async (id: string, data: Partial<EmployeeForm>) => {
        try {
            await updateEmployee({ id, data });
            // Query is automatically invalidated and refetched
        } catch (error) {
            console.error("Update failed:", error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteEmployee(id);
            // Query is automatically invalidated and refetched
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    // Or manually invalidate if needed
    const handleManualInvalidate = () => {
        invalidateEmployees();
    };
}

// Example: Update Product
function ProductComponent() {
    const { updateProduct, deleteProduct, invalidateProducts } = useProducts();

    const handleUpdate = async (id: string, data: Partial<ProductRow>) => {
        try {
            await updateProduct({ id, data });
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
}
```

## Automatic Cache Invalidation

React Query automatically invalidates and refetches data after mutations:

- ✅ **Create**: `handleAddEmployee` automatically invalidates the cache
- ✅ **Update**: `updateEmployee` / `updateProduct` automatically invalidates
- ✅ **Delete**: `deleteEmployee` / `deleteProduct` automatically invalidates

## Manual Refetch

You can still manually refetch using the `fetchEmployees` / `fetchProducts` functions:

```tsx
const { fetchEmployees } = useEmployees();

// After a bulk operation or external update
await fetchEmployees();
```

## Query Keys

Query keys are exported for advanced usage:

```tsx
import { employeeKeys, productKeys } from "@/hooks/useEmployees";
import { productKeys } from "@/hooks/useProducts";
import { useQueryClient } from "@tanstack/react-query";

function CustomComponent() {
    const queryClient = useQueryClient();

    // Manually invalidate
    queryClient.invalidateQueries({ queryKey: employeeKeys.list() });
    queryClient.invalidateQueries({ queryKey: productKeys.list() });

    // Prefetch data
    queryClient.prefetchQuery({
        queryKey: employeeKeys.list(),
        queryFn: fetchEmployees,
    });
}
```

## Error Handling

The hooks expose error states:

```tsx
const { error, loading } = useEmployees();

if (error) {
    return <div>Error: {error.message}</div>;
}
```

## Backward Compatibility

All existing code continues to work without changes:

- ✅ `fetchEmployees()` / `fetchProducts()` still work
- ✅ `handleAddEmployee()` still works
- ✅ All filter states and setters remain the same
- ✅ Loading states are preserved

## Benefits

1. **Automatic Caching**: Data is cached and shared across components
2. **Background Refetching**: Stale data is automatically refreshed
3. **Optimistic Updates**: Can be added for better UX
4. **Request Deduplication**: Multiple components using the same query share one request
5. **Error States**: Built-in error handling and retry logic




