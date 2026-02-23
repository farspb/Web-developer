
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, Mail, Lock, User, Loader2, CheckCircle } from 'lucide-angular';

type AuthMode = 'login' | 'register' | 'forgot-password';
type Status = 'idle' | 'loading' | 'success' | 'error' | 'forgot-password-success';

@Component({
  selector: 'app-auth-section',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './auth-section.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthSectionComponent {
  authService = inject(AuthService);

  readonly Mail = Mail;
  readonly Lock = Lock;
  readonly User = User;
  readonly Loader2 = Loader2;
  readonly CheckCircle = CheckCircle;

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
    } else if (this.mode() === 'forgot-password') {
      return this.email().includes('@');
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
        await this.authService.registerWithEmail(this.name(), this.email(), this.password());
        this.status.set('success');
      } else if (this.mode() === 'login') {
        await this.authService.loginWithEmail(this.email(), this.password());
        this.status.set('success');
      } else if (this.mode() === 'forgot-password') {
        await this.authService.resetPasswordForEmail(this.email());
        this.status.set('forgot-password-success');
      }
    } catch (e: any) {
      this.status.set('error');
      this.errorMessage.set(e.message || 'عملیات با خطا مواجه شد. لطفا دوباره تلاش کنید.');
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
