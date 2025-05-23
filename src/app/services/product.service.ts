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
  ProductDetailResponse 
} from '../shared/models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/product';
  private searchUrl = 'http://localhost:8080/api/product/search';
  private detailUrl = 'http://localhost:8080/api/product/detail';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getHomeProducts(): Observable<ProductCategory[]> {
    return this.http.get<ProductResponse>(this.baseUrl).pipe(
      map(res => {
        const data = res.data;
        return Object.keys(data).map(categoryName => ({
          category: categoryName,
          products: data[categoryName].map((item: any) => this.mapApiProductToProduct(item))
        }));
      })
    );
  }

  getProductsByCategory(categoryId: number): Observable<ProductCategory[]> {
    return this.http.get<ProductResponse>(`${this.baseUrl}/category/${categoryId}`).pipe(
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
    const params = new HttpParams()
      .set('productName', productName.trim());
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

  getProductById(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.detailUrl}/${id}`).pipe(
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

  getProductDetail(id: number): Observable<ProductDetailResponse> {
    return this.http.get<ProductDetailResponse>(`${this.detailUrl}/${id}`).pipe(
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
}
