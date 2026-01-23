// hooks/useProducts.ts
"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductRow } from "@/types/product";

// Query keys
export const productKeys = {
    all: ["products"] as const,
    lists: () => [...productKeys.all, "list"] as const,
    list: () => [...productKeys.lists()] as const,
};

// Fetch function
const fetchProducts = async (): Promise<ProductRow[]> => {
    const res = await fetch("/api/products");
    if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to fetch products", errorText);
        throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const data = await res.json();
    // Handle both array and object response formats
    if (Array.isArray(data)) {
        return data;
    } else if (data.success && Array.isArray(data.products)) {
        return data.products;
    } else if (data.success && Array.isArray(data.data)) {
        return data.data;
    }
    return [];
};

// Create function
const createProduct = async (newProduct: Partial<ProductRow>): Promise<void> => {
    const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProduct),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to create product" }));
        throw new Error(errorData.message || "Failed to create product");
    }
};

// Update function
const updateProduct = async ({ id, data }: { id: string; data: Partial<ProductRow> }): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to update product" }));
        throw new Error(errorData.message || "Failed to update product");
    }
};

// Delete function
const deleteProduct = async (id: string): Promise<void> => {
    const res = await fetch(`/api/products/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Failed to delete product" }));
        throw new Error(errorData.message || "Failed to delete product");
    }
};

export function useProducts() {
    const queryClient = useQueryClient();
    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");

    // Query for fetching products
    const {
        data: products = [],
        isLoading,
        isError,
        error,
        refetch: refetchProducts,
    } = useQuery({
        queryKey: productKeys.list(),
        queryFn: fetchProducts,
    });

    // Mutation for creating product
    const createMutation = useMutation({
        mutationFn: createProduct,
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.list() });
        },
    });

    // Mutation for updating product
    const updateMutation = useMutation({
        mutationFn: updateProduct,
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.list() });
        },
    });

    // Mutation for deleting product
    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            // Invalidate and refetch products list
            queryClient.invalidateQueries({ queryKey: productKeys.list() });
        },
    });

    // Derived data
    const categories = useMemo(
        () =>
            Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
        [products]
    );

    const brands = useMemo(
        () =>
            Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
        [products]
    );

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const text = searchText.toLowerCase();
            const matchesText =
                !text ||
                p.name.toLowerCase().includes(text) ||
                (p.brand ?? "").toLowerCase().includes(text) ||
                (p.modelNo ?? "").toLowerCase().includes(text);

            const matchesCategory =
                !categoryFilter || p.category === categoryFilter;

            const matchesBrand = !brandFilter || p.brand === brandFilter;

            return matchesText && matchesCategory && matchesBrand;
        });
    }, [products, searchText, categoryFilter, brandFilter]);

    // Fetch products handler (backward compatible)
    const fetchProductsHandler = async () => {
        await refetchProducts();
    };

    // Loading state combines query loading and mutation loading
    const loading = isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

    return {
        products,
        filteredProducts,
        categories,
        brands,
        loading,
        searchText,
        categoryFilter,
        brandFilter,
        setSearchText,
        setCategoryFilter,
        setBrandFilter,
        fetchProducts: fetchProductsHandler,
        // Additional React Query states for advanced usage
        error: isError ? error : null,
        isRefetching: false, // Can be exposed if needed
        // Mutation helpers for update/delete (optional, for advanced usage)
        updateProduct: updateMutation.mutateAsync,
        deleteProduct: deleteMutation.mutateAsync,
        invalidateProducts: () => queryClient.invalidateQueries({ queryKey: productKeys.list() }),
    };
}
