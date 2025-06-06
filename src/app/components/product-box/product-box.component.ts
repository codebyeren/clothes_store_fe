import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, getColorValue } from '../../shared/models/product.model';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { FavoriteService } from '../../services/favorite.service';
import { ResponseObject } from '../../services/favorite.service';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [CommonModule, RouterModule, DiscountPricePipe],
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.css']
})
export class ProductBoxComponent {
  @Input() product!: Product;
  getColorValue = getColorValue;
  hoveredColorIndex: number | null = null;

  constructor(private favoriteService: FavoriteService) {}

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

  toggleFavorite(): void {
    if (this.product.isFavorite) {
      this.favoriteService.removeFromFavorites(this.product.id).subscribe({
        next: (response: ResponseObject<any>) => {
          console.log('Removed from favorites:', response);
          this.product.isFavorite = false;
        },
        error: (error: any) => {
          console.error('Error removing from favorites:', error);
        }
      });
    } else {
      this.favoriteService.addToFavorites(this.product.id).subscribe({
        next: (response: ResponseObject<any>) => {
          console.log('Added to favorites:', response);
          this.product.isFavorite = true;
        },
        error: (error: any) => {
          console.error('Error adding to favorites:', error);
        }
      });
    }
  }
}
