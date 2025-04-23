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
import { UserService } from '../users.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../auth/auth.service';
import { BookingService } from '../../booking/booking.service';
import { MatIconModule } from '@angular/material/icon';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-create-edit-users',
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
  templateUrl: './create-edit-users.component.html',
  styleUrl: './create-edit-users.component.scss',
})
export class CreateEditUsersComponent {
  private readonly bookingService = inject(BookingService);
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);

  userForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    username: ['', Validators.required],
    email: ['', Validators.required],
    role_permission: ['ADMIN', Validators.required],
  });

  isEditMode = false;
  userId: any = null;

  constructor(private readonly location: Location) {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.userId = id;
      this.loadUsers();
    }
  }

  loadUsers() {
    this.userService.getUser(this.userId).subscribe((booking) => {
      this.userForm.patchValue(booking.data);
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const user = this.userForm.value;
      const request = this.isEditMode
        ? this.userService.updateUser(this.userId, user)
        : this.userService.createUser(user);

      request.subscribe({
        next: (res) => {
          this.router.navigate(['/users']);
        },
        error: (error) => console.error(error),
      });
    }
  }

  goBack() {
    this.router.navigate(['/users']);
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
