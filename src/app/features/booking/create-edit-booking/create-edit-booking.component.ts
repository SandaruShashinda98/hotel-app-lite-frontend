import { Component, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../booking.service';
import { IBooking } from '../booking.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-create-edit-booking',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
    MatButtonModule,
    MatNativeDateModule,
    TranslatePipe,
    MatIconModule,
    LanguageSelectorComponent,
  ],
  templateUrl: './create-edit-booking.component.html',
  styleUrl: './create-edit-booking.component.scss',
})
export class CreateEditBookingComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  bookingForm = this.fb.group({
    customer_name: ['', Validators.required],
    mobile_number: ['', Validators.required],
    clock_in: [new Date(), Validators.required],
    clock_out: [new Date(), Validators.required],
    status: ['pending', Validators.required],
    notes: [''],
  });

  isEditMode = false;
  bookingId: number | null | any = null;

  constructor(private readonly location: Location) {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.bookingId = id;
      this.loadBooking();
    }
  }

  loadBooking() {
    this.bookingService.getBooking(this.bookingId).subscribe((booking) => {
      this.bookingForm.patchValue(booking.data);
    });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const booking = this.bookingForm.value;
      const request = this.isEditMode
        ? this.bookingService.updateBooking(this.bookingId, booking as IBooking)
        : this.bookingService.createBooking(booking as IBooking);

      request.subscribe({
        next: (res) => {
          this.router.navigate(['/bookings/view']);
        },
        error: (error) => console.error(error),
      });
    }
  }

  goBack() {
    this.router.navigate(['/bookings']);
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
