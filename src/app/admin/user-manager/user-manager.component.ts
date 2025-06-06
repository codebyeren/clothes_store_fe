import { Component } from '@angular/core';
import {DatePipe, NgForOf} from "@angular/common";
import {User} from '../../shared/models/product.model';
import {UserService} from '../../services/user.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MatDialog} from '@angular/material/dialog';
import {UserDetailComponent} from '../user-detail/user-detail.component';

@Component({
  selector: 'app-user-manager',
  imports: [
    NgForOf,
    DatePipe
  ],
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.css'
})
export class UserManagerComponent {
  users : User[] = [];
  constructor(private userService : UserService,
  public  dialog : MatDialog
  ) {
  }
  ngOnInit(): void {
   this.userService.getAllUsers().subscribe(data =>{
     this.users = data;
   })
  }
  openUserDetail(user: any) {
    this.dialog.open(UserDetailComponent, {
      data: { user },
      width: '50vw',
      height : '80vw'
    });
  }
}
