// hooks/useProducts.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductRow } from "@/types/product";

export function useProducts() {
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(false);

    const [searchText, setSearchText] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/products");
            if (!res.ok) {
                console.error("Failed to fetch products", await res.text());
                return;
            }
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Failed to fetch products:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

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
        fetchProducts,
    };
}
