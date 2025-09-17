import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { TicketService } from './services/ticket.service';
import { Ticket, CreateTicketDto, User as TicketUser, Event as TicketEvent } from './models/ticket.model';
import { AuthService } from '../auth.service';
import { EventService } from '../event/services/event.service';
import { Event as EventModel } from '../event/models/event.model';
import { UserService } from '../user/services/user.service';
import { User as UserModel } from '../user/models/user.model';
import { FeedbackService } from '../feedback/services/feedback.service';
import { Feedback } from '../feedback/models/feedback.model';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.css']
})
export class TicketComponent implements OnInit {
  tickets: Ticket[] = [];
  newTicket: CreateTicketDto = {
    eventID: '',
    userID: '',
    bookingDate: '',
    isCancelled: false
  };
  events: EventModel[] = []; // Add events list for selection
  users: UserModel[] = []; // Add users list for selection
  feedbacks: Feedback[] = []; // Add feedbacks list
  errorMessage: string = '';
  isUser: boolean = false;
  isOrganizer: boolean = false;
  isAdmin: boolean = false;
  editingTicket: Ticket | null = null;

  selectedTicket: Ticket | null = null; // New property for modal
  feedback: Feedback | null = null; // Feedback for selected ticket
  feedbackModel: { rating: number; comments: string } = { rating: 5, comments: '' }; // Model for feedback form
  isEditingFeedback: boolean = false; // Track if feedback form is in edit mode

  @Output() ticketStatusChanged = new EventEmitter<Ticket>();

  constructor(
    private ticketService: TicketService,
    private authService: AuthService,
    private eventService: EventService,
    private userService: UserService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    this.isUser = this.authService.getUserRole() === 'Attendee';
    this.isOrganizer = this.authService.getUserRole() === 'Event Organizer';
    this.isAdmin = this.authService.getUserRole() === 'Admin';
    this.loadUsers();
    this.setUserId();
    this.eventService.getEvent().subscribe({
      next: (events) => {
        this.events = events;
        this.loadTickets(); // Load tickets after events are loaded
      },
      error: (err) => {
        console.error('Failed to load events', err);
      }
    });
  }

  openTicketModal(ticket: Ticket): void {
    this.selectedTicket = ticket;
    this.loadFeedbackForTicket(ticket);
    this.isEditingFeedback = false; // Reset edit mode on modal open
    // Initialize feedbackModel for form
    if (this.feedback) {
      this.feedbackModel = {
        rating: this.feedback.rating,
        comments: this.feedback.comments
      };
    } else {
      this.feedbackModel = { rating: 5, comments: '' };
    }
    // Use Bootstrap modal JS to show modal
    const modalElement = document.getElementById('ticketModal');
    if (modalElement) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  }

  loadFeedbackForTicket(ticket: Ticket): void {
    this.feedback = null;
    this.feedbackService.getAll().subscribe({
      next: (feedbacks) => {
        this.feedback = feedbacks.find(
          (f) => f.eventID === ticket.eventID && f.userID === ticket.userID
        ) || null;
        // Initialize feedbackModel for form
        if (this.feedback) {
          this.feedbackModel = {
            rating: this.feedback.rating,
            comments: this.feedback.comments
          };
        } else {
          this.feedbackModel = { rating: 5, comments: '' };
        }
      },
      error: (err) => {
        console.error('Failed to load feedbacks', err);
      }
    });
  }

  isEventEnded(ticket: Ticket): boolean {
    const event = this.events.find(e => e.eventID === ticket.eventID);
    if (!event || !event.eventDate) {
      return false;
    }
    const eventDateTime = new Date(event.eventDate);
    const now = new Date();
    return now > eventDateTime;
  }

  onFeedbackButtonClick(): void {
    if (!this.selectedTicket) return;
    if (!this.isEventEnded(this.selectedTicket)) {
      alert('You are allowed to give feedback once Event is done.');
      return;
    }
    this.isEditingFeedback = true;
  }

  submitFeedback(): void {
    if (!this.selectedTicket) return;

    if (this.feedback) {
      // Update existing feedback
      const feedbackDto = {
        feedbackID: this.feedback.feedbackID,
        eventID: this.selectedTicket.eventID,
        userID: this.selectedTicket.userID,
        rating: this.feedbackModel.rating,
        comments: this.feedbackModel.comments,
        submittedTimestamp: new Date().toISOString()
      };
      console.log('Updating feedback with DTO:', feedbackDto);
      this.feedbackService.update(this.feedback.feedbackID, feedbackDto).subscribe({
        next: () => {
          alert('Feedback updated successfully.');
          this.loadFeedbackForTicket(this.selectedTicket!);
          this.isEditingFeedback = false; // Exit edit mode after update
        },
        error: (err) => {
          console.error('Failed to update feedback', err);
          alert('Failed to update feedback. Please try again.');
        }
      });
    } else {
      // Create new feedback
      const feedbackDto = {
        eventID: this.selectedTicket.eventID,
        userID: this.selectedTicket.userID,
        rating: this.feedbackModel.rating,
        comments: this.feedbackModel.comments,
        submittedTimestamp: new Date().toISOString()
      };
      this.feedbackService.create(feedbackDto).subscribe({
        next: () => {
          alert('Feedback submitted successfully.');
          this.loadFeedbackForTicket(this.selectedTicket!);
          this.isEditingFeedback = false; // Exit edit mode after submit
        },
        error: (err) => {
          console.error('Failed to submit feedback', err);
          alert('Failed to submit feedback. Please try again.');
        }
      });
    }
  }

  private setUserId(): void {
    const userId = this.authService.getUserId();
    if (userId) {
      this.newTicket.userID = userId;
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

  loadTickets(): void {
    const currentUserId = this.authService.getUserId();
    this.ticketService.getTickets().subscribe({
      next: (data: Ticket[]) => {
        const mapEventModelToTicketEvent = (eventModel: EventModel): TicketEvent => {
          return {
            eventID: eventModel.eventID,
            name: eventModel.eventName,
            date: eventModel.eventDate,
            location: eventModel.eventLocation,
            eventPrice: eventModel.eventPrice
          };
        };

        const mapUserModelToTicketUser = (userModel: UserModel): TicketUser => {
          return {
            userID: userModel.userID.toString(),
            name: userModel.email,
            email: userModel.email // Added missing email property
          };
        };

        this.tickets = data
          .filter(ticket => this.isAdmin || this.isOrganizer || ticket.userID === currentUserId)
          .map((ticket: Ticket) => {
            const eventModel = this.events.find(e => e.eventID === ticket.eventID);
            const userModel = this.users.find(u => u.userID.toString() === ticket.userID.toString());
            if (eventModel && userModel) {
              const event = mapEventModelToTicketEvent(eventModel);
              const user = mapUserModelToTicketUser(userModel);
              return { ...ticket, event, user };
            }
            return ticket;
          });
      },
      error: (err) => {
        console.error('Failed to load tickets', err);
        this.errorMessage = 'Failed to load tickets.';
      }
    });
  }

  get loggedInUserName(): string {
    return this.authService.userValue?.email || 'N/A';
  }

  createTicket(): void {
    if (!this.newTicket.eventID || !this.newTicket.userID) {
      this.errorMessage = 'Please select an event and ensure you are logged in.';
      return;
    }

    // Ensure eventID is a valid Guid
    if (!this.isValidGuid(this.newTicket.eventID)) {
      this.errorMessage = 'Invalid event selected.';
      return;
    }

    this.newTicket.bookingDate = new Date().toISOString();

    this.ticketService.createTicket(this.newTicket).subscribe({
      next: () => {
        this.loadTickets();
        this.resetForm();
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to create ticket', err);
        this.errorMessage = 'Failed to create ticket. Please try again.';
      }
    });
  }

  private resetForm(): void {
    this.newTicket = {
      eventID: '',
      userID: this.authService.getUserId() || '',
      bookingDate: '',
      isCancelled: false
    };
  }

  private isValidGuid(guid: string): boolean {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return guidRegex.test(guid);
  }

  deleteTicket(id: string): void {
    this.ticketService.deleteTicket(id).subscribe({
      next: () => this.loadTickets(),
      error: (err) => {
        console.error('Failed to delete ticket', err);
        if (err?.error) {
          this.errorMessage = err.error;
        } else {
          this.errorMessage = 'Failed to delete ticket.';
        }
      }
    });
  }

  editTicket(ticket: Ticket): void {
    this.editingTicket = ticket;
    this.newTicket = {
      eventID: ticket.eventID,
      userID: ticket.userID,
      bookingDate: ticket.bookingDate,
      isCancelled: ticket.isCancelled
    };
  }

  updateTicket(): void {
    if (!this.editingTicket || !this.newTicket.eventID || !this.newTicket.userID) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    // Ensure eventID is a valid Guid
    if (!this.isValidGuid(this.newTicket.eventID)) {
      this.errorMessage = 'Invalid event selected.';
      return;
    }

    this.ticketService.updateTicket(this.editingTicket.ticketID, this.newTicket).subscribe({
      next: () => {
        this.loadTickets();
        this.cancelEdit();
        this.errorMessage = '';
      },
      error: (err) => {
        console.error('Failed to update ticket', err);
        this.errorMessage = 'Failed to update ticket. Please try again.';
      }
    });
  }

  cancelEdit(): void {
    this.editingTicket = null;
    this.resetForm();
  }

  cancelTicket(ticket: Ticket): void {
    const updateDto: CreateTicketDto = {
      eventID: ticket.eventID,
      userID: ticket.userID,
      bookingDate: ticket.bookingDate,
      isCancelled: true
    };

    this.ticketService.updateTicket(ticket.ticketID, updateDto).subscribe({
      next: () => {
        this.loadTickets(); // Reload tickets to show the updated status
        this.ticketStatusChanged.emit(ticket); // Emit event for status change
      },
      error: (err) => {
        console.error('Failed to cancel ticket', err);
        this.errorMessage = 'Failed to cancel ticket. Please try again.';
      }
    });
  }

  removeTicket(ticket: Ticket): void {
    // Delete from backend for all roles
    this.deleteTicket(ticket.ticketID);
  }
}
