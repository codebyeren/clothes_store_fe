import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, interval, Subscription, BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { CartItemDTO, CartResponse } from '../shared/models/cart.model';

@Injectable({
  providedIn: 'root'
})
export class CartService implements OnDestroy {
  private apiUrl = `${environment.apiUrl}/cart`;
  private readonly CART_STORAGE_KEY = 'cart_items';
  private readonly LOADED_FROM_DB_KEY = 'cart_loaded_from_db';
  private autoSaveSubscription: Subscription | null = null;
  private readonly AUTO_SAVE_INTERVAL = 5 * 60 * 1000; 
  private cartItems$ = new BehaviorSubject<CartItemDTO[]>([]);
  private cartUpdate$ = new Subject<void>();
  private hasLoadedFromDB: boolean;
  private destroy$ = new Subject<void>();
  private boundSyncCart = this.syncCart.bind(this);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastr: ToastrService
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

    // Subscribe to logout initiation event from AuthService
    this.authService.logoutInitiated$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        console.log('Logout initiated, syncing cart before clearing');
        // Call syncCartBeforeLogout which handles API sync and then clears local storage
        this.syncCartBeforeLogout().catch(error => {
          console.error('Error during cart sync before logout:', error);
          // Even if sync fails, try to clear local storage to prevent stale data
          this.clearCart();
        });
        this.clearCart();
      });
  }

  /**
   * Sets the hasLoadedFromDB flag and updates localStorage.
   * @param value The boolean value to set
   */
  private setHasLoadedFromDB(value: boolean): void {
    this.hasLoadedFromDB = value;
    localStorage.setItem(this.LOADED_FROM_DB_KEY, value.toString());
  }

  /**
   * Loads cart items from localStorage.
   */
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

  /**
   * Sets up periodic auto-save to sync cart with server.
   */
  private setupAutoSave(): void {
    this.autoSaveSubscription = interval(this.AUTO_SAVE_INTERVAL)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.authService.isLoggedIn()) {
          console.log('Auto save interval reached, syncing cart...');
          this.syncCart();
        }
      });
  }

  /**
   * Sets up beforeunload event to sync cart before browser closes.
   */
  private setupBeforeUnload(): void {
    window.addEventListener('beforeunload', this.boundSyncCart);
  }

  /**
   * Syncs cart items with the backend server.
   */
  private syncCart(): void {
    if (!this.authService.isLoggedIn()) return;

    const currentCart = this.cartItems$.getValue();

    console.log('Attempting to sync cart with backend...');
    this.http.post(this.apiUrl, currentCart)
      .subscribe({
        next: () => {
          console.log('Cart synced successfully');
        },
        error: (error) => {
          console.error('Error syncing cart with backend:', error);
        }
      });
  }

  /**
   * Syncs cart with server before logout and clears local storage on success.
   * @returns Promise that resolves on successful sync or rejects on error
   */
  syncCartBeforeLogout(): Promise<void> {
    console.log('syncCartBeforeLogout called.');
    return new Promise((resolve, reject) => {
      const currentCart = this.cartItems$.getValue();

      console.log('Attempting to sync cart with backend before logout...');
      this.http.post(this.apiUrl, currentCart)
        .subscribe({
          next: (response) => {
            console.log('Cart synced successfully before logout. API Response:', response);
            this.clearCart();
            resolve();
          },
          error: (error) => {
            console.error('Error syncing cart before logout:', error);
            reject(error);
          }
        });
    });
  }

  /**
   * Returns an observable of cart items.
   * @returns Observable of CartItemDTO array
   */
  getCartItems(): Observable<CartItemDTO[]> {
    return this.cartItems$.asObservable();
  }

  /**
   * Returns an observable for cart update notifications.
   * @returns Observable for cart updates
   */
  getCartUpdates(): Observable<void> {
    return this.cartUpdate$.asObservable();
  }

  /**
   * Adds an item to the cart, merging quantities if it already exists.
   * @param item The cart item to add
   */
  addToCart(item: CartItemDTO): void {
    if (item.quantity <= 0 || item.quantity > item.stock) {
      console.error('Invalid quantity or exceeds stock');
      return;
    }

    const currentCart = this.cartItems$.getValue();
    const existingItemIndex = currentCart.findIndex(
      existingItem => 
        existingItem.productId === item.productId && 
        existingItem.color === item.color && 
        existingItem.size === item.size
    );

    if (existingItemIndex !== -1) {
      const newQuantity = currentCart[existingItemIndex].quantity + item.quantity;
      if (newQuantity > item.stock) {
        console.error('Total quantity exceeds stock');
        return;
      }
      const updatedItems = [...currentCart];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity
      };
      this.updateCart(updatedItems);
      this.toastr.success('Đã cập nhật số lượng sản phẩm trong giỏ hàng');
    } else {
      const updatedItems = [...currentCart, item];
      this.updateCart(updatedItems);
      this.toastr.success('Đã thêm sản phẩm vào giỏ hàng');
    }
    this.saveCart();
  }

  /**
   * Updates an existing item in the cart.
   * @param item The updated cart item
   */
  updateCartItem(item: CartItemDTO): void {
    if (item.quantity <= 0 || item.quantity > item.stock) {
      console.error('Invalid quantity or exceeds stock');
      return;
    }

    const currentCart = this.cartItems$.getValue();
    const updatedItems = currentCart.map(cartItem => 
      cartItem.productId === item.productId && 
      cartItem.color === item.color && 
      cartItem.size === item.size ? item : cartItem
    );
    this.updateCart(updatedItems);
    this.toastr.success('Đã cập nhật giỏ hàng');
    this.saveCart();
  }

  /**
   * Removes an item from the cart.
   * @param item The cart item to remove
   */
  removeFromCart(item: CartItemDTO): void {
    const currentCart = this.cartItems$.getValue();
    const updatedItems = currentCart.filter(i => 
      !(i.productId === item.productId && 
        i.color === item.color && 
        i.size === item.size)
    );
    this.updateCart(updatedItems);
    this.toastr.success('Đã xóa sản phẩm khỏi giỏ hàng');
    this.saveCart();
  }

  /**
   * Updates cart items in localStorage and notifies subscribers.
   * @param items The updated cart items
   */
  private updateCart(items: CartItemDTO[]): void {
    try {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
      this.cartItems$.next([...items]); // Create new array to trigger change detection
      this.cartUpdate$.next(); // Notify all subscribers about the update
    } catch (error) {
      console.error('Error updating cart:', error);
    }
  }

  /**
   * Clears the cart from localStorage and memory, and syncs with server.
   */
  clearCart(): void {
    console.log('Executing clearCart method...');
    this.cartItems$.next([]);
    localStorage.removeItem(this.CART_STORAGE_KEY);
    this.setHasLoadedFromDB(false);
    this.cartUpdate$.next();
    this.toastr.success('Đã xóa tất cả sản phẩm trong giỏ hàng');
  }

  /**
   * Loads cart items from the backend database.
   */
  loadCartFromDB(): void {
    if (!this.authService.isLoggedIn() || this.hasLoadedFromDB) return;

    this.http.get<CartResponse>(this.apiUrl)
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.updateCart(response.data);
            this.setHasLoadedFromDB(true);
          } else {
            console.error('Error loading cart from DB:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading cart from DB:', error);
        }
      });
  }

  /**
   * Cleans up subscriptions and event listeners.
   */
  ngOnDestroy(): void {
    if (this.autoSaveSubscription) {
      this.autoSaveSubscription.unsubscribe();
    }
    window.removeEventListener('beforeunload', this.boundSyncCart);
    this.cartUpdate$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private saveCart(): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(this.cartItems$.value));
  }
}