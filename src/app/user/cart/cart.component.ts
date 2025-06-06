import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { Subscription } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { CartItemDTO } from '../../shared/models/cart.model';

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
  total: number = 0;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private router: Router
  ) {
    this.cartSubscription = this.cartService.getCartItems().subscribe(items => {
      this.cartItems = [...items]; // Create new array to trigger change detection
      this.calculateTotal();
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

  calculateTotal(): void {
    this.total = this.cartItems.reduce((sum, item) => {
      const price = parseFloat(item.price);
      const discount = item.discountPercent || 0;
      const discountedPrice = price * (1 - discount / 100);
      return sum + (discountedPrice * item.quantity);
    }, 0);
  }

  createOrder(): void {
    const orderItems = this.cartItems.map(item => ({
      productId: item.productId,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      discount: item.discountPercent
    }));

    this.orderService.createOrder({ orderItems }).subscribe({
      next: (response) => {
        if (response.code === 200) {
          // Clear cart after successful order
          this.cartService.clearCart();
          // Redirect to orders page
          this.router.navigate(['/user/orders']);
        }
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại.');
      }
    });
  }
}
