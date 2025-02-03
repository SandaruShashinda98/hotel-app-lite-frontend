import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { Language } from '../models/translate.model';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly http = inject(HttpClient);
  private readonly defaultLang = 'en';

  currentLang = signal<string>(
    localStorage.getItem('selectedLang') || this.defaultLang
  );

  translations = signal<{ [key: string]: any }>({});

  supportedLanguages: Language[] = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'si', name: 'සිංහල', flag: '🇱🇰' },
  ];

  constructor() {
    // Initialize translations in constructor
    this.initializeTranslations();
  }

  private async initializeTranslations() {
    const currentLang = this.currentLang();
    const translations = await firstValueFrom(
      this.loadTranslations(currentLang)
    );
    this.translations.set(translations);
  }

  loadTranslations(lang: string): Observable<any> {
    return this.http.get(`/assets/i18n/${lang}.json`);
  }

  async setLanguage(lang: string): Promise<void> {
    try {
      const translations = await firstValueFrom(this.loadTranslations(lang));
      this.translations.set(translations);
      this.currentLang.set(lang);
      localStorage.setItem('selectedLang', lang);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}`, error);
      // Fallback to default language if loading fails
      if (lang !== this.defaultLang) {
        await this.setLanguage(this.defaultLang);
      }
    }
  }

  translate(key: string, params?: { [key: string]: string }): string {
    let translation = this.getNestedTranslation(this.translations(), key);

    if (!translation) return key;

    if (params) {
      Object.keys(params).forEach((param) => {
        translation = translation.replace(`{{${param}}}`, params[param]);
      });
    }

    return translation;
  }

  private getNestedTranslation(obj: any, path: string): string {
    return path.split('.').reduce((p, c) => p?.[c], obj) || path;
  }
}
