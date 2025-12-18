// types/sale.ts
import mongoose from "mongoose";

export interface SaleProduct {
  productId: mongoose.Types.ObjectId | string;
  productName?: string; // populated field
  quantity: number;
  price: number; // sale price per unit
  subtotal: number; // quantity * price
}

export interface SaleRow {
  _id?: string;
  id?: string;
  products: SaleProduct[];
  totalAmount: number;
  soldBy: mongoose.Types.ObjectId | string | { _id?: string; name?: string; email?: string };
  saleDate: Date | string;
  status: "completed" | "pending" | "cancelled";
  createdAt?: Date | string;
  updatedAt?: Date | string;
  createdBy?: mongoose.Types.ObjectId | string;
  updatedBy?: mongoose.Types.ObjectId | string;
}

export type SaleForm = Omit<SaleRow, "_id" | "id" | "createdAt" | "updatedAt">;

