import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
// Assuming ProductDTO structure based on provided API response
export interface FavoriteProductDTO {
  id: number;
  productName: string;
  price: number; // Changed to number based on API response
  discount: number; // Changed to number based on API response
  status: string;
  img: string;
  stockDetails: any[]; // Simplified type based on API response structure
  isFavorite: boolean;
  slug: string;
}

export interface ResponseObject<T> {
  code: number; // Changed from status to code based on API response
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {
  private apiUrl = `${environment.apiUrl}/favorite`; // Corrected base URL based on controller
  private favorites$ = new BehaviorSubject<FavoriteProductDTO[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Load favorites when the user is logged in
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.loadFavorites();
      } else {
        // Clear favorites when logging out
        this.favorites$.next([]);
      }
    });
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getFavorites(): Observable<FavoriteProductDTO[]> {
    return this.favorites$.asObservable();
  }

  loadFavorites(): void {
    if (!this.authService.isLoggedIn()) {
      this.favorites$.next([]); // Clear local state if not logged in
      return;
    }

    this.http.get<ResponseObject<FavoriteProductDTO[]>>(`${this.apiUrl}/list`, { // Corrected endpoint
      headers: this.getHeaders()
    }).subscribe({
      next: (response) => {
        if (response.code === 200) { // Use code based on API response
          this.favorites$.next(response.data);
        } else {
          console.error('Error loading favorites:', response.message);
          this.favorites$.next([]); // Clear on error
        }
      },
      error: (error) => {
        console.error('Error loading favorites:', error);
        this.favorites$.next([]); // Clear on error
      }
    });
  }

  // Note: addToFavorites and removeFromFavorites endpoints are different in the controller
  // Assuming they still return a ResponseObject<any>

  addToFavorites(productId: number): Observable<ResponseObject<any>> {
    // Backend expects POST to /add/{productId}
    return this.http.post<ResponseObject<any>>(`${this.apiUrl}/add/${productId}`, {}, { // Corrected endpoint
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.code === 200) { // Use code based on API response
          console.log('Added to favorites:', response.message);
          // Reload favorites to update the local state - API does not return the new favorite item's details directly
          this.loadFavorites();
        } else {
          console.error('Error adding to favorites:', response.message);
        }
      })
    );
  }

  removeFromFavorites(productId: number): Observable<ResponseObject<any>> {
    // Backend expects DELETE to /delete/{productId}
    return this.http.delete<ResponseObject<any>>(`${this.apiUrl}/delete/${productId}`, { // Corrected endpoint
      headers: this.getHeaders()
    }).pipe(
      tap(response => {
        if (response.code === 200) { // Use code based on API response
          console.log('Removed from favorites:', response.message);
          // Update the local state immediately
          const currentFavorites = this.favorites$.getValue();
          // Filter by product id, assuming the ID in FavoriteProductDTO is the product ID
          this.favorites$.next(currentFavorites.filter(fav => fav.id !== productId));
        } else {
          console.error('Error removing from favorites:', response.message);
        }
      })
    );
  }

  // isFavorite checks if the product ID exists in the local favorites list
  isFavorite(productId: number): boolean {
     return this.favorites$.getValue().some(fav => fav.id === productId);
  }

  // toggleFavorite uses the isFavorite status to call the appropriate API method
  toggleFavorite(productId: number): void {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId).subscribe(); // Subscribe to trigger the request and tap logic
    } else {
      this.addToFavorites(productId).subscribe(); // Subscribe to trigger the request and tap logic
    }
  }
} 