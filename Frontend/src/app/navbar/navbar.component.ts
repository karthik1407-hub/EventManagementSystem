import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { AuthService } from '../auth.service';
import { NotificationService } from '../notification/services/notification.service';
import { CartService } from '../cart/services/cart.service';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Notification } from '../notification/models/notification.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  // Observables for reactive UI updates
  isLoggedIn$!: Observable<boolean>;
  userEmail$!: Observable<string | null>;
  notificationCount: number = 0;
  notifications: Notification[] = []; // To store fetched notifications
  showNotificationsDropdown: boolean = false; // To control dropdown visibility
  cartItemCount: number = 0;
  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService, private notificationService: NotificationService, private cartService: CartService, private elementRef: ElementRef) { }

  ngOnInit(): void {
    // Connect to the observables from the AuthService
    this.isLoggedIn$ = this.authService.isLoggedIn$;

    // Get the user's email from the user$ observable
    this.userEmail$ = this.authService.user$.pipe(
      map(user => user ? user.email : null)
    );

    // Load notification count and cart item count if user is logged in
    this.subscription.add(
      this.isLoggedIn$.subscribe(isLoggedIn => {
        if (isLoggedIn && this.isUser()) {
          this.loadNotifications(); // Changed to load all notifications
          this.loadCartItemCount();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.showNotificationsDropdown = false;
    }
  }

  /**
   * Checks if the current user is a regular user.
   * Delegates the logic to the central AuthService.
   */
  isUser(): boolean {
    return this.authService.getUserRole() === 'Attendee';
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'Admin';
  }

  /**
   * Checks if the current user is an organizer.
   * Delegates the logic to the central AuthService.
   */
  isOrganizer(): boolean {
    return this.authService.getUserRole() === 'Event Organizer';
  }

  /**
   * Loads the notifications for the current user.
   */
  private loadNotifications(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    this.subscription.add(
      this.notificationService.getByUserId(userId).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.notificationCount = notifications.length;
        },
        error: (err) => {
          console.error('Failed to load notifications', err);
          this.notifications = [];
          this.notificationCount = 0;
        }
      })
    );
  }

  /**
   * Loads the cart item count for the current user.
   */
  private loadCartItemCount(): void {
    const user = this.authService.userValue;
    if (!user) return;

    this.subscription.add(
      this.cartService.getOrCreateOrderBasket(user.id).subscribe({
        next: (basket) => {
          this.cartItemCount = basket.items ? basket.items.length : 0;
        },
        error: (err) => {
          console.error('Failed to load cart item count', err);
          this.cartItemCount = 0;
        }
      })
    );
  }

  /**
   * Toggles the visibility of the notifications dropdown.
   */
  toggleNotificationsDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
  }

  /**
   * Handles the logout action by calling the AuthService.
   */
  onLogout(): void {
    this.authService.logout();
  }

  deleteNotification(notificationId: string): void {
    this.notificationService.delete(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(n => n.notificationID !== notificationId);
        this.notificationCount = this.notifications.length;
      },
      error: (err) => {
        console.error('Failed to delete notification', err);
      }
    });
  }
}

