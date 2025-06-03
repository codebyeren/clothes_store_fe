import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CartService, CartItemDTO } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItemDTO[] = [];
  private cartSubscription: Subscription;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService
  ) {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = [...items]; // Create new array to trigger change detection
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  getProductName(item: CartItemDTO): string {
    return item.productName;
  }

  getProductPrice(item: CartItemDTO): number {
    return parseFloat(item.price);
  }

  getDiscountedPrice(item: CartItemDTO): number {
    const price = parseFloat(item.price);
    const discount = item.discountPercent || 0;
    return price * (1 - discount / 100);
  }

  getProductDiscount(item: CartItemDTO): number {
    return item.discountPercent || 0;
  }

  getProductImage(item: CartItemDTO): string {
    return `/img/${item.imageUrl}.webp`;
  }

  updateQuantity(item: CartItemDTO, newQuantity: number): void {
    if (newQuantity > 0 && newQuantity <= item.stock) {
      const updatedItem = { ...item, quantity: newQuantity };
      this.cartService.updateCartItem(updatedItem);
    }
  }

  removeItem(item: CartItemDTO): void {
    this.cartService.removeFromCart(item);
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      const price = parseFloat(item.price);
      const discount = item.discountPercent || 0;
      const discountedPrice = price * (1 - discount / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
  }

  getItemTotal(item: CartItemDTO): number {
    const price = parseFloat(item.price);
    const discount = item.discountPercent || 0;
    const discountedPrice = price * (1 - discount / 100);
    return discountedPrice * item.quantity;
  }
}
