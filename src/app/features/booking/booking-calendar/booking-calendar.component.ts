import { Component, inject, signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { BookingService } from '../booking.service';
import {
  CalendarEvent,
  CalendarModule,
  DateAdapter,
  CalendarUtils,
  CalendarA11y,
  CalendarDateFormatter,
  CalendarEventTitleFormatter,
  CalendarView,
} from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { Location, CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

export const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
};

@Component({
  selector: 'app-booking-calendar',
  standalone: true,
  imports: [
    CommonModule,
    CalendarModule,
    FormsModule,
    MatIconModule,
    LanguageSelectorComponent,
    MatButtonModule,
    TranslatePipe,
  ],
  providers: [
    provideAnimations(),
    {
      provide: DateAdapter,
      useFactory: adapterFactory,
      deps: [],
    },
    CalendarUtils,
    CalendarA11y,
    CalendarDateFormatter,
    CalendarEventTitleFormatter,
  ],
  templateUrl: './booking-calendar.component.html',
  styleUrl: './booking-calendar.component.scss',
})
export class BookingCalendarComponent {
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  view: CalendarView = CalendarView.Month;
  viewDate: Date = new Date();
  activeDayIsOpen: boolean = false;
  selectedMonth: number = new Date().getMonth();
  selectedYear: number = new Date().getFullYear();

  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  years: number[] = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - 5 + i
  );

  events: CalendarEvent[] = [];
  isAdmin = signal<boolean>(true);
  refresh: Subject<any> = new Subject();

  constructor(
    private readonly bookingService: BookingService,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser.role_permission === 'STAFF') {
      this.isAdmin.set(false);
    }

    this.bookingService.getBookings().subscribe({
      next: (res) => {
        this.events = res.data.map((booking) => ({
          id: booking._id,
          title: `Customer: ${booking.customer_name}. From: ${new Date(
            booking.clock_in
          ).toLocaleTimeString()} To: ${new Date(
            booking.clock_out
          ).toLocaleTimeString()}. Status: ${booking.status}`,
          color: colors.blue,
          start: new Date(booking.clock_in),
          end: new Date(booking.clock_out),
        }));
        this.refresh.next(null);
      },
    });
  }

  incrementMonth(): void {
    this.viewDate = new Date(
      this.viewDate.setMonth(this.viewDate.getMonth() + 1)
    );
    this.selectedMonth = this.viewDate.getMonth();
    this.selectedYear = this.viewDate.getFullYear();
  }

  decrementMonth(): void {
    this.viewDate = new Date(
      this.viewDate.setMonth(this.viewDate.getMonth() - 1)
    );
    this.selectedMonth = this.viewDate.getMonth();
    this.selectedYear = this.viewDate.getFullYear();
  }

  today(): void {
    this.viewDate = new Date();
    this.selectedMonth = this.viewDate.getMonth();
    this.selectedYear = this.viewDate.getFullYear();
  }

  monthChanged(): void {
    this.viewDate = new Date(this.selectedYear, this.selectedMonth);
  }

  yearChanged(): void {
    this.viewDate = new Date(this.selectedYear, this.selectedMonth);
  }

  dayClicked(day: any): void {
    const clickedDate = day.date;
    const isSameDay = this.viewDate.getDate() === clickedDate.getDate();

    if (isSameDay) {
      this.activeDayIsOpen = !this.activeDayIsOpen;
    } else {
      this.activeDayIsOpen = true;
    }
    this.viewDate = clickedDate;
  }

  handleEventClick(event: { event: CalendarEvent }): void {
    console.log('Event clicked:', event.event);
  }

  eventTimesChanged({ event, newStart, newEnd }: any): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next(null);
  }

  //------------
  onBackClick() {
    this.location.back();
  }
  onCalenderClick() {
    this.router.navigate(['/bookings']);
  }
  onUserClick() {
    this.router.navigate(['/users']);
  }
  onBookingClick() {
    this.router.navigate(['/bookings/view']);
  }

  onRoomsClick() {
    this.router.navigate(['/rooms']);
  }
  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
