import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FeedbackService } from './services/feedback.service';
import { Feedback } from './models/feedback.model';
import { AuthService } from '../auth.service';
import { UserService } from '../user/services/user.service';
import { User } from '../user/models/user.model';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
})
export class FeedbackComponent implements OnInit {
  feedbacks: Feedback[] = [];
  feedbackForm: FormGroup;
  errorMessage: string = '';
  events: Event[] = []; // Add events list for selection
  users: User[] = [];
  isUser: boolean = false;
  isOrganizer: boolean = false;
  isAdmin: boolean = false;
  editingFeedback: Feedback | null = null;

  constructor(
    private fb: FormBuilder,
    private service: FeedbackService,
    private authService: AuthService,
    private userService: UserService,
    private eventService: EventService
  ) {
    this.feedbackForm = this.fb.group({
      eventID: ['', Validators.required],
      userID: ['', Validators.required],
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comments: ['', Validators.required],
      submittedTimestamp: [new Date().toISOString()]
    });
  }

  ngOnInit(): void {
    this.isUser = this.authService.getUserRole() === 'user';
    this.isOrganizer = this.authService.getUserRole() === 'organizer';
    this.isAdmin = this.authService.getUserRole() === 'admin';
    this.loadAllUsers();
    this.loadFeedbacks();
    this.loadEvents();
    this.setUserId();
  }

  loadAllUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: User[]) => {
        this.users = users;
      },
      error: (err: any) => {
        console.error('Failed to load users', err);
      }
    });
  }

  private setUserId(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.feedbackForm.patchValue({ userID: userId });
    }
  }

  private loadEvents(): void {
    this.eventService.getEvent().subscribe({
      next: (events: Event[]) => {
        this.events = events;
      },
      error: (err: any) => {
        console.error('Failed to load events', err);
      }
    });
  }

  loadFeedbacks(): void {
    this.service.getAll().subscribe({
      next: (data: Feedback[]) => {
        this.feedbacks = data;
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Failed to load feedbacks', err);
        this.errorMessage = 'Failed to load feedbacks.';
      }
    });
  }

  submit(): void {
    if (this.feedbackForm.invalid) {
      this.errorMessage = 'Please fill in all required fields and ensure rating is between 1-5.';
      return;
    }

    const feedback = this.feedbackForm.value;

    // Ensure eventID and userID are valid Guids
    if (!this.isValidGuid(feedback.eventID) || !this.isValidGuid(feedback.userID)) {
      this.errorMessage = 'Invalid event or user selected.';
      return;
    }

    this.service.create(feedback).subscribe({
      next: () => {
        // ✅ Reset form and reassign timestamp
        this.resetForm();
        // ✅ Reload feedbacks to show the new one
        this.loadFeedbacks();
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Failed to create feedback', err);
        this.errorMessage = 'Failed to submit feedback. Please try again.';
      }
    });
  }

  private resetForm(): void {
    this.feedbackForm.reset({
      eventID: '',
      userID: this.authService.getUserId() || '',
      rating: 0,
      comments: '',
      submittedTimestamp: new Date().toISOString()
    });
  }

  private isValidGuid(guid: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }

  delete(id: string | undefined): void {
    if (!id) return;

    this.service.delete(id).subscribe({
      next: () => {
        this.loadFeedbacks(); // ✅ Refresh list after deletion
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Failed to delete feedback', err);
        this.errorMessage = 'Failed to delete feedback.';
      }
    });
  }

  edit(feedback: Feedback): void {
    this.editingFeedback = feedback;
    this.feedbackForm.patchValue({
      eventID: feedback.eventID,
      userID: feedback.userID,
      rating: feedback.rating,
      comments: feedback.comments,
      submittedTimestamp: feedback.submittedTimestamp
    });
  }

  update(): void {
    if (this.feedbackForm.invalid || !this.editingFeedback) {
      this.errorMessage = 'Please fill in all required fields and ensure rating is between 1-5.';
      return;
    }

    const feedback = this.feedbackForm.value;

    // Ensure eventID and userID are valid Guids
    if (!this.isValidGuid(feedback.eventID) || !this.isValidGuid(feedback.userID)) {
      this.errorMessage = 'Invalid event or user selected.';
      return;
    }

    this.service.update(this.editingFeedback.feedbackID, feedback).subscribe({
      next: () => {
        this.loadFeedbacks();
        this.cancelEdit();
        this.errorMessage = '';
      },
      error: (err: any) => {
        console.error('Failed to update feedback', err);
        this.errorMessage = 'Failed to update feedback. Please try again.';
      }
    });
  }

  cancelEdit(): void {
    this.editingFeedback = null;
    this.resetForm();
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.eventID === eventId);
    return event ? event.eventName : eventId;
  }

  getUserName(userId: string): string {
    const user = this.users.find(u => u.userID === userId);
    return user ? user.email : userId;
  }
}
