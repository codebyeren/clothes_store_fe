import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductService, Product, ProductCategory } from '../services/product.service';
import { ProductBoxComponent } from '../components/product-box/product-box.component';
import {NgForOf, NgClass, NgIf,} from '@angular/common';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    ProductBoxComponent,
    NgForOf,
    NgClass,
    NgIf,

  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {

  product?: Product;
  allCategories: ProductCategory[] = [];
  visibleCategories: ProductCategory[] = [];
  maxVisibleItems = 4;
  step = 4;

  currentImageIndex = 0; // quản lý ảnh đang hiển thị

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Lấy sản phẩm chi tiết
    this.productService.getProductById(id).subscribe((res) => {
      this.product = res;
      this.currentImageIndex = 0;  // reset khi tải sản phẩm mới
    });

    // Lấy danh mục sản phẩm liên quan
    this.productService.getProducts().subscribe(response => {
      this.allCategories = response.data;
      this.updateVisibleCategories();
    });
  }

  // Carousel controls
  prevImage(): void {
    if (!this.product?.img_list?.length) return;
    this.currentImageIndex = (this.currentImageIndex - 1 + this.product.img_list.length) % this.product.img_list.length;
  }

  nextImage(): void {
    if (!this.product?.img_list?.length) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.img_list.length;
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  loadMore(): void {
    this.maxVisibleItems += this.step;
    this.updateVisibleCategories();
  }

  private updateVisibleCategories(): void {
    this.visibleCategories = this.allCategories.slice(0, this.maxVisibleItems);
  }

  hasMore(): boolean {
    return this.visibleCategories.length < this.allCategories.length;
  }


}
