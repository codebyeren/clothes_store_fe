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
      size: this.form.value.size ?? ''
    };

    this.sizeService.createSize(newSize).subscribe(() => {
      this.addSuccess.emit();
      alert("Thêm màu thành công")

      this.form.reset();
      this.dialogRef.close();
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
