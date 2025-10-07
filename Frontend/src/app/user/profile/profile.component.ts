import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/auth.service';


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
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: any = null;
  editProfile: any = {};
  token: string | null = null;
  userId: string | null = null;
  errorMessage: string = '';
  copied = false;
  email: string | null = null;
  roles: string = '';
  editMode: boolean = false;
  ordersVisible: boolean = false;

  orders: Order[] = [];
  ordersLoading = false;
  ordersError = '';

  constructor(private http: HttpClient, private cookieService: CookieService, private authService: AuthService) {}

  ngOnInit() {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.userId = user.id || user.userId || user.UserID;
      this.token = user.token;
      this.fetchProfile(); // Fetch profile on init
    } else {
      this.errorMessage = 'No token found. Please login.';
    }
  }

  fetchProfile() {
    if (this.token && this.userId) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
      this.http.get(`https://localhost:7272/api/Users/${this.userId}`, { headers })
      .subscribe({
        next: (data: any) => {
          this.profile = data;
          this.email = this.profile.email;
          this.roles = Array.isArray(this.profile.roles) ? this.profile.roles.join(', ') : this.profile.roles || '';
        },
        error: () => this.errorMessage = 'Failed to load profile.'
      });
    } else {
      this.errorMessage = 'User ID or token missing. Please login.';
    }
  }

  toggleEdit() {
    if (!this.editMode) {
      // Entering edit mode, initialize editProfile with a copy of profile
      this.editProfile = { ...this.profile };
    }
    this.editMode = !this.editMode;
  }

  saveProfile() {
    if (!this.token) {
      this.errorMessage = 'No token found. Please login.';
      return;
    }
    if (!this.userId) {
      this.errorMessage = 'User ID missing. Cannot update profile.';
      return;
    }
    const userId = this.userId;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    // Prepare payload with only allowed fields
    const rolesValue = this.editProfile.roles || this.editProfile.Roles;
    const updatePayload = {
      Name: this.editProfile.Name || this.editProfile.name,
      ContactNumber: this.editProfile.ContactNumber || this.editProfile.contactNumber,
      Roles: Array.isArray(rolesValue) ? rolesValue.join(',') : rolesValue,
    };

    this.http.put(`https://localhost:7272/api/Users/${userId}`, updatePayload, { headers, observe: 'response' })
      .subscribe({
        next: (response) => {
          if (response.status === 204) {
            // Re-fetch profile from server to ensure data consistency
            this.fetchProfile();
            this.editMode = false;
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Unexpected response from server.';
          }
        },
        error: () => {
          this.errorMessage = 'Failed to save profile.';
        }
      });
  }

  toggleOrders() {
    if (this.ordersVisible) {
      this.ordersVisible = false;
    } else {
      this.ordersVisible = true;
      this.ordersLoading = true;
      this.ordersError = '';
      this.http.get<Order[]>(`https://localhost:7272/api/Payment/orders/by-email?email=${this.email}`)
        .subscribe({
          next: data => {
            this.orders = data;
            this.ordersLoading = false;
          },
          error: () => {
            this.ordersError = 'Could not load orders.';
            this.ordersLoading = false;
          }
        });
    }
  }

  showOrders() {
    this.ordersVisible = false;
  }

  onLogout(): void {
    this.authService.logout();
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
