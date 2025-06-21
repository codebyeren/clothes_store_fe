// register.component.ts
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class RegisterComponent {
  registerForm!: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';
  submitted = false;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phoneNumber: ['', [
        Validators.required, 
        Validators.pattern(/^[0-9]{10}$/)
      ]],
      email: ['', [
        Validators.required, 
        Validators.email
      ]],
      address: ['', [Validators.required]],
      dob: ['', [
        Validators.required,
        this.dateValidator()
      ]],
      username: ['', [
        Validators.required, 
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-Z0-9_-]*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$.!%*#?&]{6,}$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });

    // Subscribe to value changes to show validation errors in real-time
    this.registerForm.valueChanges.subscribe(() => {
      if (this.submitted) {
        Object.keys(this.registerForm.controls).forEach(key => {
          const control = this.registerForm.get(key);
          if (control) {
            control.markAsTouched();
          }
        });
      }
    });
  }

  private dateValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const dob = new Date(control.value);
      const today = new Date();
      
      // Check if it's a valid date
      if (isNaN(dob.getTime())) {
        return { invalidDate: true };
      }

      // Calculate age
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      // Validation rules
      if (age < 10) {
        return { tooYoung: true };
      }
      if (age > 100) {
        return { tooOld: true };
      }
      if (dob > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  get f() {
    return this.registerForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (!control || (!control.errors && !this.registerForm.errors)) return '';

    const errors = control.errors || {};
    const fieldNames: { [key: string]: string } = {
      firstName: 'Họ',
      lastName: 'Tên',
      phoneNumber: 'Số điện thoại',
      email: 'Email',
      address: 'Địa chỉ',
      dob: 'Ngày sinh',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu'
    };

    const fieldName = fieldNames[controlName] || controlName;

    if (errors['required']) return `${fieldName} không được để trống`;
    if (errors['email']) return 'Email không hợp lệ';
    if (errors['pattern']) {
      switch (controlName) {
        case 'phoneNumber':
          return 'Số điện thoại phải có 10 chữ số';
        case 'email':
          return 'Email không đúng định dạng';
        case 'username':
          return 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới';
        case 'password':
          return 'Mật khẩu phải chứa ít nhất một chữ hoa, một chữ thường, một số và một ký tự đặc biệt';
        default:
          return `${fieldName} không hợp lệ`;
      }
    }
    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `${fieldName} phải có ít nhất ${requiredLength} ký tự`;
    }
    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `${fieldName} không được vượt quá ${requiredLength} ký tự`;
    }
    if (controlName === 'dob') {
      if (errors['invalidDate']) return 'Ngày sinh không hợp lệ';
      if (errors['tooYoung']) return 'Bạn phải đủ 10 tuổi để đăng ký';
      if (errors['tooOld']) return 'Ngày sinh không hợp lệ (tuổi tối đa là 100)';
      if (errors['futureDate']) return 'Ngày sinh không thể là ngày trong tương lai';
    }
    if (controlName === 'confirmPassword' && 
        (errors['passwordMismatch'] || this.registerForm.errors?.['passwordMismatch'])) {
      return 'Mật khẩu xác nhận không khớp';
    }
    return '';
  }

  onSubmit() {
    this.submitted = true;
    
    // Mark all fields as touched to trigger validation display
    Object.keys(this.f).forEach(key => {
      const control = this.f[key];
      control.markAsTouched();
    });

    if (this.registerForm.invalid) {
      // Show error message using toastr
      this.toastr.error('Vui lòng điền đầy đủ thông tin và sửa các lỗi.', 'Lỗi');
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = {
      ...this.registerForm.value,
      confirmPassword: undefined
    };
    delete userData.confirmPassword;

    this.authService.register(userData).subscribe({
      next: (res) => {
        this.successMessage = 'Đăng ký thành công!';
        this.toastr.success('Đăng ký thành công!', 'Thành công');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (err) => {
        // Display database error message using toastr
        const errorMessage = err.error?.message || err.message || 'Đăng ký thất bại. Vui lòng thử lại!';
        this.toastr.error(errorMessage, 'Lỗi đăng ký');
        this.errorMessage = errorMessage;
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirm'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }
}
