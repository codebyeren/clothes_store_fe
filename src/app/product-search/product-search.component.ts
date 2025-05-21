import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ProductService, ProductCategory } from '../services/product.service';
import { ProductBoxComponent } from '../components/product-box/product-box.component';
import { NgFor, NgIf } from '@angular/common';
import {RouterModule } from '@angular/router'

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    ProductBoxComponent,
    NgFor,
    NgIf,
    RouterModule
  ],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {
  allCategories: ProductCategory[] = [];
  visibleCategories: ProductCategory[] = [];
  maxVisibleItems = 4;
  step = 4;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.productService.getProducts().subscribe(response => {
      this.allCategories = response.data;
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
