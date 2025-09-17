import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { environment } from '../environments/environment';
import { User } from '../user/models/user.model';

@Component({
  selector: 'app-admin-user',
  templateUrl: './admin-user.component.html',
  styleUrls: ['./admin-user.component.css']
})
export class AdminUserComponent implements OnInit {
  // --- Injected Services ---
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private formBuilder = inject(FormBuilder);

  // --- API Configuration ---
  private readonly API_URL = environment.apiUrl;

  // --- State Management with Signals ---
  users: WritableSignal<User[]> = signal([]);
  isLoading = signal(true);
  errorMessage = signal('');
  showUserForm = signal(false);
  editingUser = signal<number | null>(null);
  userForm!: FormGroup;

  ngOnInit(): void {
    this.userForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', [Validators.required, Validators.pattern(/^\\+?[\\d\\s\\-\\(\\)]+$/)]],
      roles: ['']
    });
    this.loadUsers();
    this.checkForEditParam();
  }

  private checkForEditParam(): void {
    this.route.queryParams.subscribe(params => {
      const editId = params['edit'];
      if (editId) {
        const userId = parseInt(editId, 10);
        if (!isNaN(userId)) {
          this.editUserById(userId);
        }
      }
    });
  }

  private editUserById(userId: number): void {
    const user = this.users().find(u => u.userID === userId);
    if (user) {
      this.showEditUserForm(user);
    }
  }

  // --- Data Loading ---
  private getAuthHeaders(): HttpHeaders {
    const userString = localStorage.getItem('user');
    if (!userString) return new HttpHeaders();
    const user = JSON.parse(userString);
    return user?.token ? new HttpHeaders({ 'Authorization': `Bearer ${user.token}` }) : new HttpHeaders();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    const headers = this.getAuthHeaders();

    this.http.get<User[]>(`${this.API_URL}/api/Users`, { headers }).subscribe({
      next: (data) => {
        this.users.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load users', err);
        this.errorMessage.set('Failed to load users. Please try again later.');
        this.isLoading.set(false);
      }
    });
  }

  // --- CRUD Methods ---
  showAddUserForm(): void {
    this.initializeUserForm();
    this.showUserForm.set(true);
    this.editingUser.set(null);
  }

  showEditUserForm(user: User): void {
    this.initializeUserForm(user);
    this.showUserForm.set(true);
    this.editingUser.set(user.userID);
  }

  hideUserForm(): void {
    this.showUserForm.set(false);
    this.editingUser.set(null);
    this.userForm.reset();
  }

  private initializeUserForm(user?: User): void {
    this.userForm = this.formBuilder.group({
      name: [user?.name || '', [Validators.required, Validators.minLength(2)]],
      email: [user?.email || '', [Validators.required, Validators.email]],
      contactNumber: [user?.contactNumber || '', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      roles: [user?.roles || []]
    });
  }

  saveUser(): void {
    if (!this.userForm.valid) {
      this.errorMessage.set('Please fill in all required fields correctly.');
      return;
    }

    const formData = this.userForm.value;
    const headers = this.getAuthHeaders();
    const isEditing = this.editingUser() !== null;

    if (isEditing) {
      // Update existing user
      const userId = this.editingUser();
      this.http.put(`${this.API_URL}/api/Users/${userId}`, formData, { headers }).subscribe({
        next: (updatedUser: any) => {
          this.users.update(users =>
            users.map(u => u.userID === userId ? updatedUser : u)
          );
          this.hideUserForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to update user', err);
          this.errorMessage.set('Failed to update user. Please try again.');
        }
      });
    } else {
      // Create new user
      this.http.post(`${this.API_URL}/api/Users`, formData, { headers }).subscribe({
        next: (newUser: any) => {
          this.users.update(users => [...users, newUser]);
          this.hideUserForm();
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to create user', err);
          this.errorMessage.set('Failed to create user. Please try again.');
        }
      });
    }
  }

  deleteUser(user: User): void {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      const headers = this.getAuthHeaders();
      this.http.delete(`${this.API_URL}/api/Users/${user.userID}`, { headers }).subscribe({
        next: () => {
          this.users.update(users => users.filter(u => u.userID !== user.userID));
          this.errorMessage.set('');
        },
        error: (err) => {
          console.error('Failed to delete user', err);
          this.errorMessage.set('Failed to delete user. Please try again.');
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/admin']);
  }
}
