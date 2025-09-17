import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/app/environments/environment';
import { AuthService } from 'src/app/auth.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = `${environment.apiUrl}/api/Payment`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  checkout(amount: number): Observable<any> {
    const user = this.authService.userValue;
    if (!user || !user.token) {
      return throwError(() => new Error('User not authenticated.'));
    }

    const userId = this.authService.getUserId();
    if (!userId) {
      return throwError(() => new Error('User ID not found.'));
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${user.token}`
    });

    // Step 1: Create the payment
    const createPaymentDto = {
      userId: userId,
      amount: amount,
      method: 'Card', // Assuming 'Card' as the method
      status: 0, // Assuming 0 for 'Pending' or 'Processing'
      transactionId: 'temp' // A temporary transaction ID
    };

    return this.http.post<any>(`${this.apiUrl}/payment`, createPaymentDto, { headers }).pipe(
      switchMap(paymentResponse => {
        // Step 2: Complete the order
        const paymentId = paymentResponse.id;
        return this.http.post(`${this.apiUrl}/complete-order?UserId=${userId}&PaymentId=${paymentId}`, {}, { headers });
      })
    );
  }
}