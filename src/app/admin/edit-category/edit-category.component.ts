import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Category, Color} from '../../shared/models/product.model';
import {CategoryService} from '../../services/category.service';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-edit-category',
  imports: [
    ReactiveFormsModule,
    NgForOf
  ],
  templateUrl: './edit-category.component.html'
})
export class EditCategoryComponent implements OnInit {
  categories : Category[] =[];
  form!: FormGroup;
  parentOptions = [
    { id: 1, name: 'Đồ Nam' },
    { id: 2, name: 'Đồ Nữ' },
    { id: 3, name: 'Đồ Bé Trai' },
    { id: 4, name: 'Đồ Bé Gái' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService : CategoryService,
    private dialogRef: MatDialogRef<EditCategoryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { category: any }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      categoryName: [this.data.category.categoryName, [Validators.required, Validators.minLength(2)]],
      parentId: [this.data.category.parentId]
    });
    const parentIds = [1, 2, 3, 4];
    if (parentIds.includes(this.data.category.id)) {
      this.form.get('parentId')?.disable();
    }
  }


  onSubmit() {
    if (this.form.invalid) return;
    const updatedCategory: Category = {
      ...this.data.category, // giữ nguyên các trường khác (như id, slug,... nếu có)
      categoryName: this.form.value.categoryName,
      parentId: this.form.value.parentId
    };
    this.categoryService.updateCategory(updatedCategory.id,updatedCategory).subscribe(() => {
      this.form.reset()
      alert('Chỉnh sauwr thành công')
      this.dialogRef.close(true);
    });

  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
