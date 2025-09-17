import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
 
interface Order {
  id: string;
  userId: string;
  email: string;
  paymentId: string;
  status: number;
  createdDate: string;
  updatedDate: string;
  statusString: string;
}
 
@Component({
  selector: 'app-profile',
  templateUrl: './user.component.html'
})
export class UserComponent implements OnInit {
  profile: any = null;
  token: string | null = null;
  errorMessage: string = '';
  copied = false;
  email: string | null = null;
  roles: string = '';
 
  orders: Order[] = [];
  ordersLoading = false;
  ordersError = '';
  ordersVisible = false;
 
  constructor(private http: HttpClient, private cookieService: CookieService) {}
 
  ngOnInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      const token = user.token;
      if (token) {
        this.token = token;
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        this.http.get('https://localhost:7272/api/Auth/token-details', { headers })
        .subscribe({
          next: (data) => {
            this.profile = data;
            this.email = this.profile.email; // Set useremail from profile data
            this.roles = Array.isArray(this.profile.roles) ? this.profile.roles.join(', ') : this.profile.roles || '';
          },
          error: () => this.errorMessage = 'Failed to load profile.'
        });
      } else {
        this.errorMessage = 'No token found. Please login.';
      }
    } else {
      this.errorMessage = 'No token found. Please login.';
    }
  }
 
 
  copyToken() {
    if (this.token) {
      navigator.clipboard.writeText(this.token).then(() => {
        this.copied = true;
        setTimeout(() => this.copied = false, 1500);
      });
    }
  }
}
 