"use client";

import React, { useEffect, useState } from "react";
import {
  Drawer,
  Typography,
  Divider,
  Box,
  IconButton,
  CircularProgress,
  Button,
  Avatar,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import StarRateIcon from "@mui/icons-material/StarRate";
import DescriptionIcon from "@mui/icons-material/Description";
import type { ProductRow } from "@/types/product";

interface ProductDrawerProps {
  id: string | null;
  onClose: () => void;
  onDeleteSuccess?: () => void;
}

export default function ProductDrawer({
  id,
  onClose,
  onDeleteSuccess,
}: ProductDrawerProps) {
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Helpers
  const formatCurrency = (v?: number) =>
    v != null ? `₹${Number(v).toLocaleString()}` : "-";

  const formatDate = (value?: string | Date) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Fetch product when id changes
  useEffect(() => {
    if (!id) {
      setProduct(null);
      return;
    }
    let mounted = true;
    async function fetchProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        if (!mounted) return;
        setProduct(data);
      } catch (err) {
        console.error("Product fetch failed", err);
        setProduct(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      mounted = false;
    };
  }, [id]);

  // Delete flow (with confirmation dialog)
  const handleDelete = async () => {
    if (!product) return;
    const productId = (product as any)._id ?? (product as any).id;
    if (!productId) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        let message = "Failed to delete product";
        try {
          const data = await res.json();
          if (data?.message) message = data.message;
        } catch {
          // ignore
        }
        alert(message);
        return;
      }

      onDeleteSuccess?.();
      setConfirmOpen(false);
      onClose();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Something went wrong while deleting the product. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={!!id}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 380,
            p: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: "#f5f6fa",
          },
        }}
      >
        {/* Top bar */}
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            bgcolor: "white",
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Product Details
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 2, flex: 1, overflowY: "auto" }}>
          {loading && (
            <Box display="flex" justifyContent="center" mt={5}>
              <CircularProgress />
            </Box>
          )}

          {!loading && product && (
            <>
              {/* Header card */}
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ width: 56, height: 56 }}>
                    {getInitials(product.name)}
                  </Avatar>

                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={700}>
                      {product.name}
                    </Typography>
                    <Stack direction="row" spacing={1} mt={0.5} flexWrap="wrap">
                      {product.brand && (
                        <Chip
                          size="small"
                          icon={<CategoryIcon fontSize="small" />}
                          label={product.brand}
                          sx={{ borderRadius: "999px" }}
                        />
                      )}

                      {product.category && (
                        <Chip
                          size="small"
                          label={product.category}
                          variant="outlined"
                          sx={{ borderRadius: "999px" }}
                        />
                      )}
                    </Stack>

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                      Model: {product.modelNo ?? "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Rates & stock */}
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Pricing & Stock
                </Typography>

                <InfoRow
                  icon={<MonetizationOnIcon fontSize="small" />}
                  label="Purchase"
                  value={formatCurrency(product.purchaseRate)}
                />
                <InfoRow
                  icon={<MonetizationOnIcon fontSize="small" />}
                  label="Distributor"
                  value={formatCurrency(product.distributorRate)}
                />
                <InfoRow
                  icon={<MonetizationOnIcon fontSize="small" />}
                  label="Min Sale"
                  value={formatCurrency(product.minSaleRate)}
                />
                <InfoRow
                  icon={<MonetizationOnIcon fontSize="small" />}
                  label="Tag Rate"
                  value={formatCurrency(product.tagRate)}
                />
                <InfoRow
                  icon={<Inventory2Icon fontSize="small" />}
                  label="Stock"
                  value={product.stock ?? "-"}
                />
              </Box>

              {/* More metrics */}
              <Box
                sx={{
                  p: 2,
                  mb: 2,
                  borderRadius: 2,
                  bgcolor: "white",
                }}
              >
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Metrics
                </Typography>

                <InfoRow
                  icon={<CalendarTodayIcon fontSize="small" />}
                  label="Year"
                  value={product.modelYear ?? "-"}
                />
                <InfoRow
                  icon={<StarRateIcon fontSize="small" />}
                  label="Rating"
                  value={product.starRating ?? "-"}
                />
                <InfoRow
                  icon={<Inventory2Icon fontSize="small" />}
                  label="Critical Score"
                  value={product.criticalSellScore ?? "-"}
                />
              </Box>

              {/* Description */}
              {product.description && (
                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "white",
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Description
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Box sx={{ color: "text.secondary", mt: 0.25 }}>
                      <DescriptionIcon fontSize="small" />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {product.description}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          )}

          {!loading && !product && (
            <Box mt={4}>
              <Typography color="text.secondary">No details available.</Typography>
            </Box>
          )}
        </Box>

        {/* Footer actions */}
        {!loading && product && (
          <Box sx={{ p: 2, bgcolor: "white" }}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              {/* <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => {
                  const productId = (product as any)._id ?? (product as any).id;
                  if (productId) window.location.href = `/dashboard/products/edit/${productId}`;
                }}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Edit
              </Button> */}

              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmOpen(true)}
                sx={{ textTransform: "none", borderRadius: 2 }}
              >
                Delete Product
              </Button>
            </Stack>
          </Box>
        )}
      </Drawer>

      {/* Confirm delete dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Delete product?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to permanently delete this product? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

/* Small InfoRow - same pattern used in EmployeeDrawer */
interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
}

function InfoRow({ label, value, icon }: InfoRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        py: 0.6,
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        {icon && <Box sx={{ color: "text.secondary" }}>{icon}</Box>}
        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 90 }}>
          {label}
        </Typography>
      </Stack>

      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: "right", ml: 2 }}>
        {value}
      </Typography>
    </Box>
  );
}
