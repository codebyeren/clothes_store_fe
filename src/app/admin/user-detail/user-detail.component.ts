import { Component, Inject, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DatePipe, NgIf } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../shared/models/product.model';

// Angular Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.css'],
  imports: [
    DatePipe,
    NgIf,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
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
    this.user = data.user;
  }

  ngOnInit(): void {}
}
