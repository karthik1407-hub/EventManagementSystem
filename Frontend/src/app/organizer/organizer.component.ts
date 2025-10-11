import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-organizer',
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.css']
})
export class OrganizerComponent implements OnInit {
  events: any[] = [];
  upcomingEvents: any[] = [];
  pastEvents: any[] = [];
  feedbacks: any[] = [];
  tickets: any[] = [];
  selectedEvent: any = null;
  eventBookings: any[] = []; // tickets with user details for selected event
  isLoading = false;
  activeTab = 'events';

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchEvents();
    this.fetchFeedbacks();
    this.fetchTickets();
  }

  fetchEvents(): void {
    this.http.get(`${environment.apiUrl}/api/event`).subscribe({
      next: (data: any) => {
        const now = new Date();
        this.upcomingEvents = data.filter((event: any) => new Date(event.eventDate) >= now);
        this.pastEvents = data.filter((event: any) => new Date(event.eventDate) < now);
      },
      error: (err) => console.error('Error fetching events:', err)
    });
  }

  fetchFeedbacks(): void {
    this.http.get(`${environment.apiUrl}/api/feedback`).subscribe({
      next: (data: any) => {
        this.feedbacks = data;
      },
      error: (err) => console.error('Error fetching feedbacks:', err)
    });
  }

  fetchTickets(): void {
    this.http.get(`${environment.apiUrl}/api/ticket`).subscribe({
      next: (data: any) => {
        this.tickets = data;
      },
      error: (err) => console.error('Error fetching tickets:', err)
    });
  }

  onEventClick(event: any): void {
    this.selectedEvent = event;
    this.eventBookings = [];
    this.isLoading = true;
    // Fetch tickets for this event
    this.http.get(`${environment.apiUrl}/api/ticket`).subscribe({
      next: (tickets: any) => {
        const eventTickets = tickets.filter((t: any) => t.eventID === event.eventID);
        // For each ticket, fetch user details
        eventTickets.forEach((ticket: any) => {
          this.http.get(`${environment.apiUrl}/api/User/${ticket.userID}`).subscribe({
            next: (user: any) => {
              this.eventBookings.push({
                ...ticket,
                user: user
              });
              this.isLoading = false;
            },
            error: (err) => {
              console.error('Error fetching user:', err);
              this.isLoading = false;
            }
          });
        });
        if (eventTickets.length === 0) {
          this.isLoading = false;
        }
      },
      error: (err) => {
        console.error('Error fetching tickets for event:', err);
        this.isLoading = false;
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
