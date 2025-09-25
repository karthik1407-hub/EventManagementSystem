import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  loading = false;
  
  // Renamed to match the modern template's variable for displaying errors
  errorMessage = ''; 
  successMessage = ''; // Kept for consistency, though less used on redirect

  // Property for the password visibility toggle
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    // Best practice: Redirect if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']); // Or a dashboard route like '/user'
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.loginForm.controls; }

  // Method to toggle password visibility
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = ''; // Reset error on new submission

    // Stop here if the form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    this.authService.login(this.loginForm.value).pipe(
      // The finalize operator runs when the observable completes or errors
      // It's the perfect place to set loading to false, avoiding code duplication
      finalize(() => this.loading = false)
    ).subscribe({
      // The 'next' handler is for successful responses
      next: () => {
        // On successful login, navigate the user to feedback page
        this.router.navigate(['/admin']);
        // A toast notification service would be ideal here instead of a message
      },
      // The 'error' handler is for failed responses
      error: (err) => {
        // Set the error message to be displayed in the template
        this.errorMessage = err.error.errors?.['']?.[0] || err.error.message || "An unexpected error occurred. Please try again later.";
        console.error(err); // Log the actual error for debugging
      }
    });
  }
}