import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification>({ message: '', type: 'info', show: false });
  public notification$ = this.notificationSubject.asObservable();

  showNotification(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.notificationSubject.next({ message, type, show: true });
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideNotification(), 5000);
  }

  hideNotification(): void {
    this.notificationSubject.next({ message: '', type: 'info', show: false });
  }
}
