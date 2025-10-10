import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Event } from '../event/models/event.model';
import { PaymentService } from './services/payment.service';
import { AuthService } from '../auth.service';
import { OrderBasketDto } from '../cart/services/cart.service';
import { TicketService } from '../ticket/services/ticket.service';
import { NotificationService } from '../notification/services/notification.service';
import { CreateTicketDto, Ticket } from '../ticket/models/ticket.model';
import { CreateNotificationDto, Notification } from '../notification/models/notification.model';

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

  // Card details properties
  cardNumber: string = '';
  cardHolder: string = '';
  expiryMonth: string = '';
  expiryYear: string = '';
  months: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];
  cvv: string = '';

  // Property to track CVV focus
  isCvvFocused: boolean = false;

  constructor(
    private router: Router,
    private paymentService: PaymentService,
    private authService: AuthService,
    private ticketService: TicketService,
    private notificationService: NotificationService
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.basket = navigation?.extras?.state?.['basket'] as OrderBasketDto;
    this.events = navigation?.extras?.state?.['events'] as { [key: string]: Event };

    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 10; i++) {
      this.years.push((currentYear + i).toString());
    }
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

  // Methods to handle CVV focus events
  onCvvFocus(): void {
    this.isCvvFocused = true;
  }

  onCvvBlur(): void {
    this.isCvvFocused = false;
  }

  getMaskedCardNumber(): string {
    if (!this.cardNumber) {
      return '#### #### #### ####';
    }
    const len = this.cardNumber.length;
    if (len <= 8) {
      return this.cardNumber;
    }
    if (len <= 12) {
      return this.cardNumber.substring(0, 4) + ' ' + this.cardNumber.substring(4, len) + ' ' + '####';
    }
    if (len <= 16) {
      return this.cardNumber.substring(0, 4) + ' ' + this.cardNumber.substring(4, 8) + ' ' + '#### ' + this.cardNumber.substring(len - 4, len);
    }
    return this.cardNumber;
  }

  getTotalAmount(): number {
    if (!this.basket?.items) return 0;
    return this.basket.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }

  processPayment(paymentForm: any): void {
    console.log('payment form details', paymentForm.value);
    if (!this.basket || !this.basket.items || this.basket.items.length === 0) {
      console.log('basket is empty');
      return;
    }

    paymentForm.submitted = true;
    if (!paymentForm.form.valid) {
      this.paymentError = 'Please fill in all required payment details correctly.';
      console.log('payment form is invalid', paymentForm.form.errors);
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

        if (this.basket && this.basket.items && this.authService.userValue) {
          const userId = this.authService.userValue.id;
          const bookingDate = new Date().toISOString();

          this.basket.items.forEach(item => {
            const createTicketDto: CreateTicketDto = {
              eventID: item.eventId,
              userID: userId,
              bookingDate: bookingDate,
              isCancelled: false
            };

            this.ticketService.createTicket(createTicketDto).subscribe({
              next: (ticket: Ticket) => {
                console.log('Ticket created:', ticket);
                const eventName = this.events[item.eventId]?.eventName || 'Unknown Event';
                const notificationMessage = `Your ticket for "${eventName}" has been successfully booked! Ticket ID: ${ticket.ticketID}`;

                const createNotificationDto: CreateNotificationDto = {
                  userID: userId,
                  eventID: item.eventId,
                  ticketID: ticket.ticketID,
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