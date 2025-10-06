import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Notification } from './models/notification.model';
import { NotificationService } from './services/notification.service';
import { AuthService } from '../auth.service';
import { EventService } from '../event/services/event.service';
import { UserService } from '../user/services/user.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
})
export class NotificationComponent implements OnInit {
  notifications: Notification[] = [];
  form: FormGroup;
  isEdit = false;
  editId: string | null = null;
  errorMessage: string = '';
  events: any[] = []; // Add events list for selection
  users: any[] = []; // Add users list for selection
  isUser: boolean = false;
  isOrganizer: boolean = false;
  isAdmin: boolean = false;

  constructor(
    private fb: FormBuilder,
    private service: NotificationService,
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService
  ) {
    this.form = this.fb.group({
      userID: ['', Validators.required],
      eventID: ['', Validators.required],
      message: ['', Validators.required],
      sentTimestamp: [new Date().toISOString(), Validators.required]
    });
  }

  ngOnInit(): void {
    this.isUser = this.authService.getUserRole() === 'user';
    this.isOrganizer = this.authService.getUserRole() === 'organizer';
    this.isAdmin = this.authService.getUserRole() === 'admin';
    this.loadNotifications();
    this.loadEvents();
    this.loadUsers();
    this.setDefaultUserId();
  }

  edit(notification: Notification): void {
    this.isEdit = true;
    this.editId = notification.notificationID;
    this.form.patchValue({
      userID: notification.userID,
      eventID: notification.eventID,
      message: notification.message,
      sentTimestamp: notification.sentTimestamp
    });
  }

  private setDefaultUserId(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.form.patchValue({ userID: userId });
    }
  }

  private loadEvents(): void {
    this.eventService.getEvent().subscribe({
      next: (events) => {
        this.events = events;
      },
      error: (err) => {
        console.error('Failed to load events', err);
      }
    });
  }

  private loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
      },
      error: (err) => {
        console.error('Failed to load users', err);
      }
    });
  }

  loadNotifications(): void {
    this.service.getAll().subscribe({
      next: (data) => {
        this.notifications = data;
        this.service.setNotificationCount(data.length);
      },
      error: (err) => {
        console.error('Failed to load notifications', err);
        this.errorMessage = 'Failed to load notifications.';
      }
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const payload = this.form.value;

    // Ensure eventID and userID are valid Guids
    if (!this.isValidGuid(payload.eventID) || !this.isValidGuid(payload.userID)) {
      this.errorMessage = 'Invalid event or user selected.';
      return;
    }

    if (this.isEdit && this.editId) {
      this.service.update(this.editId, payload).subscribe({
        next: () => {
          this.loadNotifications();
          this.reset();
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Failed to update notification', err);
          this.errorMessage = 'Failed to update notification. Please try again.';
        }
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.loadNotifications();
          this.reset();
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Failed to create notification', err);
          this.errorMessage = 'Failed to create notification. Please try again.';
        }
      });
    }
  }



  delete(id: string): void {
    this.service.delete(id).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.notificationID !== id);
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to delete notification', err);
        this.errorMessage = 'Failed to delete notification.';
      }
    });
  }

  reset(): void {
    this.form.reset({
      userID: this.authService.getUserId() || '',
      eventID: '',
      message: '',
      sentTimestamp: new Date().toISOString()
    });
    this.isEdit = false;
    this.editId = null;
    this.errorMessage = '';
  }

  private isValidGuid(guid: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }
}
