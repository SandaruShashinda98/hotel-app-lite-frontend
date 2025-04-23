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
import { UserService } from '../users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Location, CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';
import { LanguageSelectorComponent } from '../../../shared/components/language-selector/language-selector.component';

@Component({
  selector: 'app-view-users',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    RouterModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatProgressSpinnerModule,
    LanguageSelectorComponent,
  ],
  templateUrl: './view-users.component.html',
  styleUrl: './view-users.component.scss',
})
export class ViewUsersComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  users = signal<any[]>([]);
  loading = signal<boolean>(false);
  filterControl = new FormControl('');
  totalItems = signal<number>(0);
  displayedColumns = [
    'first_name',
    'last_name',
    'username',
    'role',
    'email',
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
      this.loadUsers({ size, start, searchKey });
    });
  }

  loadUsers(filters: { size?: number; start?: number; searchKey?: string }) {
    this.loading.set(true);

    const params = {
      size: filters.size ?? 10,
      start: filters.start ?? 1,
      searchKey: filters.searchKey ?? '',
    };

    this.userService.getUsers(params).subscribe({
      next: (res) => {
        this.users.set(res.data);
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

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this User?')) {
      this.userService.deleteUser(id).subscribe(() => {
        const currentParams = this.route.snapshot.queryParams;
        this.loadUsers(currentParams);
      });
    }
  }

  getRoleClass(status: string): string {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'ADMIN':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'WORKER':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return baseClasses;
    }
  }

  ////----------

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

  onRoomsClick() {
    this.router.navigate(['/rooms']);
  }
}
