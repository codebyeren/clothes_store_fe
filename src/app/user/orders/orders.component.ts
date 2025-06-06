import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserSidebarComponent } from '../../components/user-sidebar/user-sidebar.component';
import { OrderService } from '../../services/order.service';
import { UserService } from '../../services/user.service';
import { Order } from '../../shared/models/order.model';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, UserSidebarComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  user: any = {};
  loading: boolean = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Load user info for sidebar
    this.userService.getUserInfo().subscribe(data => {
      this.user = data.data;
    });

    // Load orders
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.orderService.getOrders().subscribe({
      next: response => {
        if (response.code === 200) {
          this.orders = response.data;
        } else {
          this.error = response.message || 'Failed to load orders';
          console.error('Error loading orders:', response.message);
        }
        this.loading = false;
      },
      error: err => {
        this.error = 'Failed to load orders';
        console.error('HTTP error loading orders:', err);
        this.loading = false;
      }
    });
  }

  cancelOrder(order: Order): void {
    if (order.status.toLowerCase() !== 'pending') {
      console.warn('Attempted to cancel a non-pending order.');
      return;
    }

    this.loading = true;
    this.error = null;

    this.orderService.cancelOrder(order.id).subscribe({
      next: response => {
        if (response.code === 200) {
          console.log(`Order #${order.id} cancelled successfully.`, response);
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index].status = 'Cancelled';
          }
        } else {
          this.error = response.message || `Failed to cancel order #${order.id}`;
          console.error(`Error cancelling order #${order.id}:`, response.message);
        }
        this.loading = false;
      },
      error: err => {
        this.error = `Failed to cancel order #${order.id}`;
        console.error(`HTTP error cancelling order #${order.id}:`, err);
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
} 