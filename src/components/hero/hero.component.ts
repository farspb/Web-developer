
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Rocket, ArrowRight } from 'lucide-angular';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroComponent {
  readonly Rocket = Rocket;
  readonly ArrowRight = ArrowRight;
}
