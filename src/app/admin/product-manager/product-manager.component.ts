import { Component, Input, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import {Category, Product} from '../../shared/models/product.model';
import { ProductService } from '../../services/product.service';

import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { AddDiscountComponent } from '../add-discount/add-discount.component';
import { AddProductComponent } from '../add-product/add-product.component';

import { ProductCategory } from '../../shared/models/product.model';
import {CategoryService} from '../../services/category.service';
import {DiscountListComponent} from '../discount-list/discount-list.component';
import {EditStatusOrderComponent} from '../edit-status-order/edit-status-order.component';
import {EditDiscountComponent} from '../edit-discount/edit-discount.component';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [NgFor],
  templateUrl: './product-manager.component.html',
  styleUrls: ['./product-manager.component.css',
  ]
})
export class ProductManagerComponent implements OnInit {
  @Input() products: Product[] = [];
  selectedProduct: Product | null = null;
  category : Category[] =[]
  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private productService: ProductService,
    private categoryService : CategoryService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadProducts();

  }

  loadProducts(): void {

    this.productService.getHomeProducts().subscribe({
      next: (categories: ProductCategory[]) => {
        this.products = categories.flatMap(category => category.products);
      },
      error: (err) => {
        console.error('Error loading products:', err);
      }
    });

  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.products.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.products.length / this.itemsPerPage);
  }

  openProductDetail(product: Product) {
    const dialogRef = this.dialog.open(ProductDetailComponent, {
      data: { product },
      width: '50vw',
    });
    dialogRef.afterClosed().subscribe(result => {
        this.loadProducts();

    });
  }
  openDiscountList() :void{
    const dialogRef = this.dialog.open(DiscountListComponent, {
      width: '50vw',
      height: '80vh',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadProducts();

    });
  }
  openUpdateProduct(product: Product): void {
    const dialogRef = this.dialog.open(UpdateProductComponent, {
      width: '50vw',
      height: '80vh',
      data: { product }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadProducts();

    });
  }

  openAddProduct() {
    const dialogRef =  this.dialog.open(AddProductComponent, {
      width: '50vw',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadProducts();

    });
  }

  openAddDisCount(product: Product) {
    if (product.discount) {
      const isEdit = confirm('Sản phẩm đã có giảm giá. Bạn có muốn chỉnh sửa giảm giá này không?');
      if (isEdit) {
       const dialogRef =  this.dialog.open(EditDiscountComponent, {
          width: '50vw',
          height: '80vh',
          data: { product, isEdit: true }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.loadProducts();

        });

      }
    } else {
      const isAdd = confirm('Sản phẩm chưa có giảm giá. Bạn có muốn thêm mới không?');
      if (isAdd) {
        const dialogRef =this.dialog.open(AddDiscountComponent, {
          width: '50vw',
          height: '80vh',
          data: { product, isEdit: false }
        });
        dialogRef.afterClosed().subscribe(result => {
          this.loadProducts();

        });
      }
    }
  }


  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }

  getParentIDByProductId(productId: number) {
    this.categoryService.getByProductId(productId).subscribe(data=>{
      this.category = data
    })
  }
  deleteProduct(id: number): void {
    if (confirm('Bạn có chắc muốn xoá sản phẩm này không?')) {
      this.productService.deleteProduct(id).subscribe(() => {
        this.productService.getHomeProducts().subscribe(data => {
          this.products = data;
          this.loadProducts()
        });
      });
    }
  }
}
