// models/Product.ts
import mongoose, { Schema, models } from "mongoose";

export interface IProduct extends mongoose.Document {
  name: string;
  category: string;      // e.g. "TV", "AC", "Refrigerator"
  brand: string;
  modelNo: string;
  modelYear?: number;

  image?: string;

  // pricing
  purchaseRate?: number;     // visible only to admin/manager
  distributorRate?: number;  // visible only to admin/manager
  minSaleRate: number;       // base rate visible to everyone
  tagRate?: number;          // MRP / label rate

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

export const Product =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);
