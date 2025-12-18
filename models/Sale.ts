// models/Sale.ts
import mongoose, { Schema, models } from "mongoose";

export interface ISaleProduct {
  productId: mongoose.Types.ObjectId;
  quantity: number;
  price: number; // sale price per unit
  subtotal: number; // quantity * price
}

export interface ISale extends mongoose.Document {
  products: ISaleProduct[];
  totalAmount: number;
  soldBy: mongoose.Types.ObjectId; // employee who made the sale
  saleDate: Date;
  status: "completed" | "pending" | "cancelled";
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleProductSchema = new Schema<ISaleProduct>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const SaleSchema = new Schema<ISale>(
  {
    products: {
      type: [SaleProductSchema],
      required: true,
      validate: {
        validator: (products: ISaleProduct[]) => products.length > 0,
        message: "At least one product is required",
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "completed",
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
SaleSchema.index({ saleDate: -1 });
SaleSchema.index({ soldBy: 1 });
SaleSchema.index({ status: 1 });
SaleSchema.index({ "products.productId": 1 });

export const Sale = models.Sale || mongoose.model<ISale>("Sale", SaleSchema);

