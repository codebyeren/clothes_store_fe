import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  private apiUrl = `${environment.apiUrl}/favorite`;
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

  getFavorites(): Observable<FavoriteProductDTO[]> {
    return this.favorites$.asObservable();
  }

  loadFavorites(): void {
    if (!this.authService.isLoggedIn()) {
      this.favorites$.next([]); // Clear local state if not logged in
      return;
    }

    this.http.get<ResponseObject<FavoriteProductDTO[]>>(`${this.apiUrl}/list`)
      .subscribe({
        next: (response) => {
          if (response.code === 200) {
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

  addToFavorites(productId: number): Observable<ResponseObject<any>> {
    return this.http.post<ResponseObject<any>>(`${this.apiUrl}/add/${productId}`, {})
      .pipe(
        tap(response => {
          if (response.code === 200) {
            console.log('Added to favorites:', response.message);
            this.loadFavorites();
          } else {
            console.error('Error adding to favorites:', response.message);
          }
        })
      );
  }

  removeFromFavorites(productId: number): Observable<ResponseObject<any>> {
    return this.http.delete<ResponseObject<any>>(`${this.apiUrl}/delete/${productId}`)
      .pipe(
        tap(response => {
          if (response.code === 200) {
            console.log('Removed from favorites:', response.message);
            const currentFavorites = this.favorites$.getValue();
            this.favorites$.next(currentFavorites.filter(fav => fav.id !== productId));
          } else {
            console.error('Error removing from favorites:', response.message);
          }
        })
      );
  }

  isFavorite(productId: number): boolean {
    return this.favorites$.getValue().some(fav => fav.id === productId);
  }

  toggleFavorite(productId: number): void {
    if (this.isFavorite(productId)) {
      this.removeFromFavorites(productId).subscribe();
    } else {
      this.addToFavorites(productId).subscribe();
    }
  }
} 