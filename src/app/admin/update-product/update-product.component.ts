import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product, Category } from '../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../services/category.service';
import {ProductService} from '../../services/product.service';

@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  templateUrl: './update-product.component.html',
  styleUrls: ['./update-product.component.css']
})
export class UpdateProductComponent implements OnInit {
  productForm: FormGroup;
  product: Product;
  imgMainPreview: string | null = null;
  categories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService : ProductService,
    private categoryService: CategoryService,
    public dialogRef: MatDialogRef<UpdateProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.product = data.product;

    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: [''],
      imgMain: [''],
      categoryIds: [[], Validators.required],
      variants: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductData();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getSizes(stockIndex: number): FormArray {
    return this.variants.at(stockIndex).get('sizes') as FormArray;
  }

  loadProductData(): void {
    if (!this.product || !this.product.stockDetails) {
      console.error('No product or stockDetails data provided');
      return;
    }

    // Load product data to form
    this.productForm.patchValue({
      productName: this.product.productName || '',
      price: this.product.price || 0,
      status: this.product.status || '',
      imgMain: this.product.img || ''
    });

    // Load selected categories
    this.categoryService.getByProductId(this.product.id).subscribe(selectedCategories => {
      const selectedIds = selectedCategories.map(c => c.id);
      this.productForm.patchValue({ categoryIds: selectedIds });
    });

    // Load stock details
    this.product.stockDetails.forEach(stock => {
      const stockGroup = this.fb.group({
        color: [stock.color || '', Validators.required],
        img: [stock.img || ''],
        sizes: this.fb.array([])
      });

      const sizeArray = stockGroup.get('sizes') as FormArray;
      if (stock.sizes && stock.sizes.length) {
        stock.sizes.forEach(size => {
          sizeArray.push(this.fb.group({
            size: [size.size || '', Validators.required],
            stock: [size.stock || 0, [Validators.required, Validators.min(0)]]
          }));
        });
      }

      this.variants.push(stockGroup);
    });
  }

  addStock(): void {
    const stockGroup = this.fb.group({
      color: ['', Validators.required],
      img: [''],
      sizes: this.fb.array([
        this.fb.group({
          size: ['', Validators.required],
          stock: [0, [Validators.required, Validators.min(0)]]
        })
      ])
    });
    this.variants.push(stockGroup);
  }

  removeStock(index: number): void {
    this.variants.removeAt(index);
  }

  addSize(stockIndex: number): void {
    const sizeGroup = this.fb.group({
      size: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
    this.getSizes(stockIndex).push(sizeGroup);
  }

  removeSize(stockIndex: number, sizeIndex: number): void {
    this.getSizes(stockIndex).removeAt(sizeIndex);
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = this.productForm.value;
      console.log('Dữ liệu gửi lên server:', JSON.stringify(formData, null, 2));

      this.productService.updateProduct(this.product.id, formData).subscribe({
        next: (response) => {
          console.log('Cập nhật sản phẩm thành công:', response);
          this.dialogRef.close(response);
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật sản phẩm:', err);
        }
      });
    } else {
      console.warn('Form không hợp lệ');
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }
  onFileSelected(event: Event, type: 'imgMain' | 'variant', variantIndex?: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');
    const previewUrl = URL.createObjectURL(file);

    if (type === 'imgMain') {

      this.imgMainPreview = previewUrl;
      this.productForm.get('imgMain')?.setValue(fileNameWithoutExt);
      this.product.img = '';
    }

    const formData = new FormData();
    formData.append('file', file);

  }
  imgPreviews: string[] = []; // mảng lưu url preview cho từng variant
  onFileSelectedV(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const previewUrl = URL.createObjectURL(file);
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');

    // Lưu preview url cho variant tương ứng
    this.imgPreviews[index] = previewUrl;

    // Cập nhật tên ảnh vào formControl variants[i].img
    this.variants.at(index).get('img')?.setValue(fileNameWithoutExt);

    // Upload ảnh lên server nếu cần (gọi API)
    const formData = new FormData();
    formData.append('file', file);

  }

}
