import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import {MatDialogRef} from '@angular/material/dialog';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-add-category',
  imports: [
    ReactiveFormsModule,
  CommonModule
  ],
  templateUrl: './add-category.component.html'
})
export class AddCategoryComponent implements OnInit {
  form!: FormGroup;

  parentOptions = [
    { id: 1, name: 'Đồ Nam' },
    { id: 2, name: 'Đồ Nữ' },
    { id: 3, name: 'Đồ Bé Trai' },
    { id: 4, name: 'Đồ Bé Gái' }
  ];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,public dialogRef: MatDialogRef<AddCategoryComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      categoryName: ['', [Validators.required, Validators.minLength(2)]],
      parentId: [null]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const categoryData = this.form.value;
    console.log('Gửi đi:', categoryData);

    this.categoryService.createCategory(categoryData).subscribe(() => {
      alert('Thêm danh mục thành công!');
      this.dialogRef.close();
      this.form.reset();
    });
  }
}
