import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  Product,
  ProductCategory,
  ProductResponse,
  ProductSearchResult,
  ProductDetailResponse,
  ProductVariantDTO,
  ProductCreateUpdateDTO,
  ProductDetailDTO,
  StockDetailDTO,
  SizeDTO
} from '../shared/models/product.model';
import { ApiResponse } from '../shared/models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://clothing-store-api-2-krg7.onrender.com/api/product';
  private searchUrl = 'https://clothing-store-api-2-krg7.onrender.com/api/product/search';
  private detailUrl = 'https://clothing-store-api-2-krg7.onrender.com/api/product/detail';
  private adminUrl ="https://clothing-store-api-2-krg7.onrender.com/api/admin/upload"
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHomeProducts(): Observable<any> {
    return this.http.get<any>(this.baseUrl).pipe(
      map(res => {
        const data = res.data;
        return Object.keys(data).map(categoryName => ({
          category: categoryName,
          products: data[categoryName].map((item: any) => this.mapApiProductToProduct(item))
        }));
      })
    );
  }

  uploadFiles(files: FormData): Observable<any> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    return this.http.post(this.adminUrl, formData);
  }

  getProductsByCategory(slug: string): Observable<ProductCategory[]> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/category/${slug}`).pipe(
      map(res => {
        const data = res.data;
        return Object.keys(data).map(categoryName => ({
          category: categoryName,
          products: data[categoryName].map((item: any) => this.mapApiProductToProduct(item))
        }));
      })
    );
  }

  searchProducts(productName: string): Observable<ProductSearchResult> {
    const params = new HttpParams().set('productName', productName.trim());
    const headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json');

    return this.http.get<any>(`${this.searchUrl}`, { headers, params }).pipe(
      map(response => {
        const productsRaw = response.data?.products;
        const products = Array.isArray(productsRaw)
          ? productsRaw.map((item: any) => this.mapApiProductToProduct(item))
          : [];
        const total = response.data?.total || products.length;
        const message = response.message || '';
        return { products, total, message };
      })
    );
  }



  private mapApiProductToProduct(apiProduct: any): Product {
    return {
      id: apiProduct.id,
      productName: apiProduct.productName,
      price: apiProduct.price,
      slug: apiProduct.slug,
      discount: apiProduct.discount,
      status: apiProduct.status,
      img: apiProduct.img,
      stockDetails: apiProduct.stockDetails ? apiProduct.stockDetails.map((detail: any) => ({
        color: detail.color,
        img: detail.img,
        sizes: detail.sizes ? detail.sizes.map((size: any) => ({
          size: size.size,
          stock: size.stock
        })) : []
      })) : [],
      isFavorite: apiProduct.isFavorite
    };
  }

  /**
   * Fetches product details by slug.
   * @param slug The product slug.
   * @returns Observable of ProductDetailResponse.
   */
  getProductDetail(slug: string): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.detailUrl}/${slug}`).pipe(
      map(response => ({
        code: response.code,
        message: response.message,
        data: {
          productDetails: this.mapApiProductToProduct(response.data.productDetails),
          relatedProducts: response.data.relatedProducts.map((product: any) =>
            this.mapApiProductToProduct(product)
          )
        }
      }))
    );
  }

  getProducts(): Observable<ProductDetailDTO[]> {
    return this.http.get<ProductDetailDTO[]>(`${this.apiUrl}/products`);
  }
  addProduct(product: ProductCreateUpdateDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/product`, product);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/${id}`);
  }

  updateProduct(id: number, product: ProductCreateUpdateDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/product/${id}`, product);
  }
}
