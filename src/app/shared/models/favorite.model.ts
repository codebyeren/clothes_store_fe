import { ApiResponse } from './api-response.model';

export interface FavoriteProductDTO {
  id: number;
  productName: string;
  price: number; // Changed to number based on API response
  discount: number; // Changed to number based on API response
  status: string;
  img: string;
  stockDetails: any[]; // Simplified type based on API response structure
  isFavorite: boolean;
  slug: string;
}

export type FavoriteResponse<T> = ApiResponse<T>; 