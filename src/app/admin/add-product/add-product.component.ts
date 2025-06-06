import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import {Category, Color, Size, SizeAdmin} from '../../shared/models/product.model';
import { ColorService } from '../../services/color.service';
import { SizeService } from '../../services/size.services';
import {MatDialogContent, MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatDialogContent
  ],
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  sizes: SizeAdmin[] = [];
  colors: Color[] = [];

  imgMainPreview: string | null = null;
  imgPreviews: string[] = [];

  constructor(
    private fb: FormBuilder,
    private colorService: ColorService,
    private sizeService: SizeService,
    private productService: ProductService,
    private categoryService: CategoryService,
    private dialogRef: MatDialogRef<AddProductComponent>
  ) {
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
    this.loadSizes();
    this.loadColors();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  loadSizes(): void {
    this.sizeService.getAllSize().subscribe(data => {
      this.sizes = data
    });
  }

  loadColors(): void {
    this.colorService.getAllColors().subscribe(data => {
      this.colors = data;
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getSizes(stockIndex: number): FormArray {
    return this.variants.at(stockIndex).get('sizes') as FormArray;
  }

  addStock(): void {
    const stockGroup = this.fb.group({
      color: ['', Validators.required],
      img: [''],
      sizes: this.fb.array([])
    });

    // Mặc định thêm 1 size trống khi thêm biến thể mới
    const sizesArray = stockGroup.get('sizes') as FormArray;
    sizesArray.push(this.createSizeGroup());

    this.variants.push(stockGroup);
  }

  removeStock(index: number): void {
    this.variants.removeAt(index);
    this.imgPreviews.splice(index, 1);
  }

  addSize(stockIndex: number): void {
    this.getSizes(stockIndex).push(this.createSizeGroup());
  }

  removeSize(stockIndex: number, sizeIndex: number): void {
    this.getSizes(stockIndex).removeAt(sizeIndex);
  }

  private createSizeGroup(): FormGroup {
    return this.fb.group({
      size: ['', Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]]
    });
  }

  onFileSelected(event: Event, type: 'imgMain' | 'variant', variantIndex?: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const previewUrl = URL.createObjectURL(file);
    const fileNameWithoutExt = file.name.split('.').slice(0, -1).join('.');

    if (type === 'imgMain') {
      this.imgMainPreview = previewUrl;
      this.productForm.get('imgMain')?.setValue(fileNameWithoutExt);
    } else if (type === 'variant' && variantIndex !== undefined) {
      this.imgPreviews[variantIndex] = previewUrl;
      this.variants.at(variantIndex).get('img')?.setValue(fileNameWithoutExt);
    }


  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      console.warn('Form không hợp lệ');
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.hasDuplicateColors()) {
      console.warn('Không được chọn trùng màu giữa các biến thể!');
      alert('Không được chọn trùng màu giữa các biến thể!');
      return;
    }

    if (this.hasDuplicateSizes()) {
      console.warn('Không được chọn trùng size trong một biến thể!');
      alert('Không được chọn trùng size trong một biến thể!');
      return;
    }

    const formData = this.productForm.value;
    console.log('Dữ liệu gửi lên server:', JSON.stringify(formData, null, 2));

    this.productService.addProduct(formData).subscribe({
      next: (response) => {
        console.log('Tạo sản phẩm thành công:', response);
        this.dialogRef.close(response);
      },
      error: (err) => {
        console.error('Lỗi khi tạo sản phẩm:', err);
      }
    });
  }

  hasDuplicateColors(): boolean {
    const selectedColors = this.variants.controls.map(variant =>
      variant.get('color')?.value
    );
    const uniqueColors = new Set(selectedColors);
    return uniqueColors.size !== selectedColors.length;
  }

  hasDuplicateSizes(): boolean {
    for (let variant of this.variants.controls) {
      const sizesArray = variant.get('sizes') as FormArray;
      const selectedSizes = sizesArray.controls.map(size =>
        size.get('size')?.value
      );
      const uniqueSizes = new Set(selectedSizes);
      if (uniqueSizes.size !== selectedSizes.length) {
        return true; // Có ít nhất một variant trùng size
      }
    }
    return false;
  }


  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }
}
