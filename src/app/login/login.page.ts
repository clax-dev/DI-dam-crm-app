import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../services/supabase.service';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonText, IonSpinner,
} from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  imports: [
    ReactiveFormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonItem, IonInput, IonInputPasswordToggle, IonButton, IonText, IonSpinner,
  ],
})
export class LoginPage {
  private supabaseService = inject(SupabaseService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async login() {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.errorMessage.set('');
    try {
      const { email, password } = this.loginForm.getRawValue();
      await this.supabaseService.login(email, password);
      this.router.navigateByUrl('/home', { replaceUrl: true });
    } catch (e: any) {
      this.errorMessage.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }
}
