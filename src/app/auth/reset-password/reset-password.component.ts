import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  showPassword = false;
  showConfirmPassword = false;
  email: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.resetForm = this.formBuilder.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$.!%*#?&]{6,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.router.navigate(['/auth/forget-password']);
      }
    });
  }

  get f() { return this.resetForm.controls; }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (control.hasError('required')) {
      return 'Vui lòng nhập thông tin này';
    }
    if (control.hasError('minlength')) {
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (control.hasError('pattern')) {
      return 'Mật khẩu phải chứa ít nhất một chữ cái và một số';
    }
    if (control.hasError('passwordMismatch')) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  }

  togglePasswordVisibility(field: string) {
    if (field === 'newPassword') {
      this.showPassword = !this.showPassword;
    } else if (field === 'confirmPassword') {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    this.successMessage = null;
    if (this.resetForm.invalid) {
      return;
    }
    this.loading = true;
    this.authService.resetPassword(this.email, this.f['newPassword'].value).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }
}
