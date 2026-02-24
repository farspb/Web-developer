import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, Type } from '@google/genai';

export interface DailyContent {
  jalaliDate: string;
  gregorianDate: string;
  iranNews: string[];
  worldNews: string[];
  astrology: string;
  quote: string;
}

@Injectable({
  providedIn: 'root'
})
export class DailyContentService {
  private ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  content = signal<DailyContent | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  async fetchTodayContent() {
    if (this.content()) return; // Already fetched
    
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const today = new Date().toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
      const todayGregorian = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      const prompt = `
      امروز ${today} (معادل ${todayGregorian}) است.
      لطفا اطلاعات زیر را دقیقا برای همین امروز تهیه کن:
      ۱. مهمترین اخبار امروز ایران (۳ مورد خلاصه و مفید)
      ۲. مهمترین اخبار امروز جهان (۳ مورد خلاصه و مفید)
      ۳. یک طالع‌بینی کلی و انرژی روز برای امروز (آسترولوژی)
      ۴. یک سخن از بزرگان که الهام‌بخش باشد (متفاوت از روزهای قبل)
      
      از منابع خبری موثق استفاده کن و اخبار قدیمی نده.
      `;

      const response = await this.ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              jalaliDate: { type: Type.STRING, description: 'تاریخ امروز به شمسی (مثلا ۴ اسفند ۱۴۰۴)' },
              gregorianDate: { type: Type.STRING, description: 'تاریخ امروز به میلادی' },
              iranNews: { type: Type.ARRAY, items: { type: Type.STRING }, description: '۳ خبر مهم امروز ایران' },
              worldNews: { type: Type.ARRAY, items: { type: Type.STRING }, description: '۳ خبر مهم امروز جهان' },
              astrology: { type: Type.STRING, description: 'طالع‌بینی و انرژی امروز' },
              quote: { type: Type.STRING, description: 'سخن بزرگان' }
            },
            required: ['jalaliDate', 'gregorianDate', 'iranNews', 'worldNews', 'astrology', 'quote']
          }
        }
      });

      const text = response.text;
      if (text) {
        const data = JSON.parse(text) as DailyContent;
        this.content.set(data);
      } else {
        throw new Error('No content generated');
      }
    } catch (err: any) {
      console.error('Failed to fetch daily content:', err);
      this.error.set('دریافت اطلاعات امروز با خطا مواجه شد. لطفا دوباره تلاش کنید.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
