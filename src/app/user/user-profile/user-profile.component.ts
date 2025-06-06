import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, UserSidebarComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
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
