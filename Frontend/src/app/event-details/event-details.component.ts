import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';
import { AuthService } from '../auth.service';
import { Modal } from 'bootstrap';
import { CartService, OrderBasketDto, OrderBasketItemDto } from '../cart/services/cart.service'; // Added

@Component({
  selector: 'app-event-details',
  templateUrl: './event-details.component.html',
  styleUrls: ['./event-details.component.css']
})
export class EventDetailsComponent implements OnInit, AfterViewInit {
  event: Event | null = null;
  isLoading: boolean = false;
  isDeleting: boolean = false;
  errorMessage: string = '';
  canManageEvent: boolean = false;
  private deleteModal: Modal | undefined;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private router: Router,
    private authService: AuthService,
    private cartService: CartService // Added
  ) { }

  ngOnInit(): void {
    const userRole = this.authService.getUserRole();
    // Check if user is an Event Organizer
    this.canManageEvent = (userRole === 'Event Organizer');

    const eventId = this.route.snapshot.paramMap.get('id');
    if (eventId) {
      this.fetchEventDetails(eventId);
    } else {
      this.errorMessage = 'Event ID not provided.';
    }
  }

  canManageThisEvent(): boolean {
    if (!this.canManageEvent || !this.event) return false;
    const userId = this.authService.getUserId();
    return this.event.OrganizerID === userId;
  }

  ngAfterViewInit(): void {
    const modalElement = document.getElementById('deleteConfirmationModal');
    if (modalElement) {
      this.deleteModal = new Modal(modalElement);
    }
  }

  fetchEventDetails(id: string): void {
    this.isLoading = true;
    this.eventService.getEventById(id).subscribe({
      next: (data) => { this.event = data; this.isLoading = false; },
      error: (err) => { this.errorMessage = 'Failed to load event details.'; this.isLoading = false; }
    });
  }

    bookEvent(): void {
    const user = this.authService.userValue;
    if (!this.event || !user) {
      // Handle case where event or user is not available
      return;
    }

    // Create a temporary OrderBasketItemDto for the current event
    const item: OrderBasketItemDto = {
      id: 'temp-item-' + Date.now(), // Temporary ID for the item
      orderBasketId: 'temp-basket-' + Date.now(), // Temporary ID for the basket
      eventId: this.event.eventID,
      quantity: 1, // Assuming 1 ticket per booking for now
      unitPrice: this.event.eventPrice,
      addedDate: new Date().toISOString()
    };

    // Create a temporary OrderBasketDto
    const tempBasket: OrderBasketDto = {
      id: 'temp-basket-' + Date.now(), // Temporary ID for the basket
      userId: user.id,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      items: [item]
    };

    // Prepare events map for the payment component
    const eventsMap: { [key: string]: Event } = {};
    eventsMap[this.event.eventID] = this.event;

    this.router.navigate(['/payment'], {
      state: {
        basket: tempBasket,
        events: eventsMap
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
}