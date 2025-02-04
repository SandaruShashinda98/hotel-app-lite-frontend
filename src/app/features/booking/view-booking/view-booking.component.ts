import { Component, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BookingService } from '../booking.service';
import { IBooking } from '../booking.model';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Location, CommonModule } from '@angular/common';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-view-booking',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDialogModule,
    RouterModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatProgressSpinnerModule,
    LanguageSelectorComponent,
  ],
  templateUrl: './view-booking.component.html',
  styleUrl: './view-booking.component.scss',
})
export class ViewBookingComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  bookings = signal<IBooking[]>([]);
  loading = signal<boolean>(false);
  filterControl = new FormControl('');
  filterControlSite = new FormControl('');
  totalItems = signal<number>(0);
  displayedColumns = [
    'customer_name',
    'mobile_number',
    'clock_in',
    'clock_out',
    'status',
    'actions',
  ];

  constructor(private readonly location: Location) {
    this.filterControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.updateQueryParams({ searchKey: value, start: 1 });
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const size = Number(params['size']) || 10;
      const start = Number(params['start']) || 1;
      const searchKey = params['searchKey'] || '';

      this.filterControl.setValue(searchKey, { emitEvent: false });
      this.loadBookings({ size, start, searchKey });
    });
  }

  loadBookings(filters: { size?: number; start?: number; searchKey?: string }) {
    this.loading.set(true);

    const params = {
      size: filters.size || 10,
      start: filters.start || 1,
      searchKey: filters.searchKey || '',
    };

    this.bookingService.getBookings(params).subscribe({
      next: (res) => {
        this.bookings.set(res.data);
        this.totalItems.set(res.count);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onPageChange(event: PageEvent) {
    this.updateQueryParams({
      size: event.pageSize,
      start: event.pageIndex + 1,
    });
  }

  private updateQueryParams(params: { [key: string]: any }) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: params,
      queryParamsHandling: 'merge',
    });
  }

  deleteBooking(id: number) {
    if (confirm('Are you sure you want to delete this booking?')) {
      this.bookingService.deleteBooking(id).subscribe(() => {
        const currentParams = this.route.snapshot.queryParams;
        this.loadBookings(currentParams);
      });
    }
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return baseClasses;
    }
  }

  //-------------------

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
  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
