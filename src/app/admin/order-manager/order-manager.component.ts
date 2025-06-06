import { Component, OnInit } from '@angular/core';
import { Order, OrderService } from '../../services/order.service';
import {CurrencyPipe, DatePipe, NgClass, NgForOf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EditStatusOrderComponent} from '../edit-status-order/edit-status-order.component';

@Component({
  selector: 'app-order-manager',
  templateUrl: './order-manager.component.html',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgForOf
  ],
  styleUrls: ['./order-manager.component.css']
})
export class OrderManagerComponent implements OnInit {
  orders: Order[] = [];

  constructor(private orderService: OrderService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrder().subscribe({
      next: (data) => {
        this.orders = data;
        console.log('Danh sách đơn hàng:', this.orders);
      },
      error: (err) => {
        console.error('Lỗi khi tải đơn hàng:', err);
      }
    });
  }


  updateStatus(order : Order) {
    this.dialog.open(EditStatusOrderComponent, {
      width: '50vw',
      height: '80vh',
      data : {order}
    });
  }
  cancelOrder(orderId: number): void {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;

    this.orderService.cancelOrder(orderId).subscribe({
      next: (res) => {
        alert('Đã hủy đơn hàng thành công!');
        this.loadOrders(); // Refresh danh sách sau khi hủy
      },
      error: (err) => {
        console.error('Lỗi khi hủy đơn hàng:', err);
        alert('Không thể hủy đơn hàng.');
      }
    });
  }
}
