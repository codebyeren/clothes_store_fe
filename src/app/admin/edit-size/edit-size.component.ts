import {Component, Inject} from '@angular/core';
import {NgIf} from "@angular/common";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";

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
    @Inject(MAT_DIALOG_DATA) public data: { size: SizeAdmin }
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      size: new FormControl(this.data.size.size, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const updatedSize: SizeAdmin = {
      ...this.data.size,
      size: this.form.value.size
    };

    this.sizeService.updateSize(updatedSize.id, updatedSize).subscribe(() => {
      this.form.reset()
      this.dialogRef.close(true);
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
