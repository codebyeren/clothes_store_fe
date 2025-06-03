import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../../shared/models/product.model';

interface ExtendedProductCategory extends ProductCategory {
  slideOffset: number;
}

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    ProductBoxComponent,
    CommonModule
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  allCategories: ExtendedProductCategory[] = [];
  visibleCategories: ExtendedProductCategory[] = [];
  slideStep = 700; 

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getHomeProducts().subscribe((categories: ProductCategory[]) => {
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
      const containerWidth = container.offsetWidth;
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

