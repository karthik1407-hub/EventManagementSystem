import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Event {
  eventID: string;
  eventName: string;
  eventType: string;
  eventLocation: string;
  eventDate: string;
  eventImageUrl: string;
  eventDescription: string;
  eventPrice: number;
  organizerID: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/event`;

  constructor(private http: HttpClient) { }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`);
  }

  createEvent(formData: FormData): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, formData);
  }

  updateEvent(id: string, formData: FormData): Observable<Event> {
    return this.http.put<Event>(`${this.apiUrl}/${id}`, formData);
  }

  deleteEvent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
