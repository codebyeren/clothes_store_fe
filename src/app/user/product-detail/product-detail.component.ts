import { Component, OnInit } from '@angular/core';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductDetailResponse, getColorValue } from '../../shared/models/product.model';
import { DiscountPricePipe } from '../../shared/pipes/discount-price.pipe';
import { CartService, CartItemDTO } from '../../services/cart.service';
import { FormsModule } from '@angular/forms';

interface Size {
  size: string;
  stock: number;
  productSizeId: number;
}

interface StockDetail {
  color: string;
  url: string;
  sizes: Size[];
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    ProductBoxComponent,
    CommonModule,
    DiscountPricePipe,
    FormsModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedColorIndex: number = 0;
  selectedSize: string = '';
  getColorValue = getColorValue;
  slideOffset: number = 0;
  slideStep = 300;
  selectedColor: string = '';
  quantity: number = 1;
  loading: boolean = true;
  error: string = '';

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  private loadProduct(slug: string): void {
    this.loading = true;
    this.error = '';
    this.productService.getProductDetail(slug).subscribe({
      next: (response: ProductDetailResponse) => {
        if (response && response.data && response.data.productDetails) {
          this.product = response.data.productDetails;
          this.relatedProducts = response.data.relatedProducts;
          if (this.product.stockDetails && this.product.stockDetails.length > 0) {
            this.selectedColor = this.product.stockDetails[0].color;
            if (this.product.stockDetails[0].sizes && this.product.stockDetails[0].sizes.length > 0) {
              this.selectedSize = this.product.stockDetails[0].sizes[0].size;
            }
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Failed to load product details';
        this.loading = false;
      }
    });
  }

  updateAvailableSizes(): void {
    if (this.product && this.selectedColor) {
      const colorDetail = this.product.stockDetails.find(
        detail => detail.color === this.selectedColor
      );
      if (colorDetail && colorDetail.sizes.length > 0) {
        this.selectedSize = colorDetail.sizes[0].size;
      } else {
        this.selectedSize = '';
      }
    }
  }

  getAvailableSizes(): string[] {
    if (!this.product || !this.selectedColor) return [];
    const colorDetail = this.product.stockDetails.find(
      detail => detail.color === this.selectedColor
    );
    return colorDetail ? colorDetail.sizes.map(size => size.size) : [];
  }

  getAvailableColors(): string[] {
    if (!this.product || !this.product.stockDetails) return [];
    return this.product.stockDetails.map((detail: any) => detail.color);
  }

  getStockQuantity(): number {
    if (!this.product || !this.selectedColor || !this.selectedSize) return 0;
    const colorDetail = this.product.stockDetails.find(
      detail => detail.color === this.selectedColor
    );
    if (!colorDetail) return 0;
    const sizeDetail = colorDetail.sizes.find(
      size => size.size === this.selectedSize
    );
    return sizeDetail ? sizeDetail.stock : 0;
  }

  getColorImage(color: string): string {
    if (!this.product) return '';
    const colorDetail = this.product.stockDetails.find(
      detail => detail.color === color
    );
    return colorDetail ? colorDetail.img : '';
  }

  slideLeft(): void {
    const container = document.querySelector('.products-container') as HTMLElement;
    if (container) {
      const maxOffset = 0;
      this.slideOffset = Math.min(this.slideOffset + this.slideStep, maxOffset);
    }
  }

  slideRight(): void {
    const container = document.querySelector('.products-container') as HTMLElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const contentWidth = container.scrollWidth;
      const maxOffset = -(contentWidth - containerWidth);
      this.slideOffset = Math.max(this.slideOffset - this.slideStep, maxOffset);
    }
  }

  onColorSelect(index: number): void {
    this.selectedColorIndex = index;
    this.selectedSize = '';
  }

  onSizeSelect(size: string): void {
    this.selectedSize = size;
  }

  getSelectedStockDetail(): any {
    if (!this.product || !this.product.stockDetails) return null;
    return this.product.stockDetails.find((detail: any) => detail.color === this.selectedColor);
  }

  getSelectedSizeDetail(): any {
    const stockDetail = this.getSelectedStockDetail();
    if (!stockDetail || !stockDetail.sizes) return null;
    return stockDetail.sizes.find((size: any) => size.size === this.selectedSize);
  }

  getMaxQuantity(): number {
    const sizeDetail = this.getSelectedSizeDetail();
    return sizeDetail ? sizeDetail.quantity : 0;
  }

  onColorChange(): void {
    const sizes = this.getAvailableSizes();
    if (sizes.length > 0) {
      this.selectedSize = sizes[0];
    }
  }

  addToCart(): void {
    if (!this.product) return;

    const sizeDetail = this.getSelectedSizeDetail();
    if (!sizeDetail || sizeDetail.quantity < this.quantity) {
      this.error = 'Selected quantity exceeds available stock';
      return;
    }

    const cartItem: CartItemDTO = {
      productId: this.product.id,
      productName: this.product.productName,
      color: this.selectedColor,
      size: this.selectedSize,
      quantity: this.quantity,
      stock: sizeDetail.quantity,
      imageUrl: this.getSelectedStockDetail().img,
      discountPercent: this.product.discount || 0,
      price: this.product.price.toString(),
      slug: this.product.slug
    };

    this.cartService.addToCart(cartItem);
  }

  increaseQuantity(): void {
    const stockQuantity = this.getStockQuantity();
    if (this.quantity < stockQuantity) {
      this.quantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }
}
