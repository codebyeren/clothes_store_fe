import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userForm!: FormGroup;
  user: any = {};
  submitted = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  isEditMode = false;
  dateFormatPipe = new DateFormatPipe();

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
    this.disableForm();
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
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
      birthday: ['', [
        Validators.required,
        this.dateValidator()
      ]]
    });
  }

  private dateValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return { invalidDate: true };
      }

      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
        age--;
      }

      if (age < 10) {
        return { tooYoung: true };
      }
      if (age > 100) {
        return { tooOld: true };
      }
      if (date > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  private disableForm(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.disable();
    });
  }

  private enableForm(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      this.userForm.get(key)?.enable();
    });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (this.isEditMode) {
      this.enableForm();
    } else {
      this.disableForm();
      this.loadUserData();
    }
  }

  private loadUserData(): void {
    this.userService.getUserInfo().subscribe(data => {
      this.user = data.data;
      this.userForm.patchValue({
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phoneNumber: this.user.phoneNumber,
        email: this.user.email,
        address: this.user.address,
        birthday: this.dateFormatPipe.transform(this.user.birthday, 'input')
      });
    });
  }

  get f() {
    return this.userForm.controls;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  getErrorMessage(controlName: string): string {
    const control = this.f[controlName];
    if (!control || !control.errors) return '';

    const errors = control.errors;
    const fieldNames: { [key: string]: string } = {
      firstName: 'Họ',
      lastName: 'Tên',
      phoneNumber: 'Số điện thoại',
      email: 'Email',
      address: 'Địa chỉ',
      birthday: 'Ngày sinh'
    };

    const fieldName = fieldNames[controlName] || controlName;

    if (errors['required']) return `${fieldName} không được để trống`;
    if (errors['email']) return 'Email không hợp lệ';
    if (errors['pattern']) {
      if (controlName === 'phoneNumber') {
        return 'Số điện thoại phải có 10 chữ số';
      }
      return `${fieldName} không hợp lệ`;
    }
    if (controlName === 'birthday') {
      if (errors['invalidDate']) return 'Ngày sinh không hợp lệ';
      if (errors['tooYoung']) return 'Bạn phải đủ 10 tuổi';
      if (errors['tooOld']) return 'Ngày sinh không hợp lệ (tuổi tối đa là 100)';
      if (errors['futureDate']) return 'Ngày sinh không thể là ngày trong tương lai';
    }
    return '';
  }

  saveUserInfo(): void {
    this.submitted = true;
    
    if (this.userForm.invalid) {
      this.toastr.error('Vui lòng điền đầy đủ thông tin và sửa các lỗi.', 'Lỗi');
      return;
    }
  
    this.loading = true;
  
    const userData = this.userForm.value;
    userData.birthday = new Date(userData.birthday);
  
    this.userService.updateUserInfo(userData).subscribe({
      next: (response) => {
        this.toastr.success('Cập nhật thông tin thành công!', 'Thành công');
        this.loading = false;
        this.isEditMode = false;
        this.disableForm();
      },
      error: (error) => {
        this.toastr.error(error.error?.message || 'Đã xảy ra lỗi khi cập nhật thông tin.', 'Lỗi');
        this.loading = false;
      }
    });
  }

  getMaxDate(): string {
    return this.dateFormatPipe.transform(new Date(), 'input');
  }
}
