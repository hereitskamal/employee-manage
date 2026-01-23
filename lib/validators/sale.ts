import { z } from "zod";

/**
 * Sale Product Schema
 * Validates individual product in a sale
 */
const saleProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  subtotal: z.coerce.number().min(0, "Subtotal must be non-negative").optional(),
});

/**
 * Sale Create Schema
 * Validates all required fields for creating a new sale
 */
export const saleCreateSchema = z.object({
  products: z
    .array(saleProductSchema)
    .min(1, "At least one product is required"),
  soldBy: z.string().min(1, "Sold by (employee ID) is required").optional(),
  saleDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).default("completed"),
});

/**
 * Sale Update Schema
 * All fields are optional for partial updates
 */
export const saleUpdateSchema = z.object({
  products: z
    .array(saleProductSchema)
    .min(1, "At least one product is required")
    .optional(),
  soldBy: z.string().min(1, "Sold by (employee ID) is required").optional(),
  saleDate: z.union([z.string(), z.date()]).transform((val) => new Date(val)).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).optional(),
});

// Type exports for TypeScript inference
export type SaleCreateInput = z.infer<typeof saleCreateSchema>;
export type SaleUpdateInput = z.infer<typeof saleUpdateSchema>;
export type SaleProductInput = z.infer<typeof saleProductSchema>;

