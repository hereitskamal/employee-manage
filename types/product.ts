// types/product.ts
export interface ProductRow {
    _id: string;
    name: string;
    category: string;
    brand: string;
    modelNo: string;
    modelYear?: number;
    image?: string;
    purchaseRate?: number;
    distributorRate?: number;
    minSaleRate: number;
    tagRate?: number;
    starRating?: number;
    criticalSellScore?: number;
    stock: number;
    createdAt?: string;
    updatedAt?: string;
}
