import { Component, OnInit } from '@angular/core';
import { CartService, OrderBasketDto, OrderBasketItemDto } from './services/cart.service';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { EventService } from '../event/services/event.service';
import { Event } from '../event/models/event.model';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  basket: OrderBasketDto | null = null;
  events: { [key: string]: Event } = {};
  isLoading: boolean = false;
  error: string = '';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private router: Router,
    private eventService: EventService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const user = this.authService.userValue;
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.cartService.getOrCreateOrderBasket(user.id).subscribe({
      next: (basket) => {
        this.basket = basket;
        this.loadEventDetails();
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  loadEventDetails(): void {
    if (!this.basket?.items) return;

    const eventIds = this.basket.items.map(item => item.eventId);
    eventIds.forEach(id => {
      this.eventService.getEventById(id).subscribe({
        next: (event) => {
          this.events[id] = event;
        },
        error: (err) => {
          console.error('Error loading event:', err);
        }
      });
    });
  }

  getTotalPrice(): number {
    if (!this.basket?.items) return 0;
    return this.basket.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }

  updateQuantity(item: OrderBasketItemDto, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(item.id);
      return;
    }

    const dto = {
      productId: item.eventId,
      quantity: quantity,
      unitPrice: item.unitPrice
    };

    this.cartService.updateCartItem(item.id, dto).subscribe({
      next: (updated) => {
        item.quantity = updated.quantity;
        if (this.basket) {
          this.cartService.setBasket(this.basket);
        }
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
        alert('Failed to update quantity.');
      }
    });
  }

  removeItem(itemId: string): void {
    this.cartService.removeFromCart(itemId).subscribe({
      next: () => {
        if (this.basket) {
          this.basket.items = this.basket.items.filter(item => item.id !== itemId);
          this.cartService.setBasket(this.basket);
        }
      },
      error: (err) => {
        console.error('Error removing item:', err);
        alert('Failed to remove item.');
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.basket || this.basket.items.length === 0) {
      alert('Your cart is empty.');
      return;
    }

    // Navigate to payment with cart data
    this.router.navigate(['/payment'], { state: { basket: this.basket, events: this.events } });
  }
}
