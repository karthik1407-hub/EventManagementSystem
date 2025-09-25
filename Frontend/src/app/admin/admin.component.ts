import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environments/environment';
import { User } from '../user/models/user.model';

// --- Interfaces for better type safety ---
import { Feedback } from '../feedback/models/feedback.model';
import { Event } from '../event/models/event.model';

interface Notification {
  notificationID: string;
  message: string;
  sentTimestamp: string;
}
interface Ticket {
  ticketID: string;
  eventID: string;
  userID?: string;
  bookingDate?: string;
  isCancelled?: boolean;
}
interface Payment {
  id: string;
  amount: number;
  createdDate: string;
  status: string;
  userId?: string;
  method?: string;
  transactionId?: string;
}


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  // --- Injected Services ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  // --- API Configuration ---
  private readonly API_URL = environment.apiUrl;

  // --- State Management with Signals ---
  users: WritableSignal<User[]> = signal([]);
  feedback: WritableSignal<Feedback[]> = signal([]);
  notifications: WritableSignal<Notification[]> = signal([]);
  tickets: WritableSignal<Ticket[]> = signal([]);
  events: WritableSignal<Event[]> = signal([]);
  payments: WritableSignal<Payment[]> = signal([]);

  // Count signals for initial display
  userCount: WritableSignal<number> = signal(0);
  feedbackCount: WritableSignal<number> = signal(0);
  notificationCount: WritableSignal<number> = signal(0);
  ticketCount: WritableSignal<number> = signal(0);
  eventCount: WritableSignal<number> = signal(0);
  paymentCount: WritableSignal<number> = signal(0);

  isLoading = signal(true);
  errorMessage = signal('');
  activeSection = signal('');
  expandedSections: WritableSignal<Set<string>> = signal(new Set());

  itemToDelete = signal<{ type: string, id: string } | null>(null);

  // --- Form State Management ---
  userForm: FormGroup | null = null;
  feedbackForm: FormGroup | null = null;
  notificationForm: FormGroup | null = null;
  ticketForm: FormGroup | null = null;
  eventForm: FormGroup | null = null;
  paymentForm: FormGroup | null = null;

  showUserForm = signal(false);
  showFeedbackForm = signal(false);
  showNotificationForm = signal(false);
  showTicketForm = signal(false);
  showEventForm = signal(false);
  showPaymentForm = signal(false);

  editingUser = signal<number | null>(null);
  editingFeedback = signal<string | null>(null);
  editingNotification = signal<string | null>(null);
  editingTicket = signal<string | null>(null);
  editingEvent = signal<string | null>(null);
  editingPayment = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCounts();
    this.expandedSections.update(set => set.add('feedback'));
    this.loadSectionData('feedback');
    this.loadSectionData('users');
    this.loadSectionData('events');
  }

  getUserName(userId: string): string {
    const user = this.users().find(u => u.userID === userId);
    return user ? user.email : userId;
  }

  getEventName(eventId: string): string {
    const event = this.events().find(e => e.eventID === eventId);
    return event ? event.eventName : eventId;
  }

  toggleSection(section: string): void {
    const expanded = this.expandedSections();
    if (expanded.has(section)) {
      expanded.delete(section);
      this.expandedSections.set(new Set(expanded));
    } else {
      expanded.add(section);
      this.expandedSections.set(new Set(expanded));
      this.loadSectionData(section);
    }
  }

  addUser(): void { this.router.navigate(['/admin/users']); }
  editUser(user: User): void { this.router.navigate(['/admin/users'], { queryParams: { edit: user.userID } }); }

  addFeedback(): void { this.router.navigate(['/feedback']); }
  editFeedback(feedbackItem: Feedback): void { this.router.navigate(['/feedback'], { queryParams: { edit: feedbackItem.feedbackID } }); }

  addNotification(): void { this.router.navigate(['/notifications']); }
  editNotification(notification: Notification): void { this.router.navigate(['/notifications'], { queryParams: { edit: notification.notificationID } });}

  addTicket(): void { this.router.navigate(['/tickets']); }
  editTicket(ticket: Ticket): void { this.router.navigate(['/tickets'], { queryParams: { edit: ticket.ticketID } }); }

  addEvent(): void { this.router.navigate(['/add-event']); }
  editEvent(event: Event): void { this.router.navigate(['/event/edit', event.eventID]); }
  
  addPayment(): void { this.router.navigate(['/payment']); }
  editPayment(payment: Payment): void { this.router.navigate(['/payment'], { queryParams: { edit: payment.id } });}

  loadCounts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      users: this.http.get<User[]>(`${this.API_URL}/api/Users`),
      feedback: this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`),
      notifications: this.http.get<Notification[]>(`${this.API_URL}/api/Notification`),
      tickets: this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`),
      events: this.http.get<Event[]>(`${this.API_URL}/api/Event`),
      payments: this.http.get<Payment[]>(`${this.API_URL}/api/Payment`)
    }).subscribe({
      next: (data) => {
        this.userCount.set(data.users.length);
        this.feedbackCount.set(data.feedback.length);
        this.notificationCount.set(data.notifications.length);
        this.ticketCount.set(data.tickets.length);
        this.eventCount.set(data.events.length);
        this.paymentCount.set(data.payments.length);
      },
      error: (err) => {
        console.error('Failed to load counts', err);
        this.errorMessage.set('Failed to load dashboard data. Please try again later.');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadSectionData(section: string): void {
    switch (section) {
      case 'users':
        this.http.get<User[]>(`${this.API_URL}/api/Users`).subscribe({
          next: (data) => {
            this.users.set(data);
            this.userCount.set(data.length);
          },
          error: (err) => console.error('Failed to load users', err)
        });
        break;
      case 'feedback':
        this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`).subscribe({
          next: (data) => {
            console.log('Feedback data received:', data);
            this.feedback.set(data);
            this.feedbackCount.set(data.length);
          },
          error: (err) => {
            console.error('Failed to load feedback', err);
          }
        });
        break;
      case 'notifications':
        this.http.get<Notification[]>(`${this.API_URL}/api/Notification`).subscribe({
          next: (data) => {
            this.notifications.set(data);
            this.notificationCount.set(data.length);
          },
          error: (err) => console.error('Failed to load notifications', err)
        });
        break;
      case 'tickets':
        this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`).subscribe({
          next: (data) => {
            this.tickets.set(data);
            this.ticketCount.set(data.length);
          },
          error: (err) => console.error('Failed to load tickets', err)
        });
        break;
      case 'events':
        this.http.get<Event[]>(`${this.API_URL}/api/Event`).subscribe({
          next: (data) => {
            this.events.set(data);
            this.eventCount.set(data.length);
          },
          error: (err) => console.error('Failed to load events', err)
        });
        break;
      case 'payments':
        this.http.get<Payment[]>(`${this.API_URL}/api/Payment`).subscribe({
          next: (data) => {
            this.payments.set(data);
            this.paymentCount.set(data.length);
          },
          error: (err) => console.error('Failed to load payments', err)
        });
        break;
    }
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      users: this.http.get<User[]>(`${this.API_URL}/api/Users`),
      feedback: this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`),
      notifications: this.http.get<Notification[]>(`${this.API_URL}/api/Notification`),
      tickets: this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`),
      events: this.http.get<Event[]>(`${this.API_URL}/api/Event`),
      payments: this.http.get<Payment[]>(`${this.API_URL}/api/Payment`)
    }).subscribe({
      next: (data) => {
        this.users.set(data.users);
        this.feedback.set(data.feedback);
        this.notifications.set(data.notifications);
        this.tickets.set(data.tickets);
        this.events.set(data.events);
        this.payments.set(data.payments);
      },
      error: (err) => {
        console.error('Failed to load data', err);
        this.errorMessage.set('Failed to load dashboard data. Please try again later.');
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  initiateDelete(type: string, id: string): void {
    this.itemToDelete.set({ type, id });
  }

  cancelDelete(): void {
    this.itemToDelete.set(null);
  }

  confirmDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;

    const { type, id } = item;
    if (!id) {
      console.error(`Delete failed: No id provided for type ${type}`);
      this.errorMessage.set(`Failed to delete the selected ${type}: missing id.`);
      this.itemToDelete.set(null);
      return;
    }

    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!guidRegex.test(id)) {
      console.error(`Delete failed: Invalid GUID format for id ${id}`);
      this.errorMessage.set(`Failed to delete the selected ${type}: invalid id format.`);
      this.itemToDelete.set(null);
      return;
    }

    let apiUrl = `${this.API_URL}/api/`;

    let signalToUpdate: WritableSignal<any[]>;
    switch (type) {
      case 'user':
        apiUrl += `Users/${id}`;
        signalToUpdate = this.users;
        break;
      case 'feedback':
        apiUrl += `Feedback/${id}`;
        signalToUpdate = this.feedback;
        break;
      case 'notification':
        apiUrl += `Notification/${id}`;
        signalToUpdate = this.notifications;
        break;
      case 'ticket':
        apiUrl += `Ticket/${id}`;
        signalToUpdate = this.tickets;
        break;
      case 'event':
        apiUrl += `Event/${id}`;
        signalToUpdate = this.events;
        break;
      case 'payment':
        apiUrl += `Payment/${id}`;
        signalToUpdate = this.payments;
        break;
      default:
        console.error('Invalid delete type:', type);
        this.itemToDelete.set(null);
        return;
    }

    this.http.delete(apiUrl).subscribe({
      next: () => {
        signalToUpdate.update(currentItems => currentItems.filter(i => {
          if (type === 'user') return i.userID !== id;
          if (type === 'event') return i.eventID !== id;
          return i.id !== id;
        }));
        console.log(`${type} with id ${id} deleted successfully.`);
        this.itemToDelete.set(null);
      },
      error: (err) => {
        console.error(`Failed to delete ${type}`, err);
        this.errorMessage.set(`Failed to delete the selected ${type}.`);
        this.itemToDelete.set(null);
      }
    });
  }

  showAddFeedbackForm(): void {
    this.initializeFeedbackForm();
    this.showFeedbackForm.set(true);
    this.editingFeedback.set(null);
  }

  showEditFeedbackForm(feedback: Feedback): void {
    this.initializeFeedbackForm(feedback);
    this.showFeedbackForm.set(true);
    this.editingFeedback.set(feedback.feedbackID);
  }

  hideFeedbackForm(): void {
    this.showFeedbackForm.set(false);
    this.editingFeedback.set(null);
    this.feedbackForm = null;
  }

  private initializeFeedbackForm(feedback?: Feedback): void {
    this.feedbackForm = this.formBuilder.group({
      comments: [feedback?.comments || '', [Validators.required, Validators.minLength(10)]],
      rating: [feedback?.rating?.toString() || '5', [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  saveFeedback(): void {
    if (!this.feedbackForm?.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.feedbackForm.value;
    formData.rating = parseInt(formData.rating, 10);
    const isEditing = this.editingFeedback() !== null;

    if (isEditing) {
      const feedbackId = this.editingFeedback();
      this.http.put(`${this.API_URL}/api/Feedback/${feedbackId}`, formData).subscribe({
        next: (updatedFeedback: any) => {
          this.feedback.update(feedback =>
            feedback.map(f => f.feedbackID === feedbackId ? updatedFeedback : f)
          );
          this.hideFeedbackForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to update feedback', err);
          this.errorMessage.set('Failed to update feedback. Please try again.');
        }
      });
    } else {
      this.http.post(`${this.API_URL}/api/Feedback`, formData).subscribe({
        next: (newFeedback: any) => {
          this.feedback.update(feedback => [...feedback, newFeedback]);
          this.hideFeedbackForm();
          this.errorMessage.set('');
          this.feedbackCount.update(count => count + 1);
        },
        error: (err) => {
          console.error('Failed to create feedback', err);
          this.errorMessage.set('Failed to create feedback. Please try again.');
        }
      });
    }
  }

  showAddNotificationForm(): void {
    this.initializeNotificationForm();
    this.showNotificationForm.set(true);
    this.editingNotification.set(null);
  }

  showEditNotificationForm(notification: Notification): void {
    this.initializeNotificationForm(notification);
    this.showNotificationForm.set(true);
    this.editingNotification.set(notification.notificationID);
  }

  hideNotificationForm(): void {
    this.showNotificationForm.set(false);
    this.editingNotification.set(null);
    this.notificationForm = null;
  }

  private initializeNotificationForm(notification?: Notification): void {
    this.notificationForm = this.formBuilder.group({
      message: [notification?.message || '', [Validators.required, Validators.minLength(5)]]
    });
  }

  saveNotification(): void {
    if (!this.notificationForm?.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.notificationForm.value;
    const isEditing = this.editingNotification() !== null;

    if (isEditing) {
      const notificationId = this.editingNotification();
      this.http.put(`${this.API_URL}/api/Notification/${notificationId}`, formData).subscribe({
        next: (updatedNotification: any) => {
          this.notifications.update(notifications =>
            notifications.map(n => n.notificationID === notificationId ? updatedNotification : n)
          );
          this.hideNotificationForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to update notification', err);
          this.errorMessage.set('Failed to update notification. Please try again.');
        }
      });
    } else {
      this.http.post(`${this.API_URL}/api/Notification`, formData).subscribe({
        next: (newNotification: any) => {
          this.notifications.update(notifications => [...notifications, newNotification]);
          this.hideNotificationForm();
          this.errorMessage.set('');
          this.notificationCount.update(count => count + 1);
        },
        error: (err) => {
          console.error('Failed to create notification', err);
          this.errorMessage.set('Failed to create notification. Please try again.');
        }
      });
    }
  }

  showAddTicketForm(): void {
    this.initializeTicketForm();
    this.showTicketForm.set(true);
    this.editingTicket.set(null);
  }

  showEditTicketForm(ticket: Ticket): void {
    this.initializeTicketForm(ticket);
    this.showTicketForm.set(true);
    this.editingTicket.set(ticket.ticketID);
  }

  hideTicketForm(): void {
    this.showTicketForm.set(false);
    this.editingTicket.set(null);
    this.ticketForm = null;
  }

  private initializeTicketForm(ticket?: Ticket): void {
    this.ticketForm = this.formBuilder.group({
      eventID: [ticket?.eventID || '', Validators.required],
      userID: [ticket?.userID || '', Validators.required],
      bookingDate: [ticket?.bookingDate || new Date().toISOString().split('T')[0], Validators.required],
      isCancelled: [ticket?.isCancelled || false]
    });
  }

  saveTicket(): void {
    if (!this.ticketForm?.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.ticketForm.value;
    const isEditing = this.editingTicket() !== null;

    if (isEditing) {
      const ticketId = this.editingTicket();
      this.http.put(`${this.API_URL}/api/Ticket/${ticketId}`, formData).subscribe({
        next: (updatedTicket: any) => {
          this.tickets.update(tickets =>
            tickets.map(t => t.ticketID === ticketId ? updatedTicket : t)
          );
          this.hideTicketForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to update ticket', err);
          this.errorMessage.set('Failed to update ticket. Please try again.');
        }
      });
    } else {
      this.http.post(`${this.API_URL}/api/Ticket`, formData).subscribe({
        next: (newTicket: any) => {
          this.tickets.update(tickets => [...tickets, newTicket]);
          this.hideTicketForm();
          this.errorMessage.set('');
          this.ticketCount.update(count => count + 1);
        },
        error: (err) => {
          console.error('Failed to create ticket', err);
          this.errorMessage.set('Failed to create ticket. Please try again.');
        }
      });
    }
  }

  showAddPaymentForm(): void {
    this.initializePaymentForm();
    this.showPaymentForm.set(true);
    this.editingPayment.set(null);
  }

  showEditPaymentForm(payment: Payment): void {
    this.initializePaymentForm(payment);
    this.showPaymentForm.set(true);
    this.editingPayment.set(payment.id);
  }

  hidePaymentForm(): void {
    this.showPaymentForm.set(false);
    this.editingPayment.set(null);
    this.paymentForm = null;
  }

  private initializePaymentForm(payment?: Payment): void {
    this.paymentForm = this.formBuilder.group({
      userId: [payment?.userId || '', Validators.required],
      amount: [payment?.amount || '', [Validators.required, Validators.min(0.01)]],
      method: [payment?.method || '', Validators.required],
      status: [payment?.status || 'Pending', Validators.required],
      transactionId: [payment?.transactionId || '']
    });
  }

  savePayment(): void {
    if (!this.paymentForm?.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.paymentForm.value;
    const isEditing = this.editingPayment() !== null;

    if (isEditing) {
      const paymentId = this.editingPayment();
      this.http.put(`${this.API_URL}/api/Payment/${paymentId}`, formData).subscribe({
        next: (updatedPayment: any) => {
          this.payments.update(payments =>
            payments.map(p => p.id === paymentId ? updatedPayment : p)
          );
          this.hidePaymentForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to update payment', err);
          this.errorMessage.set('Failed to update payment. Please try again.');
        }
      });
    } else {
      this.http.post(`${this.API_URL}/api/Payment/payment`, formData).subscribe({
        next: (newPayment: any) => {
          this.payments.update(payments => [...payments, newPayment]);
          this.hidePaymentForm();
          this.errorMessage.set('');
          this.paymentCount.update(count => count + 1);
        },
        error: (err) => {
          console.error('Failed to create payment', err);
          this.errorMessage.set('Failed to create payment. Please try again.');
        }
      });
    }
  }
}
