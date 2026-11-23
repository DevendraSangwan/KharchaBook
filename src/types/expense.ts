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
  icon: string;
  color: string;
  bgColor: string;
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
  food: { id: 'food', label: 'Food & Chai', icon: 'fast-food', color: '#F97316', bgColor: '#FFEDD5' },
  travel: { id: 'travel', label: 'Travel & Auto', icon: 'car', color: '#3B82F6', bgColor: '#DBEAFE' },
  shopping: { id: 'shopping', label: 'Shopping', icon: 'bag-handle', color: '#EC4899', bgColor: '#FCE7F3' },
  bills: { id: 'bills', label: 'Bills & Recharge', icon: 'receipt', color: '#8B5CF6', bgColor: '#EDE9FE' },
  study: { id: 'study', label: 'Study & Books', icon: 'book', color: '#10B981', bgColor: '#D1FAE5' },
  entertainment: { id: 'entertainment', label: 'Fun & Movies', icon: 'game-controller', color: '#EAB308', bgColor: '#FEF9C3' },
  health: { id: 'health', label: 'Health', icon: 'medkit', color: '#EF4444', bgColor: '#FEE2E2' },
  other: { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-circle', color: '#64748B', bgColor: '#F1F5F9' },
};

export const CATEGORY_LIST = Object.values(CATEGORIES);
