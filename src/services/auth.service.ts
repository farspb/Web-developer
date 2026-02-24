
import { Injectable, signal, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  bio?: string;
  avatar_url?: string;
  tron_wallet?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private supabaseService = inject(SupabaseService);
  currentUser = signal<UserProfile | null>(null);

  constructor() {
    this.initSession();
  }

  private async loadProfile(userId: string, email: string) {
    const { data } = await this.supabaseService.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (data) {
      this.currentUser.set({ ...data, email });
    } else {
      this.currentUser.set({ id: userId, name: 'کاربر', email });
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    const user = this.currentUser();
    if (!user?.id) throw new Error('کاربر وارد نشده است');
    
    const { error } = await this.supabaseService.supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
      
    if (error) throw new Error(error.message);
    
    this.currentUser.set({ ...user, ...updates });
  }

  private async initSession() {
    try {
      const { data: { session }, error } = await this.supabaseService.supabase.auth.getSession();
      if (error) {
        console.error('Supabase session error:', error.message);
      }
      if (session?.user) {
        await this.loadProfile(session.user.id, session.user.email || '');
      }

      this.supabaseService.supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await this.loadProfile(session.user.id, session.user.email || '');
        } else {
          this.currentUser.set(null);
        }
      });
    } catch (err: any) {
      console.error('Failed to initialize Supabase session. Check your API keys.', err);
    }
  }

  async loginWithGoogle(): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) throw error;
  }

  async registerWithEmail(name: string, email: string, password?: string): Promise<void> {
    if (!password) {
      throw new Error('رمز عبور برای ثبت‌نام الزامی است.');
    }
    
    try {
      const { data, error } = await this.supabaseService.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) {
        if (error.message.includes('User already registered')) {
          throw new Error('این ایمیل قبلاً ثبت شده است.');
        }
        if (error.message.includes('JWT')) {
          throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
        }
        throw new Error(error.message);
      }

      if (data.user && !data.session) {
        throw new Error('ثبت‌نام با موفقیت انجام شد. لطفا برای ورود، ایمیل خود را تایید کنید (یا تایید ایمیل را در تنظیمات Supabase غیرفعال کنید).');
      }
    } catch (err: any) {
      if (err.message && err.message.includes('JWT')) {
        throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
      }
      throw err;
    }
  }

  async loginWithEmail(email: string, password?: string): Promise<void> {
    if (!password) {
      throw new Error('رمز عبور برای ورود الزامی است.');
    }
    
    try {
      const { error } = await this.supabaseService.supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('ایمیل یا رمز عبور اشتباه است.');
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('لطفا ابتدا ایمیل خود را تایید کنید.');
        }
        if (error.message.includes('JWT')) {
          throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
        }
        throw new Error(error.message);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('JWT')) {
        throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
      }
      throw err;
    }
  }

  async resetPasswordForEmail(email: string): Promise<void> {
    if (!email) {
      throw new Error('ایمیل الزامی است.');
    }
    try {
      const { error } = await this.supabaseService.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) {
        if (error.message.includes('JWT')) {
          throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
        }
        throw new Error(error.message);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('JWT')) {
        throw new Error('کلید API سوپابیس (Anon Key) نامعتبر است. لطفا کلید صحیح را جایگزین کنید.');
      }
      throw err;
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabaseService.supabase.auth.signOut();
    if (error) throw error;
    this.currentUser.set(null);
  }
}
