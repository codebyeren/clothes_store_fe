import {Component, EventEmitter, Output} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ColorService} from '../../services/color.service';
import {MatDialogRef} from '@angular/material/dialog';
import {SizeService} from '../../services/size.services';

@Component({
  selector: 'app-add-size',
    imports: [
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './add-size.component.html',
  styleUrl: './add-size.component.css'
})
export class AddSizeComponent {
  @Output() addSuccess = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form = new FormGroup({
    size: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  constructor(private sizeService: SizeService,
              public dialogRef: MatDialogRef<AddSizeComponent>) {}

  onSubmit() {
    if (this.form.invalid) {
      return;
    }

    const newSize = {
      size: this.form.value.size?.trim() ?? ''
    };

    if (!newSize.size) {
      alert('Kích cỡ không được để trống');
      return;
    }

    // Kiểm tra size đã tồn tại chưa
    this.sizeService.getAllSize().subscribe(sizes => {
      const exists = sizes.some(s => s.size.toLowerCase() === newSize.size.toLowerCase());
      if (exists) {
        alert('Kích cỡ này đã tồn tại, vui lòng chọn kích cỡ khác.');
        return;
      }

      // Nếu chưa tồn tại mới gọi tạo
      this.sizeService.createSize(newSize).subscribe(() => {
        this.addSuccess.emit();
        alert("Thêm kích cỡ thành công");

        this.form.reset();
        this.dialogRef.close();
      }, err => {
        alert('Lỗi khi thêm kích cỡ');
        console.error(err);
      });
    }, err => {
      alert('Lỗi khi lấy danh sách kích cỡ');
      console.error(err);
    });
  }


  onCancel() {
    this.cancel.emit();
  }

}
