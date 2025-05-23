import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, getColorValue } from '../../shared/models/product.model';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.css']
})
export class ProductBoxComponent {
  @Input() product!: Product;
  getColorValue = getColorValue;
  hoveredColorIndex: number | null = null;

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }

  onColorHover(index: number) {
    this.hoveredColorIndex = index;
  }

  onColorLeave() {
    this.hoveredColorIndex = null;
  }

  getDisplayImage(): string {
    if (
      this.hoveredColorIndex !== null &&
      this.product.stockDetails &&
      this.product.stockDetails[this.hoveredColorIndex] &&
      this.product.stockDetails[this.hoveredColorIndex].img
    ) {
      return this.getImageUrl(this.product.stockDetails[this.hoveredColorIndex].img);
    }
    return this.getImageUrl(this.product.img);
  }

  onToggleFavorite() {
    console.log('Toggle favorite for product:', this.product.id);
  }
}
