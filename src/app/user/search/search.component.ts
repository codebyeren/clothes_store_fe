import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { ProductService } from '../../services/product.service';
import { Product, ProductSearchResult } from '../../shared/models/product.model';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ProductBoxComponent],
  template: `
    <div class="search-container">
      <div class="search-header">
        <h1 class="search-title">Kết quả tìm kiếm</h1>
        <div class="search-stats" *ngIf="searchResult?.total !== undefined">
          <p>Tìm thấy {{ searchResult?.total || 0 }} sản phẩm</p>
        </div>
      </div>

      <div class="search-form">
        <input 
          type="text" 
          [(ngModel)]="searchQuery" 
          (keyup.enter)="onSearch()"
          placeholder="Nhập tên sản phẩm cần tìm..."
          class="search-input">
        <button (click)="onSearch()" class="search-button">
          Tìm kiếm
        </button>
      </div>

      <div class="products-grid" *ngIf="searchResult?.products?.length">
        <app-product-box 
          *ngFor="let product of searchResult?.products" 
          [product]="product">
        </app-product-box>
      </div>

      <div *ngIf="!searchResult?.products?.length" class="no-results">
        <p>Không tìm thấy sản phẩm nào phù hợp với từ khóa "{{ searchQuery }}"</p>
      </div>
    </div>
  `,
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
  searchQuery: string = '';
  searchResult: ProductSearchResult | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const query = params['q'];
      if (query) {
        this.searchQuery = query;
        this.onSearch();
      }
    });
  }

  onSearch(): void {
    if (!this.searchQuery.trim()) return;

    this.productService.searchProducts(this.searchQuery).subscribe({
      next: (result) => {
        this.searchResult = result;
      },
      error: (error) => {
        console.error('Error searching products:', error);
      }
    });
  }
} 