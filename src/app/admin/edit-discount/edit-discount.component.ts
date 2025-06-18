import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DiscountService } from '../../services/discounts.service';
import { Discount } from '../../shared/models/discount.model';
import { Product } from '../../shared/models/product.model';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-edit-discount',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule],
  templateUrl: './edit-discount.component.html',
  styleUrl: './edit-discount.component.css'
})
export class EditDiscountComponent implements OnInit {
  form!: FormGroup;
  currentDiscount!: Discount | null;

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountService,
    private dialogRef: MatDialogRef<EditDiscountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      productId: [this.data.product.id, Validators.required],
      discountPercent: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      startSale: [null, Validators.required],
      endSale: [null, Validators.required]
    });

    // Gọi tất cả discount và tìm theo productId
    this.discountService.getALlDisCount().subscribe((discounts) => {
      const found = discounts.find(d => d.productId === this.data.product.id);
      if (found) {
        this.currentDiscount = found;

        this.form.patchValue({
          discountPercent: found.discountPercent,
          startSale: found.startSale?.split('T')[0],
          endSale: found.endSale?.split('T')[0]
        });
      } else {
        alert('Không tìm thấy khuyến mãi cho sản phẩm này.');
        this.dialogRef.close();
      }
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const raw = this.form.value;

    const startDate = new Date(raw.startSale);
    const endDate = new Date(raw.endSale);

    if (endDate <= startDate) {
      alert('Ngày kết thúc phải sau ngày bắt đầu.');
      return;
    }

    const updatedDiscount: Partial<Discount> = {
      productId: this.data.product.id,
      discountPercent: raw.discountPercent,
      startSale: this.toISOStringWithTimezone(raw.startSale, false),
      endSale: this.toISOStringWithTimezone(raw.endSale, true)
    };

    this.discountService.updateDiscount(this.data.product.id, updatedDiscount).subscribe(() => {
      alert('Cập nhật khuyến mãi thành công!');
      this.dialogRef.close(true);
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  toISOStringWithTimezone(dateString: string, isEndOfDay: boolean): string {
    const date = new Date(dateString);
    if (isEndOfDay) {
      date.setHours(23, 59, 59, 0);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    const offsetMs = 7 * 60 * 60 * 1000; // +07:00 timezone offset
    const localDate = new Date(date.getTime() - offsetMs);
    const iso = localDate.toISOString().slice(0, -1); // remove 'Z'
    return `${iso}+07:00`;
  }
}
