// import { Component, OnInit } from '@angular/core';
// import { FormBuilder, FormGroup, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
// import { AuthService } from '../../services/auth.service';
// import { CommonModule } from '@angular/common';
// import { ReactiveFormsModule } from '@angular/forms';

// @Component({
//   selector: 'app-verify-phone',
//   templateUrl: './verify-phone.component.html',
//   styleUrls: ['./verify-phone.component.css'],
//   standalone: true,
//   imports: [CommonModule, ReactiveFormsModule]
// })
// export class VerifyPhoneComponent implements OnInit {
//   verifyForm: FormGroup;
//   submitted = false;
//   loading = false;
//   error: string | null = null;
//   username: string = '';
//   phone: string = '';

//   constructor(
//     private formBuilder: FormBuilder,
//     private authService: AuthService,
//     private router: Router,
//     private route: ActivatedRoute
//   ) {
//     this.verifyForm = this.formBuilder.group({
//       verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
//     });
//   }

//   ngOnInit(): void {
//     this.route.queryParams.subscribe(params => {
//       this.username = params['username'];
//       this.phone = params['phone'];
//       if (!this.username || !this.phone) {
//         this.router.navigate(['/auth/forget-password']);
//       }
//     });
//   }

//   get f() { return this.verifyForm.controls; }

//   getErrorMessage(controlName: string): string {
//     const control = this.f[controlName];
//     if (control.hasError('required')) {
//       return 'Vui lòng nhập mã xác minh';
//     }
//     if (control.hasError('minlength') || control.hasError('maxlength')) {
//       return 'Mã xác minh phải có 6 ký tự';
//     }
//     return '';
//   }

//   onSubmit() {
//     this.submitted = true;
//     this.error = null;

//     if (this.verifyForm.invalid) {
//       return;
//     }

//     this.loading = true;
//     this.authService.verifyPhoneCode(this.username, this.phone, this.f['verificationCode'].value).subscribe({
//       next: () => {
//         this.router.navigate(['/auth/reset-password'], {
//           queryParams: { username: this.username, phone: this.phone }
//         });
//       },
//       error: (error) => {
//         this.error = error.error?.message || 'Mã xác minh không đúng. Vui lòng thử lại.';
//         this.loading = false;
//       }
//     });
//   }

//   resendCode() {
//     this.loading = true;
//     this.error = null;
//     this.authService.sendVerificationCode(this.username, this.phone).subscribe({
//       next: () => {
//         this.error = null;
//         this.loading = false;
//       },
//       error: (error) => {
//         this.error = error.error?.message || 'Không thể gửi lại mã xác minh. Vui lòng thử lại.';
//         this.loading = false;
//       }
//     });
//   }
// }
