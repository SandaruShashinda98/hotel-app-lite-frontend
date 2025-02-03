import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LanguageSelectorComponent } from './shared/components/language-selector/language-selector.component';
import { TranslatePipe } from './core/pipes/translate.pipe';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Location } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AuthService } from './features/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    MatToolbarModule,
    LanguageSelectorComponent,
    TranslatePipe,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly activatedRouter = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);

  constructor(private readonly location: Location) {}

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
