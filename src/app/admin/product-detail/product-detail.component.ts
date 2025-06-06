import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { FormsModule } from '@angular/forms';
import { Product, getColorValue } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    DiscountPricePipe,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product;
  selectedColorIndex: number = 0;
  selectedSize: string = '';
  getColorValue = getColorValue;
  quantity: number = 1;

  constructor(
    public dialogRef: MatDialogRef<ProductDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.product = data.product;
  }

  ngOnInit(): void {
    if (this.product.stockDetails && this.product.stockDetails.length) {
      this.selectedColorIndex = 0;
      const firstColorDetail = this.product.stockDetails[0];
      if (firstColorDetail.sizes && firstColorDetail.sizes.length) {
        this.selectedSize = firstColorDetail.sizes[0].size;
      }
    }

  }

  onColorSelect(index: number): void {
    this.selectedColorIndex = index;
    const colorDetail = this.product.stockDetails[index];
    if (colorDetail.sizes && colorDetail.sizes.length) {
      this.selectedSize = colorDetail.sizes[0].size;
    } else {
      this.selectedSize = '';
    }
  }

  onSizeSelect(size: string): void {
    this.selectedSize = size;
  }

  getSelectedStockDetail() {
    return this.product.stockDetails ? this.product.stockDetails[this.selectedColorIndex] : null;
  }

  getSelectedSizeDetail() {
    const stockDetail = this.getSelectedStockDetail();
    if (!stockDetail || !stockDetail.sizes) return null;
    return stockDetail.sizes.find(size => size.size === this.selectedSize);
  }

  getStockQuantity(): number {
    const sizeDetail = this.getSelectedSizeDetail();
    return sizeDetail ? sizeDetail.stock : 0;
  }

  increaseQuantity(): void {
    if (this.quantity < this.getStockQuantity()) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }
}
