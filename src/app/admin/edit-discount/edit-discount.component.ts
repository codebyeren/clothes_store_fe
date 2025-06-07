import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { DiscountService} from '../../services/discounts.service';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {Product} from '../../shared/models/product.model';
import {NgIf} from '@angular/common';
import {Discount} from '../../shared/models/discount.model';

@Component({
  selector: 'app-edit-discount',
  imports: [
    NgIf,
    ReactiveFormsModule
  ],
  templateUrl: './edit-discount.component.html',
  styleUrl: './edit-discount.component.css'
})
export class EditDiscountComponent {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountService,
    private dialogRef: MatDialogRef<EditDiscountComponent>,
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



    this.discountService.updateDiscount(this.data.product.id,newDiscount).subscribe(() => {
      alert('Sửa khuyến mãi thành công');
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
