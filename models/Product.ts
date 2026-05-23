// models/Product.ts
import mongoose, { Schema, models } from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  category: string;      // e.g. "TV", "AC", "Refrigerator"
  brand: string;
  modelNo: string;
  modelYear?: number;

  // e-commerce fields
  slug?: string;         // SEO-friendly URL
  description?: string;  // Long product description
  images?: string[];     // Multiple product images
  sku?: string;          // Stock keeping unit
  isActive?: boolean;    // Product visibility flag
  weight?: number;       // For shipping calculations
  dimensions?: {        // Product dimensions
    length?: number;
    width?: number;
    height?: number;
    unit?: string; // "cm", "inch", etc.
  };

  image?: string;        // Legacy single image field

  // pricing
  purchaseRate?: number;     // visible only to admin/manager
  distributorRate?: number;  // visible only to admin/manager
  minSaleRate: number;       // base rate visible to everyone
  tagRate?: number;          // MRP / label rate

  // category-specific specs (e.g. { Ton: "1.5", Star: "3", Type: "Inverter Split" })
  attributes?: Record<string, string | number>;

  // ratings & stock
  starRating?: number;           // 1–5 star rating
  criticalSellScore?: number;    // "critical to sell fast" rating 1–10
  stock: number;

  // tracking
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      // you can restrict domain later with enum: [...]
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    modelNo: {
      type: String,
      required: true,
      trim: true,
    },
    modelYear: {
      type: Number,
    },

    // e-commerce fields
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
    description: {
      type: String,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    sku: {
      type: String,
      trim: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      min: 0,
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      unit: { type: String, default: "cm" },
    },

    image: {
      type: String,
    },

    // pricing
    purchaseRate: {
      type: Number,
      min: 0,
    },
    distributorRate: {
      type: Number,
      min: 0,
    },
    minSaleRate: {
      type: Number,
      required: true,
      min: 0,
    },
    tagRate: {
      type: Number,
      min: 0,
    },

    attributes: {
      type: Schema.Types.Mixed,
      default: {},
    },

    // ratings & stock
    starRating: {
      type: Number,
      min: 0,
      max: 5,
    },
    criticalSellScore: {
      type: Number, // e.g. 1–10 urgency rating
      min: 0,
      max: 10,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// Indexes for query optimization
// Compound index: category + brand
// Why: Optimizes filtering by category and brand, commonly used together in product listings.
// Used in: Product filters (useProducts hook), product search and filtering UI
// Direction: Both ascending (1) for equality and range queries on category/brand combinations
ProductSchema.index({ category: 1, brand: 1 });
ProductSchema.index({ slug: 1 }, { unique: true, sparse: true });
ProductSchema.index({ isActive: 1, category: 1 }); // For public catalog filtering
ProductSchema.index({ sku: 1 }, { unique: true, sparse: true });

export const Product =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);
