import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class VerifyEmailComponent implements OnInit {
  verifyForm: FormGroup;
  submitted = false;
  loading = false;
  error: string | null = null;
  email: string = '';
  successMessage: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.verifyForm = this.formBuilder.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
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

  get f() { return this.verifyForm.controls; }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (control.hasError('required')) {
      return 'Vui lòng nhập mã xác minh';
    }
    if (control.hasError('minlength') || control.hasError('maxlength')) {
      return 'Mã xác minh phải có 6 ký tự';
    }
    return '';
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;
    this.successMessage = null;
    if (this.verifyForm.invalid) {
      return;
    }
    this.loading = true;
    this.authService.verifyCode(this.email, this.f['verificationCode'].value).subscribe({
      next: (res) => {
        this.successMessage = res.message;
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], {
            queryParams: { email: this.email }
          });
        }, 1000);
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  resendCode() {
    this.loading = true;
    this.error = null;
    this.authService.sendResetCode(this.email).subscribe({
      next: () => {
        this.error = null;
        this.loading = false;
      },
      error: (error) => {
        this.error = error.error?.message || 'Không thể gửi lại mã xác minh. Vui lòng thử lại.';
        this.loading = false;
      }
    });
  }
}
