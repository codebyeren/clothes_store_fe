import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {Product, Category, Color, SizeAdmin} from '../../shared/models/product.model';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../services/category.service';
import { ProductService } from '../../services/product.service';
import {ColorService} from '../../services/color.service';
import {SizeService} from '../../services/size.services';

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
  imgMainFile: File | null = null;
  sizes : SizeAdmin[] =[];
  variantFiles: { [variantIndex: number]: File } = {};
  colors: Color[] = [];
  categories: Category[] = [];
  parentCategories: Category[] = [];
  childCategories: Category[] = [];

  constructor(
    private fb: FormBuilder,
    private colorService: ColorService,
    private productService: ProductService,
    private sizeService :SizeService,
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
    this.loadSize()
  this.loadColors();
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
  loadSize() : void{
    this.sizeService.getAllSize().subscribe(data => {this.sizes=data})
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
  loadColors(): void {
    this.colorService.getAllColors().subscribe(data => this.colors = data);
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

    this.product.stockDetails.forEach((stock, index) => {
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
      if (stock.img) {
        this.imgPreviews[index] = this.getImageUrl(stock.img);
      }
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
    this.imgPreviews.push('');
  }

  removeStock(index: number): void {
    this.variants.removeAt(index);
    delete this.variantFiles[index];
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

  onFileSelected(event: Event, type: 'main' | 'variant', variantIndex?: number): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const previewUrl = reader.result as string;
      if (type === 'main') {
        this.imgMainFile = file;
        this.imgMainPreview = previewUrl;
      } else if (type === 'variant' && variantIndex !== undefined) {
        this.variantFiles[variantIndex] = file;
        this.imgPreviews[variantIndex] = previewUrl;
      }
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    if (this.productForm.invalid) {
      console.warn('Form không hợp lệ');
      this.productForm.markAllAsTouched();
      return;
    }

    try {
      const formData = new FormData();
      const uploadedImages: { [key: string]: string } = {};

      // Thêm ảnh chính
      if (this.imgMainFile) {
        const timestamp = Date.now();
        const name = this.imgMainFile.name.split('.').slice(0, -1).join('.');
        const newName = `${name}_${timestamp}.webp`;
        const webpFile = await this.convertToWebp(this.imgMainFile, newName);
        formData.append('files', webpFile); // Tên trường 'files' khớp với API
        uploadedImages[this.imgMainFile.name] = newName;
      }

      // Thêm ảnh biến thể
      for (const [variantIndexStr, file] of Object.entries(this.variantFiles)) {
        const variantIndex = Number(variantIndexStr);
        if (file) {
          const timestamp = Date.now();
          const name = file.name.split('.').slice(0, -1).join('.');
          const newName = `${name}_${timestamp}.webp`;
          const webpFile = await this.convertToWebp(file, newName);
          formData.append('files', webpFile); // Tên trường 'files' khớp với API
          uploadedImages[file.name] = newName;
        }
      }

      // Log FormData để debug
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value instanceof File ? value.name : value}`);
      }

      // Gửi file lên API
      let uploadedFileNames: string[] = [];
      if (formData.has('files')) {
        const uploadResponse = await this.productService.uploadFiles(formData).toPromise();
        console.log('Upload response:', uploadResponse);
        uploadedFileNames = uploadResponse.fileNames || Object.values(uploadedImages).map(name => name.split('.webp')[0]);
      }

      let imgMainName = this.productForm.get('imgMain')?.value;
      if (this.imgMainFile && uploadedImages[this.imgMainFile.name]) {
        imgMainName = uploadedImages[this.imgMainFile.name].split('.webp')[0];
      }

      const variants = this.productForm.get('variants')?.value || [];
      for (const [variantIndexStr, file] of Object.entries(this.variantFiles)) {
        const variantIndex = Number(variantIndexStr);
        if (file && uploadedImages[file.name]) {
          variants[variantIndex].img = uploadedImages[file.name].split('.webp')[0];
        }
      }

      // Chuẩn bị payload
      const raw = this.productForm.value;
      const payload = {
        productName: raw.productName,
        price: raw.price,
        status: raw.status,
        categoryIds: [raw.parentCategoryId, ...raw.childCategoryIds],
        imgMain: imgMainName,
        variants: variants
      };

      // Gửi dữ liệu cập nhật sản phẩm
      this.productService.updateProduct(this.product.id, payload).subscribe({
        next: res => {
          alert('Cập nhật sản phẩm thành công');
          this.dialogRef.close(res);
        },
        error: err => {
          console.error('Lỗi khi cập nhật sản phẩm:', err);
          alert('Lỗi khi cập nhật sản phẩm');
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
  onParentCategorySelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const selectedParentId = +selectElement.value;
    this.productForm.get('parentCategoryId')?.setValue(selectedParentId);
    this.childCategories = this.categories.filter(c => c.parentId === selectedParentId);
    this.productForm.get('childCategoryIds')?.setValue([]);
  }
}
