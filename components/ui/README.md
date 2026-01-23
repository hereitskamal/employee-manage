# UI State Components

Reusable components for standardized loading, empty, and error states across the application.

## Components

### LoadingState

Displays a centered loading spinner with optional message.

```tsx
import LoadingState from "@/components/ui/LoadingState";

<LoadingState message="Loading data..." />
```

**Props:**
- `message?: string` - Optional loading message (default: "Loading...")
- `size?: number` - Spinner size in pixels (default: 40)

---

### EmptyState

Displays when there's no data to show.

```tsx
import EmptyState from "@/components/ui/EmptyState";

<EmptyState
    title="No items found"
    message="There are no items to display."
    actionLabel="Add Item"
    onAction={() => handleAdd()}
/>
```

**Props:**
- `title?: string` - Title text (default: "No data found")
- `message?: string` - Description text (default: "There are no items to display.")
- `actionLabel?: string` - Optional button label
- `onAction?: () => void` - Optional button click handler

---

### ErrorState

Displays when an error occurs during data fetching.

```tsx
import ErrorState from "@/components/ui/ErrorState";

<ErrorState
    title="Something went wrong"
    message="Failed to load data"
    error={error}
    onRetry={() => refetch()}
    retryLabel="Try again"
/>
```

**Props:**
- `title?: string` - Error title (default: "Something went wrong")
- `message?: string` - Custom error message
- `error?: Error | null` - Error object (message will be extracted if provided)
- `onRetry?: () => void` - Optional retry button handler
- `retryLabel?: string` - Retry button label (default: "Try again")

---

## Example Usage

### Complete Example with Conditional Rendering

```tsx
"use client";

import { Box } from "@mui/material";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeTable from "@/components/employees/EmployeeTable";

export default function EmployeesPage() {
    const { 
        filteredEmployees, 
        loading, 
        error, 
        fetchEmployees 
    } = useEmployees();

    return (
        <Box sx={{ width: "100%" }}>
            {error ? (
                <ErrorState
                    message={error.message}
                    onRetry={fetchEmployees}
                />
            ) : loading ? (
                <LoadingState message="Loading employees..." />
            ) : filteredEmployees.length === 0 ? (
                <EmptyState
                    title="No employees found"
                    message="Get started by adding your first employee."
                    actionLabel="Add Employee"
                    onAction={() => setModalOpen(true)}
                />
            ) : (
                <EmployeeTable rows={filteredEmployees} />
            )}
        </Box>
    );
}
```

---

## Design Notes

- Uses Material UI components with Tailwind CSS classes
- Minimal, clean design
- Consistent spacing and typography
- Accessible with proper ARIA labels
- Responsive layout




