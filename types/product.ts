// /types/product.ts
export interface ProductRow {
  _id?: string;
  id?: string;

  // core (required fields match IProduct model)
  name: string;
  brand: string;
  category: string;
  modelNo: string;
  modelYear?: number;
  image?: string;
  description?: string;

  // pricing & rates
  purchaseRate?: number;
  distributorRate?: number;
  minSaleRate: number; // required in model
  tagRate?: number;

  // inventory / metrics
  stock: number; // required in model
  starRating?: number;
  criticalSellScore?: number;

  // meta
  createdBy?: { _id?: string; name?: string; email?: string } | string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;

  // Allow additional properties for flexibility (e.g., from MongoDB populate)
  [key: string]: unknown;
}
