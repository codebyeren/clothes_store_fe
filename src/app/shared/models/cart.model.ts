import { ApiResponse } from './api-response.model';

export interface CartItemDTO {
  productId: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  stock: number;
  imageUrl: string;
  discountPercent: number;
  price: string;
  slug: string;
}

export type CartResponse = ApiResponse<CartItemDTO[]>; 