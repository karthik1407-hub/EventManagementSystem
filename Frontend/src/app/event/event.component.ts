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
  upcomingEvents: Event[] = [];
  pastEvents: Event[] = [];
  filteredUpcoming: Event[] = [];
  filteredPast: Event[] = [];
  errorMessage: string = '';
  isLoading: boolean = false;
  isOrganizer: boolean = false;
  isAdmin: boolean = false;

  searchQuery: string = '';
  selectedCategory: string = '';
  priceRange: number = 10000;
  selectedTags: Set<string> = new Set();
  allTags: string[] = ['Outdoor', 'Family Friendly', 'Free Drinks', 'Live Music'];

  currentView: 'upcoming' | 'past' = 'upcoming';

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

        let baseEvents = data;

        if (this.isOrganizer) {
          const userId = this.getUserId();
          if (userId) {
            baseEvents = data.filter(event => event.organizerID === userId);
          }
        } else if (!this.isAdmin) {
          // Attendees: only future events
          baseEvents = data.filter(event => this.isFutureEvent(event));
        }
        // Admins: all events (no filter)

        this.eventList = baseEvents;
        this.upcomingEvents = baseEvents.filter(event => this.isFutureEvent(event));
        this.pastEvents = baseEvents.filter(event => !this.isFutureEvent(event));
        this.filteredUpcoming = [...this.upcomingEvents];
        this.filteredPast = [...this.pastEvents];
        this.currentView = (!this.isOrganizer && !this.isAdmin) ? 'upcoming' : 'upcoming';
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to load events.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  private isFutureEvent(event: Event): boolean {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    return eventDate >= now;
  }

  applyFilters(): void {
    const filterFn = (event: Event) => {
      const searchMatch = event.eventName.toLowerCase().includes(this.searchQuery.toLowerCase());
      const categoryMatch = this.selectedCategory ? event.eventType === this.selectedCategory : true;
      const priceMatch = event.eventPrice <= this.priceRange;
      const tagsMatch = this.selectedTags.size > 0 ? [...this.selectedTags].every(tag => event.tags.includes(tag)) : true;

      return searchMatch && categoryMatch && priceMatch && tagsMatch;
    };

    this.filteredUpcoming = this.upcomingEvents.filter(filterFn);
    this.filteredPast = this.pastEvents.filter(filterFn);
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
    this.filteredUpcoming = [...this.upcomingEvents];
    this.filteredPast = [...this.pastEvents];
  }

  switchView(view: 'upcoming' | 'past'): void {
    if (this.isOrganizer || this.isAdmin) {
      this.currentView = view;
    }
  }

  get currentFilteredEvents(): Event[] {
    return this.currentView === 'upcoming' ? this.filteredUpcoming : this.filteredPast;
  }

  get currentEventsLength(): number {
    return this.currentFilteredEvents.length;
  }

  get showPastEvents(): boolean {
    return this.isOrganizer || this.isAdmin;
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
