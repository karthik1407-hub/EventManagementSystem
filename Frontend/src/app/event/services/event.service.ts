import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Event } from '../models/event.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${environment.apiUrl}/api/Event`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const userString = localStorage.getItem('user');
    if (!userString) return new HttpHeaders();
    const user = JSON.parse(userString);
    const token = user?.token;
    if (!token) return new HttpHeaders();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  getEvent(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl);
  }

  getEventById(id: string): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.get<Event>(`${this.apiUrl}/${id}`, { headers });
  }

  addEvent(formData: FormData): Observable<Event> {
    const headers = this.getAuthHeaders();
    return this.http.post<Event>(this.apiUrl, formData, { headers });
  }

  updateEvent(id: string, formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers });
  }

  deleteEvent(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }
}