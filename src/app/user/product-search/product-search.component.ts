import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule, NgFor } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Product, ProductSearchResult } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [ProductBoxComponent, CommonModule, RouterModule],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {
  products: Product[] = [];
  total: number = 0;
  message: string = '';
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const productName = params['productName']?.trim() || '';
      this.searchProducts(productName);
    });
  }

  search(productName: string): void {
    if (!productName?.trim()) {
      this.products = [];
      this.total = 0;
      this.message = 'Vui lòng nhập từ khóa tìm kiếm';
      this.cdr.markForCheck();
      return;
    }
    this.router.navigate(['/product/search'], { queryParams: { productName: productName.trim() } });
  }

  private searchProducts(productName: string): void {
    if (!productName) {
      this.products = [];
      this.total = 0;
      this.message = 'Vui lòng nhập từ khóa tìm kiếm';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.cdr.markForCheck();

    this.productService.searchProducts(productName).subscribe({
      next: (result: ProductSearchResult) => {
        this.products = result.products || [];
        this.total = result.total || 0;
        this.message = result.message || (this.products.length === 0 ? 'Không tìm thấy sản phẩm phù hợp' : '');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.products = [];
        this.total = 0;
        this.message = 'Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }
}