import { Routes } from '@angular/router';
import { CreateEditBookingComponent } from './create-edit-booking/create-edit-booking.component';
import { ViewBookingComponent } from './view-booking/view-booking.component';
import { BookingCalendarComponent } from './booking-calendar/booking-calendar.component';

export const BOOKING_ROUTES: Routes = [
  {
    path: '',
    component: BookingCalendarComponent,
  },
  {
    path: 'view',
    component: ViewBookingComponent,
  },
  {
    path: 'view/new',
    component: CreateEditBookingComponent,
  },
  {
    path: 'view/:id/edit',
    component: CreateEditBookingComponent,
  },
];
