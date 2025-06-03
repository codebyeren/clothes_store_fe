import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, interval, Subscription, BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ProductService } from './product.service';

export interface CartItemDTO {
  productId: number;
  productName: string;
  color: string;
  size: string;
  quantity: number;
  stock: number;
  imageUrl: string;
  discountPercent: number;
  price: string;
  slug: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/cart`;
  private readonly CART_STORAGE_KEY = 'cart_items';
  private readonly LOADED_FROM_DB_KEY = 'cart_loaded_from_db';
  private autoSaveSubscription: Subscription | null = null;
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private cartItems$ = new BehaviorSubject<CartItemDTO[]>([]);
  private cartUpdate$ = new Subject<void>();
  private hasLoadedFromDB: boolean;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private productService: ProductService
  ) {
    // Initialize hasLoadedFromDB from localStorage
    this.hasLoadedFromDB = localStorage.getItem(this.LOADED_FROM_DB_KEY) === 'true';
    
    // Always load from localStorage first
    this.loadCartFromStorage();
    
    this.setupAutoSave();
    this.setupBeforeUnload();
    
    // Subscribe to login status changes
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn && !this.hasLoadedFromDB) {
        // Only load from DB when logging in and haven't loaded before
        this.loadCartFromDB();
      }
    });
  }

  private setHasLoadedFromDB(value: boolean): void {
    this.hasLoadedFromDB = value;
    localStorage.setItem(this.LOADED_FROM_DB_KEY, value.toString());
  }

  private loadCartFromStorage(): void {
    try {
      const storedItems = localStorage.getItem(this.CART_STORAGE_KEY);
      if (storedItems) {
        const items = JSON.parse(storedItems);
        if (Array.isArray(items)) {
          this.cartItems$.next([...items]);
        } else {
          console.error('Invalid cart data in localStorage');
          this.clearCart();
        }
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      this.clearCart();
    }
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  private setupAutoSave(): void {
    this.autoSaveSubscription = interval(this.AUTO_SAVE_INTERVAL).subscribe(() => {
      if (this.authService.isLoggedIn()) {
        this.syncCart();
      }
    });
  }

  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', () => {
      if (this.authService.isLoggedIn()) {
        this.syncCart();
      }
    });
  }

  private syncCart(): void {
    if (!this.authService.isLoggedIn()) return;

    const currentCart = this.cartItems$.getValue();
    this.http.post(this.apiUrl, currentCart, {
      headers: this.getHeaders()
    }).subscribe({
      next: () => {
        console.log('Cart synced successfully');
      },
      error: (error) => {
        console.error('Error syncing cart with backend:', error);
      }
    });
  }

  // Call this method before logging out
  syncCartBeforeLogout(): Promise<void> {
    return new Promise((resolve, reject) => {
      const currentCart = this.cartItems$.getValue();
      if (currentCart.length === 0) {
        this.clearCart();
        resolve();
        return;
      }

      this.http.post(this.apiUrl, currentCart, {
        headers: this.getHeaders()
      }).subscribe({
        next: () => {
          console.log('Cart synced successfully before logout');
          this.clearCart();
          resolve();
        },
        error: (error) => {
          console.error('Error syncing cart before logout:', error);
          this.clearCart();
          reject(error);
        }
      });
    });
  }

  getCartItems(): Observable<CartItemDTO[]> {
    return this.cartItems$.asObservable();
  }

  getCartUpdates(): Observable<void> {
    return this.cartUpdate$.asObservable();
  }

  addToCart(item: CartItemDTO): void {
    const currentCart = this.cartItems$.getValue();
    
    // Check if item with same productId, color and size exists
    const existingItemIndex = currentCart.findIndex(
      existingItem => 
        existingItem.productId === item.productId && 
        existingItem.color === item.color && 
        existingItem.size === item.size
    );

    if (existingItemIndex !== -1) {
      // If item exists, increase quantity
      const updatedItems = [...currentCart];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + item.quantity
      };
      this.updateCart(updatedItems);
    } else {
      // If item doesn't exist, add new item
      const updatedItems = [...currentCart, item];
      this.updateCart(updatedItems);
    }
  }

  updateCartItem(item: CartItemDTO): void {
    const currentCart = this.cartItems$.getValue();
    const updatedItems = currentCart.map(cartItem => 
      cartItem.productId === item.productId && 
      cartItem.color === item.color && 
      cartItem.size === item.size ? item : cartItem
    );
    this.updateCart(updatedItems);
  }

  removeFromCart(item: CartItemDTO): void {
    const currentCart = this.cartItems$.getValue();
    const updatedItems = currentCart.filter(i => 
      !(i.productId === item.productId && 
        i.color === item.color && 
        i.size === item.size)
    );
    this.updateCart(updatedItems);
  }

  private updateCart(items: CartItemDTO[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      this.cartItems$.next([...items]); // Create new array to trigger change detection
      this.cartUpdate$.next(); // Notify all subscribers about the update
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  clearCart(): void {
    // Clear the BehaviorSubject
    this.cartItems$.next([]);
    // Remove cart items from localStorage
    localStorage.removeItem(this.CART_STORAGE_KEY);
    // Remove the loaded from DB flag
    localStorage.removeItem(this.LOADED_FROM_DB_KEY);
    // Notify subscribers about the clear
    this.cartUpdate$.next();
    console.log('Cart cleared from localStorage and memory');
  }

  loadCartFromDB(): void {
    if (!this.authService.isLoggedIn() || this.hasLoadedFromDB) return;

    this.http.get<CartItemDTO[]>(this.apiUrl, {
      headers: this.getHeaders()
    }).subscribe({
      next: (items) => {
        // Load DB items directly to localStorage
        this.updateCart(items);
        this.setHasLoadedFromDB(true);
      },
      error: (error) => {
        console.error('Error loading cart from DB:', error);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
    this.cartUpdate$.complete();
  }
}
