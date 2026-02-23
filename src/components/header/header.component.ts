
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, Code, LogOut, LogIn } from 'lucide-angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  authService = inject(AuthService);
  currentUser = this.authService.currentUser;

  readonly Code = Code;
  readonly LogOut = LogOut;
  readonly LogIn = LogIn;

  logout() {
    this.authService.logout();
  }
}
