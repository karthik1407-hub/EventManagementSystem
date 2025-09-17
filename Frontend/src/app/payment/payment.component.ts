import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from '../event/models/event.model';
import { PaymentService } from './services/payment.service';
import { AuthService } from '../auth.service';
import { OrderBasketDto } from '../cart/services/cart.service';
import { TicketService } from '../ticket/services/ticket.service'; // Added
import { NotificationService } from '../notification/services/notification.service'; // Added
import { CreateTicketDto, Ticket } from '../ticket/models/ticket.model'; // Added Ticket
import { CreateNotificationDto, Notification } from '../notification/models/notification.model'; // Added Notification

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  basket: OrderBasketDto | null = null;
  events: { [key: string]: Event } = {};
  paymentSuccess: boolean = false;
  paymentError: string = '';
  isLoading: boolean = false;

  // New properties for card details
  cardNumber: string = '';
  expiryDate: string = '';
  cvv: string = '';

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private authService: AuthService,
    private ticketService: TicketService, // Added
    private notificationService: NotificationService // Added
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.basket = navigation?.extras?.state?.['basket'] as OrderBasketDto;
    this.events = navigation?.extras?.state?.['events'] as { [key: string]: Event };
  }

  ngOnInit(): void {
    const user = this.authService.userValue;
    if (!user) {
      this.router.navigate(['/']);
      return;
    }

    if (!this.basket || !this.basket.items || this.basket.items.length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  getTotalAmount(): number {
    if (!this.basket?.items) return 0;
    return this.basket.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }

  processPayment(paymentForm: any): void {
    if (!this.basket || !this.basket.items || this.basket.items.length === 0) return;

    paymentForm.submitted = true;
    if (!this.cardNumber || this.cardNumber.length < 16 || !this.expiryDate || !this.cvv || this.cvv.length < 3) {
      this.paymentError = 'Please fill in valid payment details.';
      return;
    }

    const user = this.authService.userValue;
    if (!user) {
      this.paymentError = 'User not authenticated. Please log in.';
      return;
    }

    this.isLoading = true;
    this.paymentSuccess = false;
    this.paymentError = '';

    const totalAmount = this.getTotalAmount();

    this.paymentService.checkout(totalAmount).subscribe({
      next: (response) => {
        this.paymentSuccess = true;
        this.isLoading = false;
        alert(`Payment of ${totalAmount} processed successfully. Your order has been placed.`);

        // Process each item in the basket to create tickets and send notifications
        if (this.basket && this.basket.items && this.authService.userValue) {
          const userId = this.authService.userValue.id;
          const bookingDate = new Date().toISOString();

          this.basket.items.forEach(item => {
            // 1. Create Ticket
            const createTicketDto: CreateTicketDto = {
              eventID: item.eventId, // Changed to item.eventId
              userID: userId,
              bookingDate: bookingDate,
              isCancelled: false
            };

            this.ticketService.createTicket(createTicketDto).subscribe({
              next: (ticket: Ticket) => {
                console.log('Ticket created:', ticket);

                // 2. Send Notification
                const eventName = this.events[item.eventId]?.eventName || 'Unknown Event'; // Changed to eventName
                const notificationMessage = `Your ticket for "${eventName}" has been successfully booked! Ticket ID: ${ticket.ticketID}`;

                const createNotificationDto: CreateNotificationDto = {
                  userID: userId,
                  eventID: item.eventId, // Changed to item.eventId
                  ticketID: ticket.ticketID, // Use the newly created ticket ID
                  message: notificationMessage,
                  sentTimestamp: new Date().toISOString()
                };

                this.notificationService.create(createNotificationDto).subscribe({
                  next: (notification: Notification) => console.log('Notification sent:', notification),
                  error: (err: any) => console.error('Failed to send notification:', err)
                });
              },
              error: (err: any) => console.error('Failed to create ticket:', err)
            });
          });
        }

        // Navigate to user profile or orders page
        this.router.navigate(['/user/profile']);
      },
      error: (err: any) => {
        if (err.error && typeof err.error === 'object') {
          this.paymentError = JSON.stringify(err.error);
        } else if (err.error?.message) {
          this.paymentError = err.error.message;
        } else if (typeof err === 'string') {
          this.paymentError = err;
        } else {
          this.paymentError = 'Payment failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }
}