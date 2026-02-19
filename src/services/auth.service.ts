
import { Injectable, signal } from '@angular/core';

export interface User {
  name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<User | null>(null);

  // Simulate a network delay
  private networkDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async loginWithGoogle(): Promise<User> {
    await this.networkDelay(800);
    const user: User = { name: 'کاربر گوگل', email: 'user@gmail.com' };
    this.currentUser.set(user);
    return user;
  }

  async registerWithEmail(name: string, email: string): Promise<User> {
    await this.networkDelay(1200);
    // In a real app, you would check for existing users
    const newUser: User = { name, email };
    this.currentUser.set(newUser);
    return newUser;
  }

  async loginWithEmail(email: string): Promise<User> {
    await this.networkDelay(1000);
    // In a real app, you would verify credentials
    const user: User = { name: 'کاربر ثبت شده', email };
    this.currentUser.set(user);
    return user;
  }

  logout(): void {
    this.currentUser.set(null);
  }
}
