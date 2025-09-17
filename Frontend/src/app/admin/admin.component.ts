import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environments/environment';
import { UserService } from '../user/services/user.service';
import { User } from '../user/models/user.model';

// --- Interfaces for better type safety ---
// Using imported User model from user service
interface Feedback {
  feedbackID: string;
  comments: string;
  rating: number;
}
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
interface Event {
  eventID: string;
  eventName: string;
  eventDate: string;
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
  templateUrl: './admin.component.html', // You will need to adjust your template to use signals
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
  // Using WritableSignal for reactive state management.
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

  // For safer deletions, we'll store the item to be deleted.
  itemToDelete = signal<{ type: string, id: string } | null>(null);

  // --- Form State Management ---
  // Forms for create/edit operations
  userForm: FormGroup | null = null;
  feedbackForm: FormGroup | null = null;
  notificationForm: FormGroup | null = null;
  ticketForm: FormGroup | null = null;
  eventForm: FormGroup | null = null;
  paymentForm: FormGroup | null = null;

  // Form visibility states
  showUserForm = signal(false);
  showFeedbackForm = signal(false);
  showNotificationForm = signal(false);
  showTicketForm = signal(false);
  showEventForm = signal(false);
  showPaymentForm = signal(false);

  // Edit mode states
  editingUser = signal<number | null>(null);
  editingFeedback = signal<string | null>(null);
  editingNotification = signal<string | null>(null);
  editingTicket = signal<string | null>(null);
  editingEvent = signal<string | null>(null);
  editingPayment = signal<string | null>(null);

  ngOnInit(): void {
    this.loadCounts();
  }

  // --- UI Interaction ---
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

  // --- Navigation Methods ---
  // These methods navigate to other components to handle creation/editing.
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


  // --- Data Loading ---
  private getAuthHeaders(): HttpHeaders {
    // This logic is okay, but consider using an HttpInterceptor for a more robust solution.
    const userString = localStorage.getItem('user');
    if (!userString) return new HttpHeaders();
    const user = JSON.parse(userString);
    return user?.token ? new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }) : new HttpHeaders();
  }

  loadCounts(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const headers = this.getAuthHeaders();

    // Load counts for all sections
    forkJoin({
      users: this.http.get<User[]>(`${this.API_URL}/api/Users`, { headers }),
      feedback: this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`, { headers }),
      notifications: this.http.get<Notification[]>(`${this.API_URL}/api/Notification`, { headers }),
      tickets: this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`, { headers }),
      events: this.http.get<Event[]>(`${this.API_URL}/api/Event`, { headers }),
      payments: this.http.get<Payment[]>(`${this.API_URL}/api/Payment`, { headers })
    }).subscribe({
      next: (data) => {
        // Set counts
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
    const headers = this.getAuthHeaders();
    switch (section) {
      case 'users':
        this.http.get<User[]>(`${this.API_URL}/api/Users`, { headers }).subscribe({
          next: (data) => this.users.set(data),
          error: (err) => console.error('Failed to load users', err)
        });
        break;
      case 'feedback':
        this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`, { headers }).subscribe({
          next: (data) => this.feedback.set(data),
          error: (err) => console.error('Failed to load feedback', err)
        });
        break;
      case 'notifications':
        this.http.get<Notification[]>(`${this.API_URL}/api/Notification`, { headers }).subscribe({
          next: (data) => this.notifications.set(data),
          error: (err) => console.error('Failed to load notifications', err)
        });
        break;
      case 'tickets':
        this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`, { headers }).subscribe({
          next: (data) => this.tickets.set(data),
          error: (err) => console.error('Failed to load tickets', err)
        });
        break;
      case 'events':
        this.http.get<Event[]>(`${this.API_URL}/api/Event`, { headers }).subscribe({
          next: (data) => this.events.set(data),
          error: (err) => console.error('Failed to load events', err)
        });
        break;
      case 'payments':
        this.http.get<Payment[]>(`${this.API_URL}/api/Payment`, { headers }).subscribe({
          next: (data) => this.payments.set(data),
          error: (err) => console.error('Failed to load payments', err)
        });
        break;
    }
  }

  loadAllData(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const headers = this.getAuthHeaders();

    // Use forkJoin to handle multiple HTTP requests concurrently.
    forkJoin({
      users: this.http.get<User[]>(`${this.API_URL}/api/Users`, { headers }),
      feedback: this.http.get<Feedback[]>(`${this.API_URL}/api/Feedback`, { headers }),
      notifications: this.http.get<Notification[]>(`${this.API_URL}/api/Notification`, { headers }),
      tickets: this.http.get<Ticket[]>(`${this.API_URL}/api/Ticket`, { headers }),
      events: this.http.get<Event[]>(`${this.API_URL}/api/Event`, { headers }),
      payments: this.http.get<Payment[]>(`${this.API_URL}/api/Payment`, { headers })
    }).subscribe({
      next: (data) => {
        // Set all data signals at once
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

  // --- Deletion Logic ---

  /**
   * Sets an item to be deleted. This is the first step in the confirmation process.
   * In your HTML, you would call this on the initial delete button click.
   * @param type - A string like 'user', 'feedback' to identify the list.
   * @param id - The unique identifier of the item.
   */
  initiateDelete(type: string, id: string): void {
    this.itemToDelete.set({ type, id });
  }

  /**
   * Cancels the deletion process.
   */
  cancelDelete(): void {
    this.itemToDelete.set(null);
  }

  /**
   * Confirms and executes the deletion. This would be called by a "Confirm Delete" button
   * that is only visible when `itemToDelete()` is not null.
   */
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

    // Add Guid validation for id
    const guidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!guidRegex.test(id)) {
      console.error(`Delete failed: Invalid GUID format for id ${id}`);
      this.errorMessage.set(`Failed to delete the selected ${type}: invalid id format.`);
      this.itemToDelete.set(null);
      return;
    }

    const headers = this.getAuthHeaders();
    let apiUrl = `${this.API_URL}/api/`;

    // Determine the correct API endpoint and local data signal to update
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
        // Note: The ID for event might be different based on your API design
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

    this.http.delete(apiUrl, { headers }).subscribe({
      next: () => {
        // --- IMPORTANT: Update the local state directly ---
        // This is much more efficient than reloading all data from the server.
        // This logic now correctly handles items with different ID properties.
        signalToUpdate.update(currentItems => currentItems.filter(i => {
          if (type === 'user') return i.userID !== id;
          if (type === 'event') return i.eventID !== id;
          return i.id !== id;
        }));
        console.log(`${type} with id ${id} deleted successfully.`);
        this.itemToDelete.set(null); // Clear the item to hide the confirmation dialog
      },
      error: (err) => {
        console.error(`Failed to delete ${type}`, err);
        this.errorMessage.set(`Failed to delete the selected ${type}.`);
        this.itemToDelete.set(null); // Also clear on error
      }
    });
  }

  // --- CRUD Methods ---

  // ===== USER CRUD =====
  // Removed user CRUD methods to move to separate UserComponent
  showAddUserForm(): void {
    this.router.navigate(['/user']);
  }
  
  showEditUserForm(user: User): void {
    this.router.navigate(['/user'], { queryParams: { edit: user.userID } });
  }

  hideUserForm(): void {
    // No longer needed here
  }

  private initializeUserForm(user?: User): void {
    // No longer needed here
  }

  saveUser(): void {
    // No longer needed here
  }

  // ===== FEEDBACK CRUD =====
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
    // Convert rating back to number for API
    formData.rating = parseInt(formData.rating, 10);
    const headers = this.getAuthHeaders();
    const isEditing = this.editingFeedback() !== null;

    if (isEditing) {
      const feedbackId = this.editingFeedback();
      this.http.put(`${this.API_URL}/api/Feedback/${feedbackId}`, formData, { headers }).subscribe({
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
      this.http.post(`${this.API_URL}/api/Feedback`, formData, { headers }).subscribe({
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

  // ===== NOTIFICATION CRUD =====
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
    const headers = this.getAuthHeaders();
    const isEditing = this.editingNotification() !== null;

    if (isEditing) {
      const notificationId = this.editingNotification();
      this.http.put(`${this.API_URL}/api/Notification/${notificationId}`, formData, { headers }).subscribe({
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
      this.http.post(`${this.API_URL}/api/Notification`, formData, { headers }).subscribe({
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

  // ===== TICKET CRUD =====
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
    const headers = this.getAuthHeaders();
    const isEditing = this.editingTicket() !== null;

    if (isEditing) {
      const ticketId = this.editingTicket();
      this.http.put(`${this.API_URL}/api/Ticket/${ticketId}`, formData, { headers }).subscribe({
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
      this.http.post(`${this.API_URL}/api/Ticket`, formData, { headers }).subscribe({
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

  // ===== PAYMENT CRUD =====
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
    const headers = this.getAuthHeaders();
    const isEditing = this.editingPayment() !== null;

    if (isEditing) {
      const paymentId = this.editingPayment();
      this.http.put(`${this.API_URL}/api/Payment/${paymentId}`, formData, { headers }).subscribe({
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
      this.http.post(`${this.API_URL}/api/Payment/payment`, formData, { headers }).subscribe({
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

