import { Component, Inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogTitle,
  MatDialogContent
} from '@angular/material/dialog';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrderService} from '../../services/order.service';
import {MatButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/input';
import {MatOption} from '@angular/material/core';
import {MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-edit-status-order',
  templateUrl: './edit-status-order.component.html',
  imports: [
    MatFormField,
    ReactiveFormsModule,
    MatDialogActions,
    MatDialogTitle,
    MatDialogContent,
    MatButton,
    MatFormField,
    MatLabel,
    MatOption,
    MatSelect
  ],
  styleUrls: ['./edit-status-order.component.css']
})
export class EditStatusOrderComponent {
  statusForm: FormGroup;
  statusOptions: string[] = ['Pending', 'Completed', 'Cancelled'];

  constructor(
    private dialogRef: MatDialogRef<EditStatusOrderComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { order: any },
    private fb: FormBuilder,
    private orderService : OrderService
  ) {
    this.statusForm = this.fb.group({
      status: [data.order?.status || '', Validators.required]
    });
  }

  onSave(): void {
    if (this.statusForm.valid) {
      const newStatus = this.statusForm.value.status;
      const orderId = this.data.order.id;

      this.orderService.updateStatus(orderId, newStatus).subscribe({
        next: (response) => {
          console.log('Cập nhật trạng thái thành công:', response);
          this.dialogRef.close(newStatus); // Gửi status mới về component cha
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật trạng thái:', err);
        }
      });
    }
  }


  onCancel(): void {
    this.dialogRef.close(null);
  }
}
