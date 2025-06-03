import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-user-profile',
  imports: [FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent {
  user: any = {}; // Define a user property

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getUserInfo().subscribe(data => {
      this.user = data.data; // Assuming the user data is in the 'data' property of the API response
    });
  }

  saveUserInfo(): void {
    const confirmUpdate = confirm('Bạn có chắc chắn muốn cập nhật thông tin?');

    if (confirmUpdate) {
      this.userService.updateUserInfo(this.user).subscribe(response => {
        console.log('User updated successfully:', response);
        alert('Cập nhật thông tin thành công!'); 
      }, error => {
        console.error('Error updating user:', error);
        alert('Đã xảy ra lỗi khi cập nhật thông tin.'); 
      })
    }
  }
}
