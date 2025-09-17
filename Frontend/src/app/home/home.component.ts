import { Component, OnInit } from '@angular/core';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  eventList: Event[] = [];
  filteredEventList: Event[] = [];
  searchQuery: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private eventService: EventService,
    private router: Router,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.fetchEvents();
  }

  async fetchEvents(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const data = await firstValueFrom(this.eventService.getEvent());
      this.eventList = data;
      this.filteredEventList = data;
    } catch (err) {
      this.errorMessage = 'Failed to load events. Please try again later.';
      console.error('Error fetching events:', err);
    } finally {
      this.isLoading = false;
    }
  }
  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  onSearch(): void {
    if (this.searchQuery) {
      this.filteredEventList = this.eventList.filter(event =>
        event.eventName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        event.eventType.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    } else {
      this.filteredEventList = this.eventList;
    }
  }

  viewEventDetails(eventId: string): void {
    this.router.navigate(['/events/details', eventId]);
  }
}