import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {Product, StockDetail} from '../shared/models/product.model';

export interface DashboardDataRaw {
  totalIncome: number;
  totalOrder: number;
  topProductsByParentCategory: { [key: string]: any[] };
  revenueChart: { date: string; total: number }[];
}

export interface DashboardData {
  totalIncome: number;
  totalOrder: number;
  topProductsByParentCategory: { category: string; products: Product[] }[];
  revenueChart: { date: string; total: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = 'https://clothing-store-api-7ieq.onrender.com/api/admin/dashboard';

  constructor(private http: HttpClient) {}


  private mapApiProductToProduct(item: any): Product {
    return {
      id: item.id,
      productName: item.productName,
      price: item.price,
      slug: item.slug,
      discount: item.discount,
      status: item.status,
      img: item.img,
      stockDetails: item.stockDetails,
      isFavorite: item.isFavorite
    };
  }

  getDashboardData(): Observable<DashboardData> {
    return this.http.get<{ code: number; message: string; data: DashboardDataRaw }>(this.baseUrl).pipe(
      map(res => {
        const rawData = res.data;

        const topProductsByParentCategory = Object.keys(rawData.topProductsByParentCategory || {}).map(categoryName => ({
          category: categoryName,
          products: rawData.topProductsByParentCategory[categoryName].map(item =>
            this.mapApiProductToProduct(item)
          )
        }));

        return {
          totalIncome: rawData.totalIncome,
          totalOrder: rawData.totalOrder,
          topProductsByParentCategory,
          revenueChart: rawData.revenueChart,
        };
      })
    );
  }

}
