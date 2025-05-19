import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class ForgetPasswordComponent implements OnInit {
  forgetPasswordForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  successMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.forgetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {}

  get f() { return this.forgetPasswordForm.controls; }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (control.hasError('required')) {
      return 'Vui lòng nhập email';
    }
    if (control.hasError('email')) {
      return 'Email không hợp lệ';
    }
    return '';
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    this.successMessage = '';
    if (this.forgetPasswordForm.invalid) {
      return;
    }
    this.loading = true;
    const email = this.f['email'].value;
    this.authService.sendResetCode(email).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        setTimeout(() => {
          this.router.navigate(['/auth/verify-email'], { queryParams: { email } });
        }, 1000);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
} 