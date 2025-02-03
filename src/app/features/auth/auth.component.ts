import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Component, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent implements OnInit {
  isLogin = true;
  showPassword = true;
  authForm: FormGroup;
  isLoading = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly snackBar: MatSnackBar,
    private readonly router: Router,
    private readonly authService: AuthService
  ) {
    this.authForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      name: [''],
      confirmPassword: [''],
    });
  }

  ngOnInit(): void {}

  toggleForm(): void {
    this.isLogin = !this.isLogin;
    if (this.isLogin) {
      this.authForm.get('name')?.clearValidators();
      this.authForm.get('confirmPassword')?.clearValidators();
    } else {
      this.authForm.get('name')?.setValidators([Validators.required]);
      this.authForm
        .get('confirmPassword')
        ?.setValidators([
          Validators.required,
          this.passwordMatchValidator.bind(this),
        ]);
    }
    this.authForm.reset();
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    if (
      control.value &&
      control.value !== this.authForm.get('password')?.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.authForm.valid) {
      console.log(this.authForm.value);
      this.authService.login(this.authForm.value);

      this.snackBar.open(
        `Successfully ${this.isLogin ? 'logged in' : 'registered'}!`,
        'Close',
        { duration: 3000 }
      );
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.authForm.get(controlName);
    if (control?.hasError('required')) {
      return 'This field is required';
    }
    if (control?.hasError('email')) {
      return 'Please enter a valid email';
    }
    if (control?.hasError('minlength')) {
      return 'Password must be at least 6 characters';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }
}

// <div class="min-h-screen bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center p-4">
//     <div class="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 relative">
//       <!-- Decorative Elements -->
//       <div class="absolute top-12 left-12">
//         <div class="w-3 h-3 rounded-full bg-blue-400"></div>
//       </div>
//       <div class="absolute top-24 right-16">
//         <div class="w-3 h-3 transform rotate-45 bg-green-400"></div>
//       </div>
//       <div class="absolute bottom-16 left-20">
//         <div class="w-3 h-3 transform rotate-45 bg-green-400"></div>
//       </div>
//       <div class="absolute top-32 left-24">
//         <div class="w-2 h-2 rounded-full bg-blue-400"></div>
//       </div>

//       <!-- Main Content -->
//       <div class="text-center mb-8">
//         <h1 class="text-2xl font-semibold text-gray-800 mb-12">Member Login</h1>

//         <!-- User Icon Circle -->
//         <div class="relative w-32 h-32 mx-auto mb-12 bg-gray-100 rounded-full flex items-center justify-center">
//           <svg class="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
//                   d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//           </svg>
//         </div>
//       </div>

//       <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="space-y-6">
//         <!-- Email Input -->
//         <div class="relative">
//           <input type="email"
//                  formControlName="email"
//                  class="w-full bg-gray-100 rounded-full py-3 px-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                  placeholder="Email">
//           <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
//             <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//                     d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//             </svg>
//           </div>
//         </div>

//         <!-- Password Input -->
//         <div class="relative">
//           <input type="password"
//                  formControlName="password"
//                  class="w-full bg-gray-100 rounded-full py-3 px-6 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                  placeholder="Password">
//           <div class="absolute left-4 top-1/2 transform -translate-y-1/2">
//             <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
//                     d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//             </svg>
//           </div>
//         </div>

//         <!-- Login Button -->
//         <button type="submit"
//                 class="w-full bg-green-500 hover:bg-green-600 text-white rounded-full py-3 px-6 transition-colors duration-300">
//           LOGIN
//         </button>

//         <!-- Forgot Password Link -->
//         <div class="text-center mt-4">
//           <a href="#" class="text-gray-500 hover:text-gray-700 text-sm">
//             Forgot Username / Password?
//           </a>
//         </div>

//         <!-- Create Account Link -->
//         <div class="text-center mt-6">
//           <a href="#" class="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center">
//             Create your Account
//             <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
//             </svg>
//           </a>
//         </div>
//       </form>
//     </div>
//   </div>
