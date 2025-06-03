import { Component, Input, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { Product } from '../../shared/models/product.model';
import { ProductService } from '../../services/product.service';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.css']
})
export class ProductManagerComponent implements OnInit {
  @Input() products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getHomeProducts().subscribe({
      next: (categories) => {
        this.products = categories.flatMap(category => category.products);
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });
  }
}
