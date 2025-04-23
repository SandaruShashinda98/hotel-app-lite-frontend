import { Component, inject } from '@angular/core';
import { Location, CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { AuthService } from '../../auth/auth.service';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { IRoom, RoomService } from '../rooms.service';

@Component({
  selector: 'app-create-edit-room',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule,
    TranslatePipe,
    LanguageSelectorComponent,
  ],
  templateUrl: './create-edit-rooms.component.html',
  styleUrl: './create-edit-rooms.component.scss',
})
export class CreateEditRoomComponent {
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  
  roomForm = this.fb.group({
    name: ['', Validators.required],
    room_number: ['', Validators.required],
    room_type: ['', Validators.required],
    capacity: [1, [Validators.required, Validators.min(1)]],
    price_per_night: [0, [Validators.required, Validators.min(0)]],
    description: [''],
    amenities: this.fb.array([]),
    status: ['available', Validators.required],
  });

  roomTypes = [
    { value: 'SINGLE', label: 'Single' },
    { value: 'DOUBLE', label: 'Double' },
    { value: 'SUITE', label: 'Suite' },
    { value: 'DELUXE', label: 'Deluxe' },
    { value: 'FAMILY', label: 'Family' },
  ];

  statusOptions = [
    { value: 'available', label: 'Available' },
    { value: 'occupied', label: 'Occupied' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  isEditMode = false;
  roomId: number | null | any = null;
  amenities: string[] = [];

  constructor(private readonly location: Location) {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.roomId = id;
      this.loadRoom();
    }
  }

  loadRoom() {
    this.roomService.getRoom(this.roomId).subscribe((room) => {
      this.roomForm.patchValue({
        name: room.data.name,
        room_number: room.data.room_number,
        room_type: room.data.room_type,
        capacity: room.data.capacity,
        price_per_night: room.data.price_per_night,
        description: room.data.description || '',
        status: room.data.status,
      });
      
      if (room.data.amenities && room.data.amenities.length > 0) {
        this.amenities = [...room.data.amenities];
      }
    });
  }

  onSubmit() {
    if (this.roomForm.valid) {
      const formValue = this.roomForm.value;
      const room: IRoom = {
        name: formValue.name!,
        room_number: formValue.room_number!,
        room_type: formValue.room_type!,
        capacity: formValue.capacity!,
        price_per_night: formValue.price_per_night!,
        // description: formValue.description,
        amenities: this.amenities,
        status: formValue.status as 'available' | 'occupied' | 'maintenance',
      };

      const request = this.isEditMode
        ? this.roomService.updateRoom(this.roomId, room)
        : this.roomService.createRoom(room);

      request.subscribe({
        next: () => {
          this.router.navigate(['/rooms']);
        },
        error: (error) => console.error(error),
      });
    }
  }

  addAmenity(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value) {
      this.amenities.push(value);
    }
    event.chipInput!.clear();
  }

  removeAmenity(amenity: string): void {
    const index = this.amenities.indexOf(amenity);
    if (index >= 0) {
      this.amenities.splice(index, 1);
    }
  }

  goBack() {
    this.router.navigate(['/rooms']);
  }

  // Navigation methods
  onBackClick() {
    this.location.back();
  }
  
  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}