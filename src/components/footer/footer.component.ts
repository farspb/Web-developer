
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Github, Twitter, Linkedin, Heart } from 'lucide-angular';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  readonly Github = Github;
  readonly Twitter = Twitter;
  readonly Linkedin = Linkedin;
  readonly Heart = Heart;
}
