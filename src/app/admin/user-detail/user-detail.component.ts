import { Component, Inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import {DatePipe, NgIf} from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../shared/models/product.model';

@Component({
  selector: 'app-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
  imports: [
    DatePipe,
    NgIf
  ],
  providers: [DatePipe]
})
export class UserDetailComponent implements OnInit {
  user: User | null = null;

  constructor(
    private userService: UserService,
    private datePipe: DatePipe,
    public dialogRef: MatDialogRef<UserDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User }
  ) {
    this.user = data.user
  }

  ngOnInit(): void {

  }
}
