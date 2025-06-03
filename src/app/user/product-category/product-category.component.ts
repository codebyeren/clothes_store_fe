import { Component } from '@angular/core';
import {  ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { ActivatedRoute } from '@angular/router';
import { ProductCategory } from '../../shared/models/product.model';

interface ExtendedProductCategory extends ProductCategory {
  slideOffset: number;
}

@Component({
  selector: 'app-product-category',
  imports: [CommonModule, ProductBoxComponent],
  templateUrl: './product-category.component.html',
  styleUrl: './product-category.component.css'
})
export class ProductCategoryComponent {
  allCategories: ExtendedProductCategory[] = [];
  visibleCategories: ExtendedProductCategory[] = [];
  slideStep = 300;
  categoryDad: string = '';
  
  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let categoryDad = '';
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
      switch (slug) {
        case "do-nam":
          categoryDad = 'Đồ Nam';
          break;
        case "do-nu":
          categoryDad = 'Đồ Nữ';
          break;
        case "do-be-trai":
          categoryDad = 'Đồ Bé Trai';
          break;
        case "do-be-gai":
          categoryDad = 'Đồ Bé Gái';
          break;
        default:
          categoryDad = '';
      }
      this.categoryDad = categoryDad;
    });
  }

  loadProduct(slug: string): void {
    this.productService.getProductsByCategory(slug).subscribe((categories: ProductCategory[]) => {
      this.allCategories = categories.map(category => ({
        ...category,
        slideOffset: 0
      }));
      this.updateVisibleCategories();
    });
  }

  private updateVisibleCategories(): void {
    this.visibleCategories = this.allCategories;
  }

  slideLeft(category: ExtendedProductCategory): void {
    const container = document.querySelector('.products-container') as HTMLElement;
    if (container) {
      const maxOffset = 0;
      category.slideOffset = Math.min(category.slideOffset + this.slideStep, maxOffset);
    }
  }

  slideRight(category: ExtendedProductCategory): void {
    const container = document.querySelector('.products-container') as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const contentWidth = container.scrollWidth;
      const maxOffset = -(contentWidth - containerWidth);
      category.slideOffset = Math.max(category.slideOffset - this.slideStep, maxOffset);
    }
  }
}
