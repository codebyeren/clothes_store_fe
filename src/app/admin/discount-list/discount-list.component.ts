import { Component } from '@angular/core';
import {Product} from '../../shared/models/product.model';
import {DiscountService} from '../../services/discounts.service';
import {MatDialogRef} from '@angular/material/dialog';
import {ProductService} from '../../services/product.service';
import {NgForOf} from '@angular/common';
import { Discount } from '../../shared/models/discount.model';

@Component({
  selector: 'app-discount-list',
  imports: [
    NgForOf
  ],
  templateUrl: './discount-list.component.html',
  styleUrl: './discount-list.component.css'
})
export class DiscountListComponent {
  product: Product[] = [];
  discount: Discount[] = [];
  productNameMap: { [key: number]: string } = {};

  constructor(
    private productService: ProductService,
    private discountService: DiscountService,
    private dialogRef: MatDialogRef<Discount>
  ) {}

  ngOnInit() {
    this.loadAllData();
  }
  loadAllData() {
    this.productService.getHomeProducts().subscribe((categories: any[]) => {
      const allProducts: Product[] = categories.flatMap(c => c.products);

      this.product = allProducts;
      console.log('Merged Products:', this.product);

      this.productNameMap = {};
      this.product.forEach(p => {
        this.productNameMap[p.id] = p.productName;
      });

      console.log('productNameMap:', this.productNameMap);

      this.discountService.getALlDisCount().subscribe(discounts => {
        this.discount = discounts;
        console.log('Discounts:', this.discount);
      });
    });
  }



  getProductName(productId: number): string {
    return this.productNameMap[productId] || 'Không tìm thấy';
  }
}

