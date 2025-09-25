import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';
import { AuthService } from '../auth.service';
import { Modal } from 'bootstrap';
import { CartService, OrderBasketDto, OrderBasketItemDto, CreateOrderBasketItemDto } from '../cart/services/cart.service'; // Added

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
            alert('Event added to cart successfully!');
            this.router.navigate(['/cart']);
          },
          error: (error) => {
            console.error('Error adding to cart:', error);
            alert('Failed to add event to cart. Please try again.');
          }
        });
      },
      error: (error) => {
        console.error('Error getting or creating cart:', error);
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
}