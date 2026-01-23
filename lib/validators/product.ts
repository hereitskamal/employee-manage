import { z } from "zod";

/**
 * Product Create Schema
 * Validates all required fields for creating a new product
 */
export const productCreateSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  category: z.string().min(1, "Category is required").trim(),
  brand: z.string().min(1, "Brand is required").trim(),
  modelNo: z.string().min(1, "Model number is required").trim(),
  modelYear: z.coerce.number().int().min(1900).max(2100).optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  purchaseRate: z.coerce.number().min(0, "Purchase rate must be non-negative").optional(),
  distributorRate: z.coerce.number().min(0, "Distributor rate must be non-negative").optional(),
  minSaleRate: z.coerce.number().min(0, "Minimum sale rate must be non-negative"),
  tagRate: z.coerce.number().min(0, "Tag rate must be non-negative").optional(),
  starRating: z.coerce.number().min(0).max(5, "Star rating must be between 0 and 5").optional(),
  criticalSellScore: z.coerce.number().int().min(0).max(10, "Critical sell score must be between 0 and 10").optional(),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative"),
});

/**
 * Product Update Schema
 * All fields are optional for partial updates
 */
export const productUpdateSchema = z.object({
  name: z.string().min(1, "Name cannot be empty").trim().optional(),
  category: z.string().min(1, "Category cannot be empty").trim().optional(),
  brand: z.string().min(1, "Brand cannot be empty").trim().optional(),
  modelNo: z.string().min(1, "Model number cannot be empty").trim().optional(),
  modelYear: z.coerce.number().int().min(1900).max(2100).optional(),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  purchaseRate: z.coerce.number().min(0, "Purchase rate must be non-negative").optional(),
  distributorRate: z.coerce.number().min(0, "Distributor rate must be non-negative").optional(),
  minSaleRate: z.coerce.number().min(0, "Minimum sale rate must be non-negative").optional(),
  tagRate: z.coerce.number().min(0, "Tag rate must be non-negative").optional(),
  starRating: z.coerce.number().min(0).max(5, "Star rating must be between 0 and 5").optional(),
  criticalSellScore: z.coerce.number().int().min(0).max(10, "Critical sell score must be between 0 and 10").optional(),
  stock: z.coerce.number().int().min(0, "Stock must be non-negative").optional(),
});

// Type exports for TypeScript inference
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

