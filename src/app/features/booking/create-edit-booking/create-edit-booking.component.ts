import { Component, inject, OnInit } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BookingService } from '../booking.service';
import { IBooking } from '../booking.model';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../auth/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { IRoom, RoomService } from '../../rooms/rooms.service';

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
    MatSnackBarModule,
    TranslatePipe,
    MatIconModule,
    MatProgressSpinnerModule,
    LanguageSelectorComponent,
  ],
  templateUrl: './create-edit-booking.component.html',
  styleUrl: './create-edit-booking.component.scss',
})
export class CreateEditBookingComponent implements OnInit {
  private readonly bookingService = inject(BookingService);
  private readonly roomService = inject(RoomService); 
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  // Default check-in time: 14:00 (2:00 PM)
  private defaultCheckInTime = '14:00';
  // Default check-out time: 11:00 (11:00 AM)
  private defaultCheckOutTime = '11:00';

  bookingForm = this.fb.group({
    customer_name: ['', Validators.required],
    mobile_number: ['', Validators.required],
    clock_in_date: [new Date(), Validators.required],
    clock_in_time: [this.defaultCheckInTime, Validators.required],
    clock_out_date: [this.addDays(new Date(), 1), Validators.required],
    clock_out_time: [this.defaultCheckOutTime, Validators.required],
    status: ['pending', Validators.required],
    note: [''],
    room_id: ['', Validators.required],
  });

  isEditMode = false;
  bookingId: number | null | any = null;
  availableRooms: IRoom[] = [];
  isLoadingRooms = false;
  submitting = false;

  constructor(private readonly location: Location) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.bookingId = id;
      this.loadBooking();
    } else {
      // For new bookings, initially load available rooms based on default dates
      this.loadAvailableRooms();
    }

    // Watch for date changes to update available rooms
    const dateTimeFields = ['clock_in_date', 'clock_in_time', 'clock_out_date', 'clock_out_time'];
    
    dateTimeFields.forEach(field => {
      this.bookingForm.get(field)?.valueChanges
        .pipe(
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(() => {
          if (this.areDateTimeFieldsValid()) {
            this.loadAvailableRooms();
          }
        });
    });
  }

  private areDateTimeFieldsValid(): boolean {
    const fields = ['clock_in_date', 'clock_in_time', 'clock_out_date', 'clock_out_time'];
    return fields.every(field => this.bookingForm.get(field)?.valid);
  }

  // Helper to add days to a date
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  // Convert form date and time to a single Date object
  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }

  // Split a Date object into separate date and time parts
  private splitDateTime(dateTime: Date): { date: Date, timeStr: string } {
    const date = new Date(dateTime);
    date.setHours(0, 0, 0, 0);
    
    const hours = dateTime.getHours().toString().padStart(2, '0');
    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    return { date, timeStr };
  }

  loadBooking() {
    this.isLoadingRooms = true;
    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (response) => {
        const booking = response.data;
        
        // Split date and time for clock_in
        const clockIn = new Date(booking.clock_in);
        const { date: clockInDate, timeStr: clockInTime } = this.splitDateTime(clockIn);
        
        // Split date and time for clock_out
        const clockOut = new Date(booking.clock_out);
        const { date: clockOutDate, timeStr: clockOutTime } = this.splitDateTime(clockOut);
        
        // Update form with all values
        this.bookingForm.patchValue({
          customer_name: booking.customer_name,
          mobile_number: booking.mobile_number,
          clock_in_date: clockInDate,
          clock_in_time: clockInTime,
          clock_out_date: clockOutDate,
          clock_out_time: clockOutTime,
          status: booking.status,
          note: booking.note,
          room_id: booking.room_id
        });
        
        // Load available rooms including the currently assigned room
        this.loadAvailableRooms(true);
      },
      error: (error) => {
        this.snackBar.open('Error loading booking: ' + error.message, 'Close', {
          duration: 5000
        });
        this.isLoadingRooms = false;
      }
    });
  }

  loadAvailableRooms(includeCurrentRoom: boolean = false) {
    this.isLoadingRooms = true;
    
    // Get values from form
    const clockInDate = this.bookingForm.get('clock_in_date')?.value as Date;
    const clockInTime = this.bookingForm.get('clock_in_time')?.value as string;
    const clockOutDate = this.bookingForm.get('clock_out_date')?.value as Date;
    const clockOutTime = this.bookingForm.get('clock_out_time')?.value as string;
    
    if (!clockInDate || !clockInTime || !clockOutDate || !clockOutTime) {
      this.isLoadingRooms = false;
      return;
    }

    // Combine date and time into Date objects
    const checkIn = this.combineDateAndTime(clockInDate, clockInTime);
    const checkOut = this.combineDateAndTime(clockOutDate, clockOutTime);
    
    this.bookingService.getAvailableRooms(checkIn, checkOut).pipe(
      finalize(() => this.isLoadingRooms = false)
    ).subscribe({
      next: (response) => {
        this.availableRooms = response.data;
        
        // If in edit mode and we need to include the current room
        if (includeCurrentRoom && this.isEditMode) {
          const currentRoomId = this.bookingForm.get('room_id')?.value;
          
          // If current room is not in available rooms (it might be booked by another booking),
          // fetch and add it separately
          if (currentRoomId && !this.availableRooms.some(room => room._id === currentRoomId)) {
            this.roomService.getRoom(Number(currentRoomId) ).subscribe({
              next: (roomResponse) => {
                this.availableRooms = [...this.availableRooms, roomResponse.data];
              }
            });
          }
        }
      },
      error: (error) => {
        this.snackBar.open('Error loading available rooms: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }

  onSubmit() {
    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 3000
      });
      return;
    }

    this.submitting = true;
    const formValues = this.bookingForm.value;
    
    // Combine date and time fields
    const clockIn = this.combineDateAndTime(
      formValues.clock_in_date as Date, 
      formValues.clock_in_time as string
    );
    
    const clockOut = this.combineDateAndTime(
      formValues.clock_out_date as Date, 
      formValues.clock_out_time as string
    );
    
    // Prepare the booking data to send to the API
    const bookingData: IBooking = {
      customer_name: formValues.customer_name as string,
      mobile_number: formValues.mobile_number as string,
      clock_in: clockIn,
      clock_out: clockOut,
      status: formValues.status as 'pending' | 'confirmed' | 'completed' | 'canceled',
      note: formValues.note as string | undefined,
      room_id: formValues.room_id
    };

    const request = this.isEditMode
      ? this.bookingService.updateBooking(this.bookingId, bookingData)
      : this.bookingService.createBooking(bookingData);

    request.pipe(
      finalize(() => this.submitting = false)
    ).subscribe({
      next: (res) => {
        this.snackBar.open(
          this.isEditMode ? 'Booking updated successfully' : 'Booking created successfully',
          'Close',
          { duration: 3000 }
        );
        this.router.navigate(['/bookings/view']);
      },
      error: (error) => {
        this.snackBar.open('Error: ' + error.message, 'Close', {
          duration: 5000
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/bookings/view']);
  }

  // Navigation methods
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

  // Get room price for display
  getRoomPrice(roomId: string): number {
    const room = this.availableRooms.find(r => r._id.toString() === roomId);
    return room ? room.price_per_night : 0;
  }

  // Calculate total price based on nights and room price
  calculateTotalPrice(): number {
    const roomId = this.bookingForm.get('room_id')?.value as string;
    const clockInDate = this.bookingForm.get('clock_in_date')?.value as Date;
    const clockInTime = this.bookingForm.get('clock_in_time')?.value as string;
    const clockOutDate = this.bookingForm.get('clock_out_date')?.value as Date;
    const clockOutTime = this.bookingForm.get('clock_out_time')?.value as string;
    
    if (!roomId || !clockInDate || !clockInTime || !clockOutDate || !clockOutTime) {
      return 0;
    }
    
    // Combine date and time
    const checkIn = this.combineDateAndTime(clockInDate, clockInTime);
    const checkOut = this.combineDateAndTime(clockOutDate, clockOutTime);
    
    const room = this.availableRooms.find(r => r._id.toString() === roomId);
    if (!room) {
      return 0;
    }
    
    // Calculate nights - consider even partial days as a full night
    const nightsCount = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 3600 * 24)
    );
    
    return room.price_per_night * (nightsCount > 0 ? nightsCount : 1);
  }
}