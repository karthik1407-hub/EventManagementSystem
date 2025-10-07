import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Feedback } from '../models/feedback.model';

interface CreateFeedbackDto {
  eventID: string;
  userID: string;
  rating: number;
  comments: string;
  submittedTimestamp: string;
}
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = `${environment.apiUrl}/api/Feedback`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = user.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Feedback[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Feedback[]>(this.apiUrl, { headers });
  }

  getById(id: string): Observable<Feedback> {
    const headers = this.getAuthHeaders();
    return this.http.get<Feedback>(`${this.apiUrl}/${id}`, { headers });
  }

  create(feedback: CreateFeedbackDto): Observable<Feedback> {
    const headers = this.getAuthHeaders();
    return this.http.post<Feedback>(this.apiUrl, feedback, { headers });
  }

  update(id: string, feedback: Feedback): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, feedback, { headers });
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }
}
