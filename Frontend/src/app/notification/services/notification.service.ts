import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification, CreateNotificationDto } from '../models/notification.model';
import { environment } from 'src/app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/api/Notification`;

  private notificationCountSubject = new BehaviorSubject<number>(0);
  notificationCount$ = this.notificationCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const token = user.token;
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  getAll(): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Notification[]>(this.apiUrl, { headers });
  }

  getById(id: string): Observable<Notification> {
    const headers = this.getAuthHeaders();
    return this.http.get<Notification>(`${this.apiUrl}/${id}`, { headers });
  }

  getByUserId(userId: string): Observable<Notification[]> {
    const headers = this.getAuthHeaders();
    // Since backend does not expose user-specific endpoint, fetch all and filter client-side
    return this.http.get<Notification[]>(this.apiUrl, { headers }).pipe(
      map((notifications: Notification[]) => notifications.filter((n: Notification) => n.userID === userId))
    );
  }

  create(notification: CreateNotificationDto): Observable<Notification> {
    const headers = this.getAuthHeaders();
    return this.http.post<Notification>(this.apiUrl, notification, { headers });
  }

  update(id: string, notification: Notification): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.put<void>(`${this.apiUrl}/${id}`, notification, { headers });
  }

  delete(id: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers });
  }

  setNotificationCount(count: number): void {
    this.notificationCountSubject.next(count);
  }
}
