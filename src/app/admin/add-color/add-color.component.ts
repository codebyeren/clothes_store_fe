import { Component, EventEmitter, Output } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { ColorService } from '../../services/color.service';
import { Color } from '../../shared/models/product.model';
import {NgIf} from '@angular/common';
import {MatDialogRef} from '@angular/material/dialog';


@Component({
  selector: 'app-add-color',
  templateUrl: './add-color.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  styleUrls: ['./add-color.component.css']  // chú ý là styleUrls chứ không phải styleUrl
})
export class AddColorComponent {
  @Output() addSuccess = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form = new FormGroup({
    color: new FormControl('', [Validators.required, Validators.minLength(2)])
  });

  constructor(private colorService: ColorService,
  public dialogRef: MatDialogRef<AddColorComponent>) {}

  onSubmit() {
    if (this.form.invalid) return;

    const colorName = this.form.value.color ?? '';

    this.colorService.checkColorExists(colorName).subscribe(exists => {
      if (exists) {
        alert("Màu này đã tồn tại!");
        return;
      }

      const newColor = { color: colorName };

      this.colorService.createColor(newColor).subscribe(() => {
        this.addSuccess.emit();
        alert("Thêm màu thành công");
        this.form.reset();
        this.dialogRef.close();
      });
    });
  }


  onCancel() {
    this.cancel.emit();
  }
}
