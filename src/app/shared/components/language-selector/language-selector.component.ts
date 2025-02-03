import { Component, inject } from '@angular/core';
import { TranslationService } from '../../../core/services/translate.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, MatSelectModule, TranslatePipe],
  templateUrl: './language-selector.component.html',
  styleUrl: './language-selector.component.scss',
})
export class LanguageSelectorComponent {
  translationService = inject(TranslationService);

  onLanguageChange(langCode: string): void {
    this.translationService.setLanguage(langCode);
  }
}
