import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'bookings',
    loadChildren: () =>
      import('./features/booking/booking.routes').then((m) => m.BOOKING_ROUTES),
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
  },
  {
    path: '',
    redirectTo: 'bookings',
    pathMatch: 'full',
  },
];
