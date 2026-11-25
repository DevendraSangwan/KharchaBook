import { AppLanguage } from '../utils/i18n';

export type CategoryId =
  | 'food'
  | 'travel'
  | 'shopping'
  | 'bills'
  | 'study'
  | 'entertainment'
  | 'health'
  | 'other';

export type PaymentMode = 'UPI' | 'Cash' | 'Card';

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  labelHi: string;
  icon: string;
  color: string;
  bgColor: string;
  suggestions: {
    en: string[];
    hi: string[];
  };
}

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  note: string;
  paymentMode: PaymentMode;
  date: string;
}

export interface UdhaarEntry {
  id: string;
  person: string;
  amount: number;
  type: 'lent' | 'borrowed'; // lent = lene hain, borrowed = dene hain
  note: string;
  date: string;
  settled: boolean;
}

export const CATEGORIES: Record<CategoryId, CategoryMeta> = {
  food: {
    id: 'food',
    label: 'Food & Chai',
    labelHi: 'खाना और चाय',
    icon: 'fast-food',
    color: '#F97316',
    bgColor: '#FFEDD5',
    suggestions: {
      en: ['Chai & Snacks', 'Lunch', 'Dinner', 'Groceries'],
      hi: ['चाय-नाश्ता', 'दोपहर का खाना', 'रात का खाना', 'राशन'],
    },
  },
  travel: {
    id: 'travel',
    label: 'Travel & Auto',
    labelHi: 'सफ़र और ऑटो',
    icon: 'car',
    color: '#3B82F6',
    bgColor: '#DBEAFE',
    suggestions: {
      en: ['Auto / Rickshaw', 'Metro', 'Fuel / Petrol', 'Cab'],
      hi: ['ऑटो / रिक्शा', 'मेट्रो', 'पेट्रोल', 'कैब'],
    },
  },
  shopping: {
    id: 'shopping',
    label: 'Shopping',
    labelHi: 'शॉपिंग',
    icon: 'bag-handle',
    color: '#EC4899',
    bgColor: '#FCE7F3',
    suggestions: {
      en: ['Clothes', 'Online Order', 'Essentials', 'Gift'],
      hi: ['कपड़े', 'ऑनलाइन ऑर्डर', 'ज़रूरी सामान', 'गिफ्ट'],
    },
  },
  bills: {
    id: 'bills',
    label: 'Bills & Recharge',
    labelHi: 'बिल और रिचार्ज',
    icon: 'receipt',
    color: '#8B5CF6',
    bgColor: '#EDE9FE',
    suggestions: {
      en: ['Mobile Recharge', 'Wi-Fi / Electricity', 'Rent', 'Subscription'],
      hi: ['मोबाइल रिचार्ज', 'बिजली / वाई-फ़ाई', 'किराया', 'सब्सक्रिप्शन'],
    },
  },
  study: {
    id: 'study',
    label: 'Study & Books',
    labelHi: 'पढ़ाई और किताबें',
    icon: 'book',
    color: '#10B981',
    bgColor: '#D1FAE5',
    suggestions: {
      en: ['Books / Notes', 'Printout', 'Course Fee', 'Stationery'],
      hi: ['किताबें / नोट्स', 'प्रिंटआउट', 'कोर्स फीस', 'स्टेशनरी'],
    },
  },
  entertainment: {
    id: 'entertainment',
    label: 'Fun & Movies',
    labelHi: 'मूवी और मस्ती',
    icon: 'game-controller',
    color: '#EAB308',
    bgColor: '#FEF9C3',
    suggestions: {
      en: ['Movie Ticket', 'Outing', 'Gaming', 'OTT'],
      hi: ['मूवी टिकट', 'घूमना-फिरना', 'गेमिंग', 'ओटीटी'],
    },
  },
  health: {
    id: 'health',
    label: 'Health',
    labelHi: 'सेहत और दवा',
    icon: 'medkit',
    color: '#EF4444',
    bgColor: '#FEE2E2',
    suggestions: {
      en: ['Medicines', 'Doctor Visit', 'Gym / Fitness', 'Lab Test'],
      hi: ['दवाई', 'डॉक्टर फीस', 'जिम / फिटनेस', 'जांच'],
    },
  },
  other: {
    id: 'other',
    label: 'Other',
    labelHi: 'अन्य',
    icon: 'ellipsis-horizontal-circle',
    color: '#64748B',
    bgColor: '#F1F5F9',
    suggestions: {
      en: ['Misc', 'Donation', 'Repair', 'Family'],
      hi: ['फुटकर', 'दान', 'मरम्मत', 'परिवार'],
    },
  },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);

export function getCategoryLabel(categoryId: CategoryId, lang: AppLanguage = 'en'): string {
  const cat = CATEGORIES[categoryId] || CATEGORIES.other;
  return lang === 'hi' ? cat.labelHi : cat.label;
}
