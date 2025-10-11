import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';
import { AuthService } from '../auth.service';
import { Modal } from 'bootstrap';
import { CartService, OrderBasketDto, OrderBasketItemDto, CreateOrderBasketItemDto } from '../cart/services/cart.service';

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit, AfterViewInit, OnDestroy {
  event: Event | null = null;
  otherEventsByOrganizer: Event[] = [];
  isLoading: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string = '';
  canManageEvent: boolean = false;
  private deleteModal: Modal | undefined;

  showPopup: boolean = false;
  popupMessage: string = '';
  popupIsError: boolean = false;

  timeLeft: number = 0;
  timerMessage: string = '';
  showTimer: boolean = false;
  eventEnded: boolean = false;
  timerInterval: any;



  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    this.canManageEvent = (userRole === 'Event Organizer' || userRole === 'Admin');

    this.route.paramMap.subscribe(params => {
      const eventId = params.get('id');
      if (eventId) {
        this.fetchEventDetails(eventId);
      } else {
        this.errorMessage = 'Event ID not provided.';
      }
    });
  }

  get formattedTimeLeft(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  canManageThisEvent(): boolean {
    if (!this.canManageEvent || !this.event) return false;
    const userRole = this.authService.getUserRole();
    if (userRole === 'Admin') return true;
    const userId = this.authService.getUserId();
    return this.event.organizerID === userId;
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('deleteConfirmationModal');
    if (modalElement) {
      this.deleteModal = new Modal(modalElement);
    }
  }

  fetchEventDetails(id: string): void {
    this.isLoading = true;
    this.showTimer = false;
    this.eventEnded = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    this.eventService.getEventById(id).subscribe({
      next: (data) => {
        this.event = data;
        this.isLoading = false;
        this.checkEventEndTime();
        if (this.event && this.event.organizerID) {
          this.loadOtherEventsByOrganizer(this.event.organizerID, this.event.eventID);
        } else {
        }
      },
      error: (err) => {
        this.errorMessage = 'Failed to load event details.';
        this.isLoading = false;
      }
    });
  }

  loadOtherEventsByOrganizer(organizerId: string, currentEventId: string): void {
    this.eventService.getEventsByOrganizer(organizerId).subscribe({
      next: (events) => {
        this.otherEventsByOrganizer = events.filter(e => e.eventID !== currentEventId);
      },
      error: (err) => {
      }
    });
  }

  addToCart(event: Event): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      alert('You must be logged in to add items to the cart.');
      this.router.navigate(['/login']);
      return;
    }

    this.cartService.getOrCreateOrderBasket(userId).subscribe({
      next: (basket) => {
        const dto: CreateOrderBasketItemDto = {
          orderBasketId: basket.id,
          productId: event.eventID,
          quantity: 1,
          unitPrice: event.eventPrice
        };
        this.cartService.addToCart(dto).subscribe({
          next: (response) => {
            this.showPopupMessage('Event added to cart successfully!', false);
            this.router.navigate(['/cart']);
          },
          error: (error) => {
            alert('Failed to add event to cart. Please try again.');
          }
        });
      },
      error: (error) => {
        alert('Failed to get or create cart. Please try again.');
      }
    });
  }

  editEvent(): void {
    if (this.event) {
      this.router.navigate(['/event/edit', this.event.eventID]);
    }
  }

  confirmDelete(): void {
    if (!this.event) return;

    this.isDeleting = true;
    this.eventService.deleteEvent(this.event.eventID.toString()).subscribe({
      next: () => {
        this.deleteModal?.hide();
        alert('Event deleted successfully.');
        this.router.navigate(['/event']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to delete the event.';
        this.isDeleting = false;
      }
    });
  }

  checkEventEndTime(): void {
    if (!this.event) return;

    const eventDate = new Date(this.event.eventDate);
    const now = new Date();
    const diff = eventDate.getTime() - now.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    if (diff > 0 && diff <= fiveMinutes) {
      this.showTimer = true;
      this.timeLeft = Math.floor(diff / 1000);
      this.timerMessage = this.canManageThisEvent() ? 'Your event is starting in' : 'Book the event before the timer ends';
      this.startTimer();
    } else if (diff <= 0) {
      this.eventEnded = true;
    }
  }

  startTimer(): void {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;
      } else {
        this.showTimer = false;
        this.eventEnded = true;
        this.timerMessage = this.canManageThisEvent() ? 'Your event has started' : 'Oops! The event has already started. Sorry for the inconvenience.';
        alert(this.timerMessage);
        clearInterval(this.timerInterval);
      }
    }, 1000);
  }

  showPopupMessage(message: string, isError: boolean): void {
    this.popupMessage = message;
    this.popupIsError = isError;
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }
}
