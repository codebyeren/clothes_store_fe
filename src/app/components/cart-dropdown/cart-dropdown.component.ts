import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { Subscription } from 'rxjs';
import { CartItemDTO } from '../../shared/models/cart.model';

@Component({
  selector: 'app-cart-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cart-dropdown.component.html',
  styleUrl: './cart-dropdown.component.css'
})
export class CartDropdownComponent implements OnInit, OnDestroy {
  cartItems: CartItemDTO[] = [];
  private cartSubscription: Subscription;

  constructor(private cartService: CartService) {
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

  getProductImage(item: CartItemDTO): string {
    return `/img/${item.imageUrl}.webp`;
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