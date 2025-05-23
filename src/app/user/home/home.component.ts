import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { ProductService } from '../../services/product.service';
import { ProductCategory } from '../../shared/models/product.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ProductBoxComponent],
  template: `
    <div class="home-container">
      <section *ngFor="let category of categories" class="category-section">
        <div class="category-header">
          <h2 class="category-title">{{ category.category }}</h2>
          <a [routerLink]="['/category', category.category]" class="view-all">Xem tất cả</a>
        </div>
        <div class="products-grid">
          <app-product-box 
            *ngFor="let product of category.products" 
            [product]="product">
          </app-product-box>
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  categories: ProductCategory[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getHomeProducts().subscribe({
      next: (data) => {
        this.categories = data;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }
} 