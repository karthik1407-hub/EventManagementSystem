import { Component, OnInit } from '@angular/core';
import { EventService } from './services/event.service';
import { Event } from './models/event.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CartService } from '../cart/services/cart.service';

@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  styleUrls: ['./event.component.css']
})
export class EventComponent implements OnInit {
  eventList: Event[] = [];
  filteredEvents: Event[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  isOrganizer: boolean = false;
  isAdmin: boolean = false;

  searchQuery: string = '';
  selectedCategory: string = '';
  priceRange: number = 10000;
  selectedTags: Set<string> = new Set();
  allTags: string[] = ['Outdoor', 'Family Friendly', 'Free Drinks', 'Live Music'];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router,
    private cartService: CartService
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getUserId(): string | null {
    return this.authService.getUserId();
  }

  ngOnInit(): void {
    this.isOrganizer = this.authService.getUserRole() === 'Event Organizer';
    this.isAdmin = this.authService.getUserRole() === 'Admin';
    if (this.isLoggedIn()) {
      this.fetchEvents();
    }
  }

  fetchEvents(): void {
    this.isLoading = true;
    this.eventService.getEvent().subscribe({
      next: (data) => {
        this.eventList = data;
        this.filteredEvents = data; // Initialize filteredEvents with all events initially
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load events.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  applyFilters(): void {
    this.filteredEvents = this.eventList.filter(event => {
      const searchMatch = event.eventName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const categoryMatch = this.selectedCategory ? event.eventType === this.selectedCategory : true;
      const priceMatch = event.eventPrice <= this.priceRange; // Corrected property name
      const tagsMatch = this.selectedTags.size > 0 ? [...this.selectedTags].every(tag => event.tags.includes(tag)) : true;
      
      return searchMatch && categoryMatch && priceMatch && tagsMatch;
    });
  }

  onTagChange(tag: string, event: any) {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.selectedTags.add(tag);
    } else {
      this.selectedTags.delete(tag);
    }
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.priceRange = 50000;
    this.selectedTags.clear();
    document.querySelectorAll<HTMLInputElement>('.tag-list .form-check-input').forEach(el => el.checked = false);
    this.filteredEvents = this.eventList.slice(); // Reset to show all events
  }
  
  viewEventDetails(eventID: string): void {
    this.router.navigate(['/events/details', eventID]);
  }



  editEvent(eventID: string): void {
    this.router.navigate(['/event/edit', eventID]);
  }

  deleteEvent(eventID: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventID).subscribe({
        next: () => {
          alert('Event deleted successfully!');
          this.fetchEvents(); // Refresh the list
        },
        error: (err) => {
          console.error('Error deleting event:', err);
          alert('Failed to delete event.');
        }
      });
    }
  }
}
