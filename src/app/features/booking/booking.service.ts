import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IBooking } from './booking.model';

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

  deleteBooking(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  //---- calender
  mockBookings = [
    {
      guestName: 'John Doe',
      roomNumber: '101',
      bookingSource: 'Website',
      startDate: '2023-10-01T14:00:00',
      endDate: '2023-10-03T10:00:00',
    },
    {
      guestName: 'Jane Smith',
      roomNumber: '202',
      bookingSource: 'Travel Agency',
      startDate: '2023-10-05T12:00:00',
      endDate: '2023-10-07T11:00:00',
    },
    {
      guestName: 'Alice Johnson',
      roomNumber: '303',
      bookingSource: 'Phone Reservation',
      startDate: '2023-10-10T15:00:00',
      endDate: '2023-10-12T09:00:00',
    },
  ];

  async initializeGoogleCalendar() {
    // Load the Google Calendar API
    // await gapi.client.init({
    //   apiKey: this.API_KEY,
    //   clientId: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
    //   discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    //   scope: 'https://www.googleapis.com/auth/calendar'
    // });
  }

  async addBookingsToCalendar(bookings: any[]) {
    // const events = this.mockBookings.map(booking => ({
    //   'summary': `Booking: ${booking.guestName}`,
    //   'description': `Room: ${booking.roomNumber}\nSource: ${booking.bookingSource}`,
    //   'start': {
    //     'dateTime': booking.startDate,
    //     'timeZone': 'YOUR_TIMEZONE'
    //   },
    //   'end': {
    //     'dateTime': booking.endDate,
    //     'timeZone': 'YOUR_TIMEZONE'
    //   }
    // }));
    // for (const event of events) {
    //   await gapi.client.calendar.events.insert({
    //     'calendarId': this.CALENDAR_ID,
    //     'resource': event
    //   });
    // }
  }
}
