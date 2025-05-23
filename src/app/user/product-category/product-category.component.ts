import { Component } from '@angular/core';
import {  ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { ActivatedRoute } from '@angular/router';
import { ProductCategory } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-category',
  imports: [CommonModule, ProductBoxComponent],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css'
})
export class ProductCategoryComponent {
  allCategories: ProductCategory[] = [];
  visibleCategories: ProductCategory[] = [];
  maxVisibleItems = 4;
  step = 4;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const categoryId = +params['categoryId'];
      if (categoryId) {
        this.loadProduct(categoryId);
      }
    });
  }
  loadProduct(categoryId: number): void {
  this.productService.getProductsByCategory(categoryId).subscribe((categories: ProductCategory[]) => {
    this.allCategories = categories;
    this.updateVisibleCategories();
  });
  }
  loadMore(): void {
    this.maxVisibleItems += this.step;
    this.updateVisibleCategories();
  }

  private updateVisibleCategories(): void {
    this.visibleCategories = this.allCategories.slice(0, this.maxVisibleItems);
  }

  hasMore(): boolean {
    return this.visibleCategories.length < this.allCategories.length;
  }
}
