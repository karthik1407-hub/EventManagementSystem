import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from './environments/environment';

interface User {
  email: string;
  token: string;
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null>;
  public user$: Observable<User | null>;
  public isLoggedIn$: Observable<boolean>;

  constructor(private router: Router, private http: HttpClient) {
    const storedUser = localStorage.getItem('user');
    const initialUser = storedUser ? JSON.parse(storedUser) : null;
    this.userSubject = new BehaviorSubject<User | null>(initialUser);
    this.user$ = this.userSubject.asObservable();
    this.isLoggedIn$ = this.user$.pipe(map(user => !!user));
  }

  public get userValue(): User | null {
    return this.userSubject.value;
  }

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/login`, credentials).pipe(
      tap((response: any) => {
        if (response && response.token) {
          this.handleAuthentication(credentials.email, response.token);
        }
      })
    );
  }

  register(credentials: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/api/auth/register`, credentials).pipe(
      tap(() => this.router.navigate(['/login']))
    );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.userValue;
  }

  getUserEmail(): string | null {
    return this.userValue ? this.userValue.email : null;
  }

  getUserRole(): string | null {
    const user = this.userValue;
    if (!user || !user.token) return null;
    try {
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      const roles = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      if (Array.isArray(roles)) {
        return roles[0]; // Return the first role if it's an array
      }
      return roles;
    } catch (e) {
      return null;
    }
  }

  getUserId(): string | null {
    const user = this.userValue;
    if (!user || !user.token) return null;
    try {
      const payload = JSON.parse(atob(user.token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid;
    } catch (e) {
      return null;
    }
  }

  private handleAuthentication(email: string, token: string): void {
    const id = this.getUserIdFromToken(token);
    const userData: User = { email, token, id };
    localStorage.setItem('user', JSON.stringify(userData));
    this.userSubject.next(userData);
    this.router.navigate(['/']);
  }

  private getUserIdFromToken(token: string): string {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.nameid || '';
    } catch (e) {
      return '';
    }
  }
}