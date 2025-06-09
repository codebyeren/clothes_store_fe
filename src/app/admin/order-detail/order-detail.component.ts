import { Component, Inject } from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { NgIf } from '@angular/common';
import { Order } from '../../shared/models/order.model';
import {CurrencyPipe, DatePipe, formatDate, NgForOf} from '@angular/common';
import {RouterLink} from '@angular/router'; // Import đúng model

@Component({
  selector: 'app-order-detail',
  templateUrl: './order-detail.component.html',
  imports: [
    RouterLink,
    CurrencyPipe,
    NgForOf,
    DatePipe,NgIf
  ],
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent {
  order: Order;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { order: Order },
              private dialogRef: MatDialogRef<OrderDetailComponent>) {
    this.order = data.order;
  }

  protected readonly formatDate = formatDate;
  Close() : void{
    this.dialogRef.close()
  }
}
