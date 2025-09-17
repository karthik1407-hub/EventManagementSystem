import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TicketService } from '../services/ticket.service';
import { Ticket } from '../models/ticket.model';
import { AuthService } from 'src/app/auth.service';
import { Order, OrderStatus } from '../../user/models/order.model';
import { OrderService } from '../../user/services/order.service';

@Component({
  selector: 'app-my-ticket',
  templateUrl: './my-ticket.component.html',
  styleUrls: ['./my-ticket.component.css']
})
export class MyTicketComponent implements OnInit {
  ticketId: string | null = null;
  ticket: Ticket | undefined;
  errorMessage: string = '';
  orders: Order[] = [];
  isLoading: boolean = false;
  error: string = '';
  selectedOrder: Order | null = null;
  showStatusModal: boolean = false;

  orderStatuses = [
    { value: OrderStatus.Booked, label: 'Booked' },
    { value: OrderStatus.Cancelled, label: 'Cancelled' },
    { value: OrderStatus.EventEnded, label: 'Event Ended' }
  ];

  constructor(
    private route: ActivatedRoute,
    private ticketService: TicketService,
    private authService: AuthService,
    private orderService: OrderService
  ) { }

  ngOnInit(): void {
    this.loadAllOrders();

    this.route.paramMap.subscribe(params => {
      this.ticketId = params.get('ticketId');
      if (this.ticketId) {
        this.loadTicket();
      }
    });
  }

  loadAllOrders(): void {
    this.isLoading = true;
    this.error = '';

    try {
      this.orderService.getAllOrders().subscribe({
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
      this.error = 'Authentication required. Please log in as admin.';
      this.isLoading = false;
    }
  }

  openStatusModal(order: Order): void {
    this.selectedOrder = order;
    this.showStatusModal = true;
  }

  closeStatusModal(): void {
    this.selectedOrder = null;
    this.showStatusModal = false;
  }

  updateOrderStatus(orderId: string, newStatus: OrderStatus): void {
    if (!this.selectedOrder) return;

    this.isLoading = true;

    this.orderService.updateOrderStatus(orderId, newStatus).subscribe({
      next: () => {
        // Update the order in the local array
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          this.orders[orderIndex].status = newStatus;
          this.orders[orderIndex].statusString = this.getStatusText(newStatus);
        }
        this.closeStatusModal();
        this.isLoading = false;
        alert('Order status updated successfully!');
        // Notify user orders component to refresh
        window.dispatchEvent(new CustomEvent('orderStatusUpdated'));
      },
      error: (err) => {
        this.error = 'Failed to update order status. Please try again.';
        this.isLoading = false;
        console.error('Error updating order status:', err);
      }
    });
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Booked:
        return 'Booked';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      case OrderStatus.EventEnded:
        return 'Event Ended';
      // default:
      //   return 'Unknown';
    }
  }

  getStatusClass(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.Booked:
        return 'Booked';
      case OrderStatus.Cancelled:
        return 'Cancelled';
      case OrderStatus.EventEnded:
        return 'Event Ended';
      // default:
      //   return 'status-unknown';
    }
  }

  loadTicket(): void {
    if (!this.ticketId) {
      this.errorMessage = 'Ticket ID is missing.';
      return;
    }

    this.ticketService.getTicket(this.ticketId).subscribe({
      next: (ticket) => {
        this.ticket = ticket;
      },
      error: (err) => {
        console.error('Failed to load ticket', err);
        this.errorMessage = 'Failed to load ticket. Please try again.';
      }
    });
  }
}
