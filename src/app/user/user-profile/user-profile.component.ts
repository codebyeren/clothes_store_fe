import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';
import { DateFormatPipe } from '../../shared/pipes/date-format.pipe';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UserSidebarComponent, DateFormatPipe],
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
  private dateFormatPipe = new DateFormatPipe();

  constructor(
    private userService: UserService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadUserData();
    this.setupDateFormatting();
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
      this.loadUserData(); // Reload data to reset form
    }
  }

  private dateValidator(): ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthday = new Date(control.value);
      const today = new Date();
      
      if (isNaN(birthday.getTime())) {
        return { invalidDate: true };
      }

      let age = today.getFullYear() - birthday.getFullYear();
      const monthDiff = today.getMonth() - birthday.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
        age--;
      }

      if (age < 10) {
        return { tooYoung: true };
      }
      if (age > 100) {
        return { tooOld: true };
      }
      if (birthday > today) {
        return { futureDate: true };
      }

      return null;
    };
  }

  private setupDateFormatting(): void {
    this.userForm.get('birthday')?.valueChanges.subscribe(value => {
      if (value && typeof value === 'string' && !value.includes('/')) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          const formattedDate = this.dateFormatPipe.transform(date);
          this.userForm.get('birthday')?.setValue(formattedDate, { emitEvent: false });
        }
      }
    });
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
        birthday: this.dateFormatPipe.transform(this.user.birthday)
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
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin và sửa các lỗi.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const userData = this.userForm.value;
    if (userData.birthday) {
      const [day, month, year] = userData.birthday.split('/');
      userData.birthday = new Date(year, month - 1, day);
    }

    this.userService.updateUserInfo(userData).subscribe({
      next: (response) => {
        this.successMessage = 'Cập nhật thông tin thành công!';
        this.loading = false;
        this.isEditMode = false;
        this.disableForm();
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Đã xảy ra lỗi khi cập nhật thông tin.';
        this.loading = false;
      }
    });
  }
}
