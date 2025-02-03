import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from '../services/translate.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly translationService = inject(TranslationService);

  transform(key: string, params?: { [key: string]: string }): string {
    return this.translationService.translate(key, params);
  }
}
