import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

// Các interface dùng trong service
export interface ProductVariantDTO {
  color: string;
  img: string;
  sizes: {
    size: string;
    stock: number;
  }[];
}

export interface ProductCreateUpdateDTO {
  productName: string;
  price: number;
  status: string; // ví dụ: 'ACTIVE'
  categoryIds: number[];
  imgMain: string;
  variants: ProductVariantDTO[];
}

export interface ProductDetailDTO {
  id: number;
  slug: string;
  name: string;
  description: string;
  price: number;
  discountPercent: number;
  imageUrl: string;
  stockDetails: StockDetailDTO[];
}

export interface StockDetailDTO {
  color: string;
  sizes: SizeDTO[];
}

export interface SizeDTO {
  size: string;
  quantity: number;
}

// Các interface khác có thể giữ nguyên hoặc điều chỉnh tùy backend

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'http://localhost:8080/api/product';
  private searchUrl = 'http://localhost:8080/api/product/search';
  private detailUrl = 'http://localhost:8080/api/product/detail';
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

  getProductsByCategory(slug: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/category/${slug}`).pipe(
      map(res => {
        const data = res.data;
        return Object.keys(data).map(categoryName => ({
          category: categoryName,
          products: data[categoryName].map((item: any) => this.mapApiProductToProduct(item))
        }));
      })
    );
  }

  searchProducts(productName: string): Observable<any> {
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

  private mapApiProductToProduct(apiProduct: any): any {
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

  getProductById(slug: string): Observable<any> {
    return this.http.get<any>(`${this.detailUrl}/${slug}`).pipe(
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

  getProductDetail(slug: string): Observable<any> {
    return this.http.get<any>(`${this.detailUrl}/${slug}`).pipe(
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

  getProductBySlug(slug: string): Observable<ProductDetailDTO> {
    return this.http.get<ProductDetailDTO>(`${this.detailUrl}/${slug}`);
  }

  // Thêm sản phẩm mới
  addProduct(product: ProductCreateUpdateDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/product`, product);
  }
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/${id}`);
  }
  // Cập nhật sản phẩm theo slug
  updateProduct(id: number, product: ProductCreateUpdateDTO): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/product/${id}`, product);
  }
}
