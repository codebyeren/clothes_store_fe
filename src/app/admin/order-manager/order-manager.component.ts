import { Component, OnInit } from '@angular/core';
import {  OrderService } from '../../services/order.service';
import {CurrencyPipe, DatePipe, NgClass, NgForOf, NgIf} from '@angular/common';
import {MatDialog} from '@angular/material/dialog';
import {EditStatusOrderComponent} from '../edit-status-order/edit-status-order.component';
import { Order } from '../../shared/models/order.model';
import {UserService} from '../../services/user.service';
import {forkJoin} from 'rxjs';
import {log} from '@angular-devkit/build-angular/src/builders/ssr-dev-server';
import {Product} from '../../shared/models/product.model';
import {ProductDetailComponent} from '../product-detail/product-detail.component';
import {OrderDetailComponent} from '../order-detail/order-detail.component';

@Component({
  selector: 'app-order-manager',
  templateUrl: './order-manager.component.html',
  imports: [
    CurrencyPipe,
    DatePipe,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./order-manager.component.css']
})
export class OrderManagerComponent implements OnInit {
  orders: Order[] = [];
  userMap: { [key: number]: string } = {};


  constructor(private orderService: OrderService,
              private userService : UserService,
              public dialog: MatDialog) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrder().subscribe({
      next: (data) => {
        this.orders = data;


        const uniqueUserIds = [...new Set(this.orders.map(order => order.userId).filter(id => !!id))];

        const userObservables = uniqueUserIds.map(userId =>
          this.userService.getById(userId)

        );

        forkJoin(userObservables).subscribe(users => {
          users.forEach((userResponse, index) => {
            const userId = uniqueUserIds[index]; // Lấy id từ mảng ban đầu
            const userData = userResponse.data;

            if (userData && userData.lastName) {
              this.userMap[userId] = userData.lastName + " " +  userData.firstName;
            }
          });
        });
      },
      error: (err) => {
        console.error('Lỗi khi tải đơn hàng:', err);
      }
    });
  }
  openOrderDetail(order: Order) {
    const dialogRef = this.dialog.open(OrderDetailComponent, {
      data: { order },
      width: '50vw',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.loadOrders();

    });
  }
  getTotalQuantity(order: Order): number {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  }

  updateStatus(order : Order) {
   const pop =  this.dialog.open(EditStatusOrderComponent, {
      width: '50vw',
      maxHeight: '80vh',
      data : {order}
    });
    pop.afterClosed().subscribe(() => this.loadOrders());
  }
  cancelOrder(orderId: number): void {
    if (!confirm('Bạn có chắc muốn hủy đơn hàng này không?')) return;

    this.orderService.cancelOrder(orderId).subscribe({
      next: (res) => {
        alert('Đã hủy đơn hàng thành công!');
        this.loadOrders();
      },
      error: (err) => {
        console.error('Lỗi khi hủy đơn hàng:', err);
        alert('Không thể hủy đơn hàng.');
      }
    });
  }
}
