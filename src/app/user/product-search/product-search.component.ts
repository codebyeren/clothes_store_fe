import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ProductBoxComponent } from '../../components/product-box/product-box.component';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductSearchResult } from '../../shared/models/product.model';

interface SliderState {
  currentSlide: number;
  displayedProducts: Product[];
}

@Component({
  selector: 'app-product-search',
  standalone: true,
  imports: [ProductBoxComponent, CommonModule, RouterModule],
  templateUrl: './product-search.component.html',
  styleUrl: './product-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductSearchComponent implements OnInit {
  products: Product[] = [];
  total: number = 0;
  message: string = '';
  isLoading: boolean = false;
  searchQuery: string = '';
  itemsPerPage: number = 8;
  
  searchSlider: SliderState = {
    currentSlide: 0,
    displayedProducts: []
  };
  
  suggestedSlider: SliderState = {
    currentSlide: 0,
    displayedProducts: []
  };

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const productName = params['productName']?.trim() || '';
      this.searchQuery = productName;
      this.searchProducts(productName);
    });
  }

  private searchProducts(productName: string): void {
    if (!productName) {
      this.resetState();
      this.message = 'Vui lòng nhập từ khóa tìm kiếm';
      this.cdr.markForCheck();
      return;
    }

    this.isLoading = true;
    this.message = '';
    this.cdr.markForCheck();

    this.productService.searchProducts(productName).subscribe({
      next: (result: ProductSearchResult) => {
        this.products = result.products || [];
        this.total = result.total || 0;
        this.message = result.message || '';
        
        if (this.products.length > 0) {
          this.updateSliderProducts(this.searchSlider);
          this.updateSliderProducts(this.suggestedSlider);
        }
        
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Search error:', error);
        this.resetState();
        this.message = 'Có lỗi xảy ra khi tìm kiếm sản phẩm. Vui lòng thử lại sau.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private resetState(): void {
    this.products = [];
    this.searchSlider.displayedProducts = [];
    this.suggestedSlider.displayedProducts = [];
    this.total = 0;
  }

  private updateSliderProducts(slider: SliderState): void {
    if (this.products.length <= this.itemsPerPage) {
      slider.displayedProducts = this.products;
      return;
    }

    const startIndex = slider.currentSlide * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    slider.displayedProducts = this.products.slice(startIndex, endIndex);
  }

  nextSlide(slider: SliderState): void {
    const maxSlides = Math.ceil(this.products.length / this.itemsPerPage) - 1;
    if (slider.currentSlide < maxSlides) {
      slider.currentSlide++;
      this.updateSliderProducts(slider);
      this.cdr.markForCheck();
    }
  }

  prevSlide(slider: SliderState): void {
    if (slider.currentSlide > 0) {
      slider.currentSlide--;
      this.updateSliderProducts(slider);
      this.cdr.markForCheck();
    }
  }
}