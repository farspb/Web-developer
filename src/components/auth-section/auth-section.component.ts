
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';

type AuthMode = 'login' | 'register';
type Status = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-auth-section',
  standalone: true,
  templateUrl: './auth-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthSectionComponent {
  authService = inject(AuthService);

  mode = signal<AuthMode>('register');
  status = signal<Status>('idle');
  errorMessage = signal<string | null>(null);

  // Form signals
  name = signal('');
  email = signal('');
  password = signal('');

  setMode(newMode: AuthMode) {
    this.mode.set(newMode);
    this.status.set('idle');
    this.errorMessage.set(null);
  }

  isFormValid(): boolean {
    if (this.mode() === 'register') {
      return this.name().trim() !== '' && this.email().includes('@') && this.password().length >= 6;
    }
    return this.email().includes('@') && this.password().length >= 6;
  }
  
  async handleGoogleSignin() {
    this.status.set('loading');
    this.errorMessage.set(null);
    try {
      await this.authService.loginWithGoogle();
      this.status.set('success');
    } catch (e) {
      this.status.set('error');
      this.errorMessage.set('ورود با گوگل با مشکل مواجه شد.');
    }
  }
  
  async handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.isFormValid()) {
      this.errorMessage.set('لطفا تمام فیلدها را به درستی پر کنید.');
      return;
    }

    this.status.set('loading');
    this.errorMessage.set(null);

    try {
      if (this.mode() === 'register') {
        await this.authService.registerWithEmail(this.name(), this.email());
      } else {
        await this.authService.loginWithEmail(this.email());
      }
      this.status.set('success');
    } catch (e) {
      this.status.set('error');
      this.errorMessage.set('عملیات با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    }
  }

  updateName(event: Event) {
    this.name.set((event.target as HTMLInputElement).value);
  }
  updateEmail(event: Event) {
    this.email.set((event.target as HTMLInputElement).value);
  }
  updatePassword(event: Event) {
    this.password.set((event.target as HTMLInputElement).value);
  }
}
