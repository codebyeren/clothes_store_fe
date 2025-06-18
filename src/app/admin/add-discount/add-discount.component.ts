import {Component, Inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { DiscountService} from '../../services/discounts.service';
import {NgIf} from '@angular/common';
import {Product} from '../../shared/models/product.model';
import { Discount } from '../../shared/models/discount.model';

@Component({
  selector: 'app-add-discount',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './add-discount.component.html',
  styleUrls: ['./add-discount.component.css'],
})
export class AddDiscountComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountService,
    private dialogRef: MatDialogRef<AddDiscountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      productId: [this.data.product.id, [Validators.required]],
      discountPercent: [null, [Validators.required, Validators.min(1), Validators.max(100)]],
      startSale: [null, Validators.required],
      endSale: [null, Validators.required]
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

    const newDiscount: Partial<Discount> = {
      productId: this.data.product.id,
      discountPercent: raw.discountPercent,
      startSale: this.toISOStringWithTimezone(raw.startSale, false),
      endSale: this.toISOStringWithTimezone(raw.endSale, true)
    };

    console.log('JSON gửi đi:', newDiscount);

    this.discountService.createDiscount(newDiscount).subscribe(() => {
      alert('Thêm khuyến mãi thành công');
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
    const tzOffset = 7 * 60;
    const offsetMs = tzOffset * 60 * 1000;
    const localDate = new Date(date.getTime() - offsetMs);

    const iso = localDate.toISOString().slice(0, -1); // remove 'Z'
    return `${iso}+07:00`;
  }


}
