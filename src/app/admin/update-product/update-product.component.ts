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
  // Lưu file ảnh upload khi chọn (chưa upload lên server)
  imgMainFile: File | null = null;
  variantFiles: { [variantIndex: number]: File } = {};

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

    this.productForm.get('parentCategoryId')?.valueChanges.subscribe(parentId => {
      this.childCategories = this.categories.filter(c => c.parentId === parentId);
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
    if (this.product.img) {
      this.imgMainPreview = this.getImageUrl(this.product.img);
    }

    this.categoryService.getByProductId(this.product.id).subscribe(selectedCategories => {
      const parentCat = selectedCategories.find(c => !c.parentId);
      const childCats = selectedCategories.filter(c => c.parentId);

      this.productForm.patchValue({
        parentCategoryId: parentCat ? parentCat.id : null,
        childCategoryIds: childCats.map(c => c.id)
      });

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
    delete this.variantFiles[index];
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

  onFileSelected(event: Event, type: 'imgMain' | 'variant', variantIndex?: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
          if (!blob) return;
          const newFile = new File([blob], file.name.replace(/\.\w+$/, '.webp'), { type: 'image/webp' });

          const previewUrl = URL.createObjectURL(newFile);
          if (type === 'imgMain') {
            this.imgMainFile = newFile;
            this.imgMainPreview = previewUrl;
            this.productForm.get('imgMain')?.setValue(newFile.name.split('.').slice(0, -1).join('.'));
          }
          if (type === 'variant' && variantIndex !== undefined) {
            this.variantFiles[variantIndex] = newFile;
            this.imgPreviews[variantIndex] = previewUrl;
            this.variants.at(variantIndex).get('img')?.setValue(newFile.name.split('.').slice(0, -1).join('.'));
          }
        }, 'image/webp');
      };
      if (e.target?.result) {
        img.src = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      console.warn('Form không hợp lệ');
      return;
    }

    // Gom tất cả file cần upload
    const filesToUpload: File[] = [];
    const fileIndexMap: { [variantIndex: number]: number } = {};

    if (this.imgMainFile) {
      filesToUpload.push(this.imgMainFile);
    }

    Object.entries(this.variantFiles).forEach(([variantIndexStr, file]) => {
      const variantIndex = Number(variantIndexStr);
      fileIndexMap[variantIndex] = filesToUpload.length;
      filesToUpload.push(file);
    });

    if (filesToUpload.length === 0) {

      this.submitProductForm();
    } else {

      this.productService.uploadFiles(filesToUpload).subscribe({
        next: (uploadedFileNames: string[]) => {
          // Cập nhật tên ảnh chính
          let imgMainName = this.productForm.get('imgMain')?.value;
          let startIndex = 0;
          if (this.imgMainFile) {
            imgMainName = uploadedFileNames[0];
            startIndex = 1;
          }


          const variants = this.productForm.value.variants;
          for (const [variantIndexStr, pos] of Object.entries(fileIndexMap)) {
            const variantIndex = Number(variantIndexStr);
            variants[variantIndex].img = uploadedFileNames[startIndex + pos];
          }

          this.submitProductForm(imgMainName, variants);
        },
        error: err => {
          console.error('Lỗi khi upload ảnh:', err);
          alert('Lỗi khi upload ảnh');
        }
      });
    }
  }

  submitProductForm(imgMainName?: string, variants?: any): void {
    const raw = this.productForm.value;
    const payload = {
      productName: raw.productName,
      price: raw.price,
      status: raw.status,
      categoryIds: [raw.parentCategoryId, ...raw.childCategoryIds],
      imgMain: imgMainName || raw.imgMain,
      variants: variants || raw.variants
    };

    this.productService.updateProduct(this.product.id, payload).subscribe({
      next: res => {
        alert('Cập nhật sản phẩm thành công');
        this.dialogRef.close(res);
      },
      error: err => {
        console.error('Lỗi cập nhật sản phẩm:', err);
        alert('Lỗi khi cập nhật sản phẩm');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }

  onParentCategoryChange(parentId: number): void {
    this.childCategories = this.categories.filter(c => c.parentId === parentId);
    this.productForm.get('childCategoryIds')?.setValue([]);
  }
}
