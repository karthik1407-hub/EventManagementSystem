import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../auth.service';

// --- NEW: Custom Validator for matching passwords ---
export const passwordsMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  // Return null if controls haven't been initialized yet, or if they match
  if (!password || !confirmPassword || password.value === confirmPassword.value) {
    return null;
  }
  
  // Return a validation error if they don't match
  return { passwordsMismatch: true };
};


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'] // You can reuse login.component.css
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  passwordStrength = ''; // Property to hold password strength

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]], // Increased minLength for better security
      confirmPassword: ['', [Validators.required]],
      terms: [false, [Validators.requiredTrue]] // Checkbox must be true
    }, { 
      validators: passwordsMatchValidator // Apply the custom validator to the whole form
    });
  }

  get f() {
    return this.registerForm.controls;
  }
  
  // --- NEW: Method to check password strength ---
  checkPasswordStrength() {
    const password = this.f['password'].value;
    // Simple regex checks (you can make these more complex)
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (password.length >= 12 && hasLetters && hasNumbers && hasSymbols) {
      this.passwordStrength = 'strong';
    } else if (password.length >= 8 && (hasLetters || hasNumbers || hasSymbols)) {
      this.passwordStrength = 'medium';
    } else if (password.length > 0) {
      this.passwordStrength = 'weak';
    } else {
      this.passwordStrength = '';
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = '';
    this.successMessage = '';
  
    if (this.registerForm.invalid) {
      return;
    }
  
    this.loading = true;
    
    // We only need to send email and password to the service
    const { email, password } = this.registerForm.value;
  
    this.authService.register({ email, password }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: () => {
        this.successMessage = 'Your account has been created! Please check your email to verify.';
        this.registerForm.reset();
        this.submitted = false; // Reset submitted state
      },
      error: (error) => {
        if (error.status === 409) { // 409 Conflict is a better status for "already exists"
          this.errorMessage = 'An account with this email already exists.';
        } else {
          this.errorMessage = 'Something went wrong during registration. Please try again.';
        }
      }
    });    
  }
}