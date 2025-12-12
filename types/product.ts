// /types/product.ts
export interface ProductRow {
  _id?: string;
  id?: string;

  // core
  name: string;
  brand?: string;
  category?: string;
  modelNo?: string;
  modelYear?: number;
  image?: string;
  description?: string;

  // pricing & rates
  purchaseRate?: number;
  distributorRate?: number;
  minSaleRate?: number;
  tagRate?: number;

  // inventory / metrics
  stock?: number;
  starRating?: number;
  criticalSellScore?: number;

  // meta
  createdBy?: { _id?: string; name?: string; email?: string } | string;
  updatedBy?: string;

  [key: string]: any;
}
