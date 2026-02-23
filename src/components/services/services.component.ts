
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Monitor, Code2, Search } from 'lucide-angular';

interface Service {
  icon: any;
  title: string;
  description: string;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './services.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesComponent {
  readonly Monitor = Monitor;
  readonly Code2 = Code2;
  readonly Search = Search;

  services: Service[] = [
    {
      icon: Monitor,
      title: 'طراحی وب‌سایت مدرن',
      description: 'طراحی رابط کاربری (UI) و تجربه کاربری (UX) جذاب و واکنش‌گرا برای تمامی دستگاه‌ها.',
    },
    {
      icon: Code2,
      title: 'برنامه‌نویسی اختصاصی',
      description: 'توسعه نرم‌افزارهای تحت وب و راهکارهای سفارشی با استفاده از جدیدترین تکنولوژی‌ها.',
    },
    {
      icon: Search,
      title: 'بهینه‌سازی و سئو',
      description: 'بهبود رتبه سایت شما در موتورهای جستجو و افزایش بازدیدکنندگان ارگانیک.',
    },
  ];
}
