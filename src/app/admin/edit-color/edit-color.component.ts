import { Component, Inject, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Color } from '../../shared/models/product.model';
import { ColorService } from '../../services/color.service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-edit-color',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgForOf],
  templateUrl: './edit-color.component.html',
  styleUrls: ['./edit-color.component.css']
})
export class EditColorComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private colorService: ColorService,
    public dialogRef: MatDialogRef<EditColorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { color: Color }
  ) {}

  ngOnInit(): void {
    this.form = new FormGroup({
      color: new FormControl(this.data.color.color, [Validators.required, Validators.minLength(2)])
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const updatedColor: Color = {
      ...this.data.color,
      color: this.form.value.color
    };

    this.colorService.updateColor(updatedColor.id, updatedColor).subscribe(() => {
      this.form.reset()
      this.dialogRef.close(true);  // Đóng dialog và trả về true báo đã update thành công
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
