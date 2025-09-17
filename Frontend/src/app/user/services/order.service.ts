import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/auth.service';
import { Order, UpdateOrderDto } from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/api/Payment`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getUserOrders(): Observable<Order[]> {
    const user = this.authService.userValue;
    if (!user || !user.token) {
      throw new Error('No authenticated user.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.token}`
    });

    const userEmail = user.email;
    return this.http.get<Order[]>(`${this.apiUrl}/orders/by-email?email=${userEmail}`, { headers });
  }

  getAllOrders(): Observable<Order[]> {
    const user = this.authService.userValue;
    if (!user || !user.token) {
      throw new Error('No authenticated user.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.token}`
    });

    return this.http.get<Order[]>(`${this.apiUrl}/orders`, { headers });
  }

  updateOrderStatus(orderId: string, status: number): Observable<any> {
    const user = this.authService.userValue;
    if (!user || !user.token) {
      throw new Error('No authenticated user.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.token}`
    });

    const updateDto: UpdateOrderDto = { status };
    return this.http.put(`${this.apiUrl}/order/${orderId}`, updateDto, { headers });
  }

  getOrderById(orderId: string): Observable<Order> {
    const user = this.authService.userValue;
    if (!user || !user.token) {
      throw new Error('No authenticated user.');
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.token}`
    });

    return this.http.get<Order>(`${this.apiUrl}/order/${orderId}`, { headers });
  }
}
