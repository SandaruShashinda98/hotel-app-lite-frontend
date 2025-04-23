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
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../auth/auth.service';
import { Location, CommonModule } from '@angular/common';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';
import { MatSelectModule } from '@angular/material/select';
import { IRoom, RoomService } from '../rooms.service';

@Component({
  selector: 'app-view-rooms',
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
  templateUrl: './view-rooms.component.html',
  styleUrl: './view-rooms.component.scss',
})
export class ViewRoomsComponent {
  private readonly roomService = inject(RoomService);
  private readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  rooms = signal<IRoom[]>([]);
  loading = signal<boolean>(false);
  filterControl = new FormControl('');
  filterControlType = new FormControl('');
  totalItems = signal<number>(0);
  displayedColumns = [
    'name',
    'room_number',
    'room_type',
    'capacity',
    'price_per_night',
    'status',
    'actions',
  ];

  constructor(private readonly location: Location) {
    this.filterControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.updateQueryParams({ searchKey: value, start: 1 });
      });

    this.filterControlType.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.updateQueryParams({ roomType: value, start: 1 });
      });
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const size = Number(params['size']) || 10;
      const start = Number(params['start']) || 1;
      const searchKey = params['searchKey'] || '';
      const roomType = params['roomType'] || '';

      this.filterControl.setValue(searchKey, { emitEvent: false });
      this.filterControlType.setValue(roomType, { emitEvent: false });
      this.loadRooms({ size, start, searchKey, roomType });
    });
  }

  loadRooms(filters: { size?: number; start?: number; searchKey?: string; roomType?: string }) {
    this.loading.set(true);

    const params = {
      size: filters.size || 10,
      start: filters.start || 1,
      searchKey: filters.searchKey || '',
      roomType: filters.roomType || '',
    };

    this.roomService.getRooms(params).subscribe({
      next: (res) => {
        this.rooms.set(res.data);
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

  deleteRoom(id: number) {
    if (confirm('Are you sure you want to delete this room?')) {
      this.roomService.deleteRoom(id).subscribe(() => {
        const currentParams = this.route.snapshot.queryParams;
        this.loadRooms(currentParams);
      });
    }
  }

  getStatusClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'available':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'occupied':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'maintenance':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return baseClasses;
    }
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
  
  onRoomsClick() {
    this.router.navigate(['/rooms']);
  }
  
  onLogoutClick() {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}