import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly jwtHelper = new JwtHelperService();

  private readonly apiUrl = 'http://localhost:3100/api/auth/login';

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  // Register a new user
  register(user: { username: string; email: string; password: string }) {
    return this.http.post(this.apiUrl, user);
  }

  // Login and store the JWT token
  login(credentials: { email: string; password: string }) {
    return this.http.post(this.apiUrl, credentials).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.data.access_token); // Store the token
        this.router.navigate(['/bookings']); // Redirect to a protected route
      },
      error: (err)=>{
        console.log(err)
      }
    });
  }

  // Logout and remove the token
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/bookings']);
  }

  // Check if the user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !this.jwtHelper.isTokenExpired(token);
  }

  // Get the current user from the token
  getCurrentUser() {
    const token = localStorage.getItem('token');
    if (token) {
      return this.jwtHelper.decodeToken(token);
    }
    return null;
  }
}
