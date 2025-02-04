import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'http://localhost:3100/api/users';
  private readonly http = inject(HttpClient);

  getUsers(filters?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, {
      params: filters,
    });
  }

  getUser(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createUser(booking: any): Observable<any> {
    return this.http.patch<any>(this.apiUrl, booking);
  }

  updateUser(id: number, booking: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, booking);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
