import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBooking } from './booking.model';
import { IRoom } from '../rooms/rooms.service';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly apiUrl = 'http://localhost:3100/api/bookings';
  private readonly http = inject(HttpClient);

  private readonly API_KEY = 'YOUR_GOOGLE_API_KEY';
  private readonly CALENDAR_ID = 'YOUR_CALENDAR_ID';

  getBookings(filters?: any): Observable<{ data: IBooking[]; count: number }> {
    return this.http.get<{ data: IBooking[]; count: number }>(this.apiUrl, {
      params: filters,
    });
  }

  getBooking(id: number): Observable<{ data: IBooking }> {
    return this.http.get<{ data: IBooking }>(`${this.apiUrl}/${id}`);
  }

  createBooking(booking: IBooking): Observable<IBooking> {
    return this.http.post<IBooking>(this.apiUrl, booking);
  }

  updateBooking(id: number, booking: IBooking): Observable<IBooking> {
    return this.http.patch<IBooking>(`${this.apiUrl}/${id}`, booking);
  }

  updateChecking(id: number, booking: Partial<IBooking>): Observable<IBooking> {
    return this.http.patch<IBooking>(`${this.apiUrl}/check/${id}`, booking);
  }

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAvailableRooms(
    checkIn: Date,
    checkOut: Date
  ): Observable<{ data: IRoom[]; count: number }> {
    const params = {
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
    };

    return this.http.get<{ data: IRoom[]; count: number }>(
      `${this.apiUrl}/available-rooms`,
      {
        params,
      }
    );
  }
}
