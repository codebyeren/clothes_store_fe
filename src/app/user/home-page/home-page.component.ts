import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule } from '@angular/common';
import { ProductCategory } from '../../shared/models/product.model';

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
  allCategories: ProductCategory[] = [];
  visibleCategories: ProductCategory[] = [];
  maxVisibleItems = 4;
  step = 4;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getHomeProducts().subscribe((categories: ProductCategory[]) => {
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
