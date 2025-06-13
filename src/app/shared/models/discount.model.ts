import { ApiResponse } from './api-response.model';

export interface Discount {
  id : number
  productId: number;
  discountPercent : number;
  startSale: string;
  endSale: string;
}

export type DiscountResponse<T> = ApiResponse<T>;
