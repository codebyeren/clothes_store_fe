import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.service';

@Component({
  selector: 'app-product-box',
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductBoxComponent {
  @Input() product!: Product;
  @Output() viewProduct = new EventEmitter<number>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() toggleFavorite = new EventEmitter<Product>();

  onViewProduct(): void {
    this.viewProduct.emit(this.product.id);
  }

  onAddToCart(event: Event): void {
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }

  onToggleFavorite(event: Event): void {
    event.stopPropagation();
    this.toggleFavorite.emit(this.product);
  }
}
