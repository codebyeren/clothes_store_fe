import { Component } from '@angular/core';
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
export class ForgetPasswordComponent {
  forgetPasswordForm: FormGroup;
  loading = false;
  submitted = false;
  error = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgetPasswordForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_-]*$/)
      ]],
      info: ['', [
        Validators.required,
        this.emailOrPhoneValidator()
      ]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$.!%*#?&]{6,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: [this.passwordMatchValidator]
    });
  }

  get f() {
    return this.forgetPasswordForm.controls;
  }

  emailOrPhoneValidator() {
    return (control: any): {[key: string]: any} | null => {
      const value = control.value;
      if (!value) return null;

      // Check if it's a valid email
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      // Check if it's a valid phone number (10 digits)
      const phonePattern = /^[0-9]{10}$/;

      if (!emailPattern.test(value) && !phonePattern.test(value)) {
        return { 'invalidFormat': true };
      }

      return null;
    };
  }

  passwordMatchValidator(g: FormGroup) {
    const newPassword = g.get('newPassword');
    const confirmPassword = g.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ 'passwordMismatch': true });
    } else {
      confirmPassword?.setErrors(null);
    }
    return null;
  }

  togglePasswordVisibility(field: 'newPassword' | 'confirmPassword'): void {
    if (field === 'newPassword') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.forgetPasswordForm.invalid) return;

    this.loading = true;
    this.error = '';
    this.successMessage = '';

    const { username, info, newPassword } = this.forgetPasswordForm.value;

    this.authService.resetPassword({
      username,
      info,
      newPassword
    }).subscribe({
      next: (message) => {
        this.successMessage = message;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (!control || !control.errors) return '';

    if (control.errors['required']) {
      return 'Trường này không được để trống';
    }
    if (control.errors['minlength']) {
      if (controlName === 'username') {
        return 'Tên đăng nhập phải có ít nhất 3 ký tự';
      }
      return 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    if (control.errors['pattern']) {
      if (controlName === 'username') {
        return 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch dưới và gạch ngang';
      }
      return 'Mật khẩu phải chứa ít nhất một chữ cái và một số';
    }
    if (control.errors['invalidFormat']) {
      return 'Vui lòng nhập email hợp lệ hoặc số điện thoại 10 chữ số';
    }
    if (control.errors['passwordMismatch']) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  }
} 