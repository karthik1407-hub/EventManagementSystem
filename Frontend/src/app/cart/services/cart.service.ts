import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../auth.service';

export interface OrderBasketDto {
  id: string;
  userId: string;
  createdDate: string;
  updatedDate: string;
  items: OrderBasketItemDto[];
}

export interface OrderBasketItemDto {
  id: string;
  orderBasketId: string;
  eventId: string;
  quantity: number;
  unitPrice: number;
  addedDate: string;
}

export interface CreateOrderBasketDto {
  userId: string;
}

export interface CreateOrderBasketItemDto {
  orderBasketId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'https://localhost:7272/api/Payment';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get or create order basket for user
  getOrCreateOrderBasket(userId: string): Observable<OrderBasketDto> {
    return this.http.get<OrderBasketDto>(`${this.apiUrl}/orderbasket/by-user/${userId}`);
  }

  // Add item to basket
  addToCart(dto: CreateOrderBasketItemDto): Observable<OrderBasketItemDto> {
    return this.http.post<OrderBasketItemDto>(`${this.apiUrl}/orderbasketitem`, dto);
  }

  // Get basket items
  getBasketItems(basketId: string): Observable<OrderBasketItemDto[]> {
    return this.http.get<OrderBasketItemDto[]>(`${this.apiUrl}/orderbasketitems/${basketId}`);
  }

  // Remove item from basket
  removeFromCart(itemId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/orderbasketitem/${itemId}`);
  }

  // Update item quantity
  updateCartItem(itemId: string, dto: { productId: string; quantity: number; unitPrice: number }): Observable<OrderBasketItemDto> {
    return this.http.put<OrderBasketItemDto>(`${this.apiUrl}/orderbasketitem/${itemId}`, dto);
  }
}
