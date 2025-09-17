import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ticket, CreateTicketDto } from '../models/ticket.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = `${environment.apiUrl}/api/Ticket`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const token = user.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // GET all tickets
  getTickets(): Observable<Ticket[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket[]>(this.apiUrl, { headers });
  }

  // GET a single ticket by ID
  getTicket(id: string): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket>(`${this.apiUrl}/${id}`, { headers });
  }

  // POST a new ticket
  createTicket(ticket: CreateTicketDto): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.post<Ticket>(this.apiUrl, ticket, { headers });
  }

  // PUT update an existing ticket
  updateTicket(id: string, ticket: CreateTicketDto): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, ticket, { headers });
  }

  // DELETE a ticket
  deleteTicket(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
