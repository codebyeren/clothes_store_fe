import {Component, OnInit, ViewEncapsulation} from '@angular/core';
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
import { Category, Color, SizeAdmin } from '../../shared/models/product.model';
import { ColorService } from '../../services/color.service';
import { SizeService } from '../../services/size.services';
import { MatDialogContent, MatDialogRef } from '@angular/material/dialog';

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
  styleUrls: ['./add-product.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories: Category[] = [];
  sizes: SizeAdmin[] = [];
  colors: Color[] = [];
  parentCategories: Category[] = [];
  childCategories: Category[] = [];

  imgMainPreview: string | null = null;
  imgMainFile: File | null = null;
  variantImgPreviews: string[] = [];
  variantImgFiles: (File | null)[] = [];

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
      parentCategoryId: [null, Validators.required],
      childCategoryIds: [[]],
      variants: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadSizes();
    this.loadColors();
    this.productForm.get('parentCategoryId')?.valueChanges.subscribe(parentId => {
      this.childCategories = this.categories.filter(c => c.parentId === parentId);
      this.productForm.get('childCategoryIds')?.setValue([]);
    });
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
      this.parentCategories = data.filter(c => !c.parentId);
      const currentParentId = this.productForm.get('parentCategoryId')?.value;
      this.childCategories = currentParentId ? data.filter(c => c.parentId === currentParentId) : [];
    });
  }


  loadSizes(): void {
    this.sizeService.getAllSize().subscribe(data => this.sizes = data);
  }

  loadColors(): void {
    this.colorService.getAllColors().subscribe(data => this.colors = data);
  }

  get variants(): FormArray {
    return this.productForm.get('variants') as FormArray;
  }

  getSizes(index: number): FormArray {
    return this.variants.at(index).get('sizes') as FormArray;
  }

  addStock(): void {
    const stockGroup = this.fb.group({
      color: ['', Validators.required],
      img: [''],
      sizes: this.fb.array([this.createSizeGroup()])
    });
    this.variants.push(stockGroup);
    this.variantImgFiles.push(null);
    this.variantImgPreviews.push('');
  }

  removeStock(index: number): void {
    this.variants.removeAt(index);
    this.variantImgFiles.splice(index, 1);
    this.variantImgPreviews.splice(index, 1);
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
    const reader = new FileReader();

    reader.onload = (e) => {
      const previewUrl = e.target?.result as string;

      if (type === 'imgMain') {
        this.imgMainFile = file;
        this.imgMainPreview = previewUrl;
      } else if (type === 'variant' && variantIndex !== undefined) {
        this.variantImgFiles[variantIndex] = file;
        this.variantImgPreviews[variantIndex] = previewUrl;
      }
    };

    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    if (this.hasDuplicateColors()) {
      alert('Không được chọn trùng màu giữa các biến thể!');
      return;
    }

    if (this.hasDuplicateSizes()) {
      alert('Không được chọn trùng size trong một biến thể!');
      return;
    }

    try {
      const uploadedImages: { [key: string]: string } = {};
      const formData = new FormData();

      if (this.imgMainFile) {
        const timestamp = Date.now();
        const name = this.imgMainFile.name.split('.').slice(0, -1).join('.');
        const newName = `${name}_${timestamp}.webp`;
        const webpFile = await this.convertToWebp(this.imgMainFile, newName);
        formData.append('files', webpFile); // Tên trường 'files' khớp với API
        uploadedImages[this.imgMainFile.name] = newName;
      }

      for (let index = 0; index < this.variantImgFiles.length; index++) {
        const file = this.variantImgFiles[index];
        if (file) {
          const timestamp = Date.now();
          const name = file.name.split('.').slice(0, -1).join('.');
          const newName = `${name}_${timestamp}.webp`;
          const webpFile = await this.convertToWebp(file, newName);
          formData.append('files', webpFile); // Tên trường 'files' khớp với API
          uploadedImages[file.name] = newName;
        }
      }

      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      if (formData.has('files')) {
        const uploadResponse = await this.productService.uploadFiles(formData).toPromise();
        console.log('Upload response:', uploadResponse);
      }

      if (this.imgMainFile) {
        const fileName = uploadedImages[this.imgMainFile.name].split('.webp')[0];
        this.productForm.get('imgMain')?.setValue(fileName);
      }

      this.variantImgFiles.forEach((file, index) => {
        if (file) {
          const fileName = uploadedImages[file.name].split('.webp')[0];
          this.variants.at(index).get('img')?.setValue(fileName);
        }
      });

      const raw = this.productForm.value;
      const productData = {
        productName: raw.productName,
        price: raw.price,
        status: raw.status,
        categoryIds: [raw.parentCategoryId, ...raw.childCategoryIds],
        imgMain: raw.imgMain,
        variants: raw.variants
      };

      this.productService.addProduct(productData).subscribe({
        next: (res) => {
          console.log('Tạo sản phẩm thành công:', res);
          this.dialogRef.close(res);
        },
        error: (err) => {
          console.error('Lỗi khi tạo sản phẩm:', err);
          alert('Đã xảy ra lỗi khi tạo sản phẩm!');
        }
      });
    } catch (error) {
      console.error('Lỗi xử lý ảnh hoặc gửi yêu cầu:', error);
      alert('Đã xảy ra lỗi khi xử lý ảnh hoặc gửi yêu cầu!');
    }
  }

  private async convertToWebp(file: File, newName: string): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('Không thể tạo canvas context'));
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error('Không thể chuyển đổi file sang WebP'));
              resolve(new File([blob], newName, { type: 'image/webp' }));
            },
            'image/webp',
            0.9
          );
        };
        img.onerror = () => reject(new Error('Không thể tải ảnh'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Không thể đọc file'));
      reader.readAsDataURL(file);
    });
  }

  hasDuplicateColors(): boolean {
    const colors = this.variants.controls.map(v => v.get('color')?.value);
    return new Set(colors).size !== colors.length;
  }

  hasDuplicateSizes(): boolean {
    return this.variants.controls.some(variant => {
      const sizes = (variant.get('sizes') as FormArray).controls.map(c => c.get('size')?.value);
      return new Set(sizes).size !== sizes.length;
    });
  }

  getImageUrl(img: string): string {
    return `/img/${img}.webp`;
  }

  onParentCategoryChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const parentId = +selectElement.value;
    this.childCategories = this.categories.filter(c => c.parentId === parentId);
    this.productForm.get('childCategoryIds')?.setValue([]);
  }
  onParentCategorySelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedParentId = +selectElement.value;
    this.productForm.get('parentCategoryId')?.setValue(selectedParentId);
    this.childCategories = this.categories.filter(c => c.parentId === selectedParentId);
    this.productForm.get('childCategoryIds')?.setValue([]);
  }

}
