import { Component, OnInit } from '@angular/core';
import { Order, OrderStatus } from '../models/order.model';
import { OrderService } from '../services/order.service';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-user-orders',
  templateUrl: './user-orders.component.html',
  styleUrls: ['./user-orders.component.css']
})
export class UserOrdersComponent implements OnInit {
  orders: Order[] = [];
  isLoading: boolean = false;
  error: string = '';

  constructor(private orderService: OrderService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserOrders();
  }

  loadUserOrders(): void {
    this.isLoading = true;
    this.error = '';

    try {
      this.orderService.getUserOrders().subscribe({
        next: (orders) => {
          this.orders = orders;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Failed to load orders. Please try again.';
          this.isLoading = false;
          console.error('Error loading orders:', err);
        }
      });
    } catch (err) {
      this.error = 'Authentication required. Please log in.';
      this.isLoading = false;
    }
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Processing:
        return 'Processing';
      case OrderStatus.Confirmed:
        return 'Confirmed';
      case OrderStatus.Shipped:
        return 'Shipped';
      case OrderStatus.Delivered:
        return 'Delivered';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Processing:
        return 'status-processing';
      case OrderStatus.Confirmed:
        return 'status-confirmed';
      case OrderStatus.Shipped:
        return 'status-shipped';
      case OrderStatus.Delivered:
        return 'status-delivered';
      case OrderStatus.Cancelled:
        return 'status-cancelled';
      default:
        return 'status-unknown';
    }
  }
}
