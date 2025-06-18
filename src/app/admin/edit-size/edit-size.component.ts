import {Component, Inject} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { SizeAdmin} from '../../shared/models/product.model';
import {SizeService} from '../../services/size.services';

@Component({
  selector: 'app-edit-size',
    imports: [
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './edit-size.component.html',
  styleUrl: './edit-size.component.css'
})
export class EditSizeComponent {
  form!: FormGroup;

  constructor(
    private sizeService: SizeService,
    public dialogRef: MatDialogRef<EditSizeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { size: SizeAdmin },
    private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      size: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  ngOnInit(): void {
    this.form = new FormGroup({
      size: new FormControl(this.data.size.size, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const updatedSizeValue = this.form.value.size?.trim() ?? '';
    if (!updatedSizeValue) {
      alert('Kích cỡ không được để trống');
      return;
    }

    this.sizeService.getAllSize().subscribe(sizes => {
      const exists = sizes.some(s =>
        s.size.toLowerCase() === updatedSizeValue.toLowerCase() &&
        s.id !== this.data.size.id
      );
      if (exists) {
        alert('Kích cỡ này đã tồn tại, vui lòng chọn kích cỡ khác.');
        return;
      }

      const updatedSize: SizeAdmin = {
        ...this.data.size,
        size: updatedSizeValue
      };

      this.sizeService.updateSize(updatedSize.id, updatedSize).subscribe(() => {
        this.form.reset();
        this.dialogRef.close(true);
      }, err => {
        alert('Lỗi khi cập nhật kích cỡ');
        console.error(err);
      });
    }, err => {
      alert('Lỗi khi lấy danh sách kích cỡ');
      console.error(err);
    });
  }


  onCancel() {
    this.dialogRef.close(false);
  }
}
