import { Component } from '@angular/core';
import { NgForOf } from '@angular/common';
import { Category } from '../../shared/models/product.model';
import { CategoryService } from '../../services/category.service';
import { MatDialog } from '@angular/material/dialog';
import { AddCategoryComponent } from '../add-category/add-category.component';
import { EditCategoryComponent } from '../edit-category/edit-category.component';

@Component({
  selector: 'app-category-manager',
  imports: [NgForOf],
  templateUrl: './category-manager.component.html',
  styleUrl: './category-manager.component.css'
})
export class CategoryManagerComponent {
  categories: Category[] = [];

  currentPage: number = 1;
  itemsPerPage: number = 10;

  constructor(
    private categoryService: CategoryService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe(data => {
      this.categories = data;
    });
  }

  get paginatedCategories(): Category[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.categories.slice(start, end);
  }

  get totalPages(): number {
    return Math.ceil(this.categories.length / this.itemsPerPage);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  openAddCate(): void {
    const dialogRef = this.dialog.open(AddCategoryComponent, {
      width: '50vw',
    });

    dialogRef.afterClosed().subscribe(() => this.loadCategories());
  }

  openUpdateCate(category: any): void {
    const dialogRef = this.dialog.open(EditCategoryComponent, {
      width: '50vw',
      data: { category }
    });

    dialogRef.afterClosed().subscribe(() => this.loadCategories());
  }

  deleteCate(id: number): void {
    if (confirm('Bạn có chắc muốn xoá danh mục này không?')) {
      this.categoryService.deleteCategory(id).subscribe(() => {
        this.loadCategories();
      });
    }
  }
}
