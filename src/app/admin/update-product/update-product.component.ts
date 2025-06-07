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
import { ProductService } from '../../services/product.service';

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
  imgPreviews: string[] = [];
  categories: Category[] = [];
  parentCategories: Category[] = [];
  childCategories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
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
      parentCategoryId: [null, Validators.required],
      childCategoryIds: [[]],
      variants: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadProductData();

    // Cập nhật childCategories khi thay đổi parentCategoryId
    this.productForm.get('parentCategoryId')?.valueChanges.subscribe(parentId => {
      this.childCategories = this.categories.filter(c => c.parentId === parentId);
      // Reset chọn danh mục con khi đổi danh mục cha
      this.productForm.get('childCategoryIds')?.setValue([]);
    });
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getSizes(stockIndex: number): FormArray {
    return this.variants.at(stockIndex).get('sizes') as FormArray;
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
      this.parentCategories = data.filter(c => !c.parentId);

      // Nếu đã có parentCategoryId trong form thì cập nhật childCategories tương ứng
      const currentParentId = this.productForm.get('parentCategoryId')?.value;
      if (currentParentId) {
        this.childCategories = this.categories.filter(c => c.parentId === currentParentId);
      } else {
        this.childCategories = [];
      }
    });
  }

  loadProductData(): void {
    if (!this.product || !this.product.stockDetails) return;

    this.productForm.patchValue({
      productName: this.product.productName || '',
      price: this.product.price || 0,
      status: this.product.status || '',
      imgMain: this.product.img || ''
    });

    this.categoryService.getByProductId(this.product.id).subscribe(selectedCategories => {
      const parentCat = selectedCategories.find(c => !c.parentId);
      const childCats = selectedCategories.filter(c => c.parentId);

      this.productForm.patchValue({
        parentCategoryId: parentCat ? parentCat.id : null,
        childCategoryIds: childCats.map(c => c.id)
      });

      // Cập nhật danh mục con để hiển thị đúng
      this.childCategories = this.categories.filter(c => c.parentId === (parentCat ? parentCat.id : null));
    });

    this.product.stockDetails.forEach(stock => {
      const stockGroup = this.fb.group({
        color: [stock.color || '', Validators.required],
        img: [stock.img || ''],
        sizes: this.fb.array([])
      });

      const sizeArray = stockGroup.get('sizes') as FormArray;
      stock.sizes?.forEach(size => {
        sizeArray.push(this.fb.group({
          size: [size.size || '', Validators.required],
          stock: [size.stock || 0, [Validators.required, Validators.min(0)]]
        }));
      });

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
    this.imgPreviews.splice(index, 1);
  }

  addSize(stockIndex: number): void {
    this.getSizes(stockIndex).push(
      this.fb.group({
        size: ['', Validators.required],
        stock: [0, [Validators.required, Validators.min(0)]]
      })
    );
  }

  removeSize(stockIndex: number, sizeIndex: number): void {
    this.getSizes(stockIndex).removeAt(sizeIndex);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      console.warn('Form không hợp lệ');
      return;
    }

    const raw = this.productForm.value;

    const result = {
      productName: raw.productName,
      price: raw.price,
      status: raw.status,
      categoryIds: [raw.parentCategoryId, ...raw.childCategoryIds],
      imgMain: raw.imgMain,
      variants: raw.variants.map((variant: { color: string; img: string; sizes: { size: string; stock: number }[] }) => ({
        color: variant.color,
        img: variant.img,
        sizes: variant.sizes
      }))

    };
    console.log('Dữ liệu gửi lên server:', JSON.stringify(result, null, 2));

    this.productService.updateProduct(this.product.id, result).subscribe({
      next: (res) => {
        console.log('Cập nhật sản phẩm thành công:', res);
        alert('Cập nhật sản pẩm thành công')
        this.dialogRef.close(res);
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
      }
    });
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
    }

    if (type === 'variant' && variantIndex !== undefined) {
      this.imgPreviews[variantIndex] = previewUrl;
      this.variants.at(variantIndex).get('img')?.setValue(fileNameWithoutExt);
    }
  }
  onParentCategoryChange(parentId: number): void {
    this.childCategories = this.categories.filter(c => c.parentId === parentId);
    // Reset childCategoryIds khi đổi parent
    this.productForm.get('childCategoryIds')?.setValue([]);
  }

}
