import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, getColorValue } from '../../shared/models/product.model';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { FavoriteService } from '../../services/favorite.service';

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

  onToggleFavorite() {
    if (this.product.isFavorite) {
      // Remove from favorites
      this.favoriteService.removeFavorite(1, this.product.id).subscribe({
        next: (response) => {
          console.log('Remove favorite response:', response);
          if (response.statusCode === 200) {
            this.product.isFavorite = false;
          }
        },
        error: (error) => {
          console.error('Error removing favorite:', error);
        }
      });
    } else {
      // Add to favorites
      this.favoriteService.addFavorite(1, this.product.id).subscribe({
        next: (response) => {
          console.log('Add favorite response:', response);
           if (response.statusCode === 200) {
            this.product.isFavorite = true;
          }
        },
        error: (error) => {
          console.error('Error adding favorite:', error);
        }
      });
    }
  }
}
