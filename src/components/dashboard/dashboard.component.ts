import { ChangeDetectionStrategy, Component, inject, signal, effect } from '@angular/core';
import { AuthService, UserProfile } from '../../services/auth.service';
import { DailyContentService } from '../../services/daily-content.service';
import { LucideAngularModule, User, Wallet, LayoutGrid, Save, LogOut, Image as ImageIcon, MapPin, Phone, Edit3, Loader2, RefreshCw, ArrowUpRight, ArrowDownLeft, Link, Calendar, Globe, Sparkles, Quote } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';

type Tab = 'daily' | 'profile' | 'wallet' | 'apps';

declare global {
  interface Window {
    tronWeb: any;
    tronLink: any;
  }
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [LucideAngularModule, FormsModule, DecimalPipe],
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  authService = inject(AuthService);
  dailyContentService = inject(DailyContentService);

  // Icons
  readonly User = User;
  readonly Wallet = Wallet;
  readonly LayoutGrid = LayoutGrid;
  readonly Save = Save;
  readonly LogOut = LogOut;
  readonly ImageIcon = ImageIcon;
  readonly MapPin = MapPin;
  readonly Phone = Phone;
  readonly Edit3 = Edit3;
  readonly Loader2 = Loader2;
  readonly RefreshCw = RefreshCw;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly Link = Link;
  readonly Calendar = Calendar;
  readonly Globe = Globe;
  readonly Sparkles = Sparkles;
  readonly Quote = Quote;

  activeTab = signal<Tab>('daily');
  isSaving = signal(false);
  saveMessage = signal<{text: string, type: 'success' | 'error'} | null>(null);

  // Form Model
  profileData = signal<Partial<UserProfile>>({});

  // Tron Wallet State
  trxBalance = signal<number | null>(null);
  isFetchingBalance = signal(false);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.profileData.set({
          name: user.name || '',
          phone: user.phone || '',
          province: user.province || '',
          city: user.city || '',
          address: user.address || '',
          bio: user.bio || '',
          avatar_url: user.avatar_url || '',
          tron_wallet: user.tron_wallet || ''
        });
        
        if (user.tron_wallet) {
          this.fetchTronBalance(user.tron_wallet);
        }
      }
    }, { allowSignalWrites: true });

    // Fetch daily content when component initializes
    this.dailyContentService.fetchTodayContent();
  }

  setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.saveMessage.set(null);
  }

  async saveProfile() {
    this.isSaving.set(true);
    this.saveMessage.set(null);
    try {
      await this.authService.updateProfile(this.profileData());
      this.saveMessage.set({ text: 'اطلاعات با موفقیت ذخیره شد.', type: 'success' });
      
      if (this.activeTab() === 'wallet' && this.profileData().tron_wallet) {
        this.fetchTronBalance(this.profileData().tron_wallet!);
      }
    } catch (error: any) {
      this.saveMessage.set({ text: error.message || 'خطا در ذخیره اطلاعات.', type: 'error' });
    } finally {
      this.isSaving.set(false);
      setTimeout(() => this.saveMessage.set(null), 3000);
    }
  }

  async fetchTronBalance(address: string) {
    if (!address) return;
    this.isFetchingBalance.set(true);
    try {
      const response = await fetch(`https://api.trongrid.io/v1/accounts/${address}`);
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        const balanceInSun = data.data[0].balance || 0;
        this.trxBalance.set(balanceInSun / 1_000_000);
      } else {
        this.trxBalance.set(0);
      }
    } catch (error) {
      console.error('Failed to fetch Tron balance:', error);
      this.trxBalance.set(null);
    } finally {
      this.isFetchingBalance.set(false);
    }
  }

  async connectTronLink() {
    if (typeof window.tronLink !== 'undefined') {
      try {
        const res = await window.tronLink.request({ method: 'tron_requestAccounts' });
        if (res.code === 200 || window.tronWeb?.defaultAddress?.base58) {
          const address = window.tronWeb.defaultAddress.base58;
          this.profileData.update(d => ({ ...d, tron_wallet: address }));
          this.fetchTronBalance(address);
        }
      } catch (e) {
        console.error('User rejected connection', e);
      }
    } else {
      alert('لطفاً افزونه TronLink را روی مرورگر خود نصب کنید.');
    }
  }

  async logout() {
    await this.authService.logout();
  }
}
