import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product, getColorValue } from '../../shared/models/product.model';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { FavoriteService } from '../../services/favorite.service';
import { FavoriteResponse } from '../../shared/models/favorite.model';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-product-box',
  standalone: true,
  imports: [CommonModule, RouterModule, DiscountPricePipe],
  templateUrl: './product-box.component.html',
  styleUrls: ['./product-box.component.css']
})
export class ProductBoxComponent implements OnInit {
  @Input() product!: Product;
  getColorValue = getColorValue;
  hoveredColorIndex: number | null = null;
  isLoggedIn = false;

  constructor(
    private favoriteService: FavoriteService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
  }

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
    if (!this.isLoggedIn) {
      this.toastr.warning('Vui lòng đăng nhập để thêm vào danh sách yêu thích');
      return;
    }

    if (this.product.isFavorite) {
      this.favoriteService.removeFromFavorites(this.product.id).subscribe({
        next: (response: FavoriteResponse<any>) => {
          this.toastr.success('Đã xóa khỏi danh sách yêu thích');
          this.product.isFavorite = false;
        },
        error: (error: any) => {
          this.toastr.error('Không thể xóa khỏi danh sách yêu thích');
        }
      });
    } else {
      this.favoriteService.addToFavorites(this.product.id).subscribe({
        next: (response: FavoriteResponse<any>) => {
          this.toastr.success('Đã thêm vào danh sách yêu thích');
          this.product.isFavorite = true;
        },
        error: (error: any) => {
          this.toastr.error('Không thể thêm vào danh sách yêu thích');
        }
      });
    }
  }
}
