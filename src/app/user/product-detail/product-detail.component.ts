import { Component, OnInit } from '@angular/core';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { Product, ProductDetailResponse, getColorValue } from '../../shared/models/product.model';

interface Size {
  size: string;
  stock: number;
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
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  selectedColorIndex: number = 0;
  selectedSize: string | null = null;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = params['id'];
      this.loadProductDetails(productId);
    });
  }

  loadProductDetails(productId: number): void {
    this.productService.getProductDetail(productId).subscribe({
      next: (response: ProductDetailResponse) => {
        this.product = response.data.productDetails;
        this.relatedProducts = response.data.relatedProducts;
        if (this.product?.stockDetails?.length > 0) {
          this.selectedColorIndex = 0;
          const firstStockDetail = this.product.stockDetails[0];
          if (firstStockDetail?.sizes?.length > 0) {
            this.selectedSize = firstStockDetail.sizes[0].size;
          }
        }
      },
      error: (error) => {
        console.error('Error loading product details:', error);
      }
    });
  }

  onColorSelect(index: number): void {
    this.selectedColorIndex = index;
    this.selectedSize = null;
  }

  onSizeSelect(size: string): void {
    this.selectedSize = size;
  }

  getSelectedStockDetail() {
    if (!this.product?.stockDetails) return null;
    return this.product.stockDetails[this.selectedColorIndex];
  }

  getSelectedSizeStock(): number {
    const stockDetail = this.getSelectedStockDetail();
    if (!stockDetail || !this.selectedSize) return 0;
    
    const sizeDetail = stockDetail.sizes.find(s => s.size === this.selectedSize);
    return sizeDetail ? sizeDetail.stock : 0;
  }

  getColorValue = getColorValue;

  addToCart(): void {
    if (!this.product || !this.selectedSize) return;

    const selectedStockDetail = this.getSelectedStockDetail();
    if (!selectedStockDetail) return;

    const cartItem = {
      productId: this.product.id,
      productName: this.product.productName,
      price: this.product.price,
      color: selectedStockDetail.color,
      size: this.selectedSize,
      quantity: 1,
      image: this.product.img
    };

    // TODO: Implement cart service
    console.log('Adding to cart:', cartItem);
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }
}
