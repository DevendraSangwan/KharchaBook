import { Expense, UdhaarEntry } from '../types/expense';

/**
 * Production toggle for one-time sample/demo data.
 * Set `ENABLE_SAMPLE_DATA = false` (or delete this file) before shipping to production.
 */
export const ENABLE_SAMPLE_DATA = true;

export const DEMO_SEEDED_KEY = '@kharchabook_demo_seeded_v1';

function daysAgo(n: number, hour = 12): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 30, 0, 0);
  return d.toISOString();
}

export function buildSampleExpenses(): Expense[] {
  return [
    { id: 'demo_exp_1', amount: 45, category: 'food', note: 'Chai & Samosa', paymentMode: 'UPI', date: daysAgo(0, 10) },
    { id: 'demo_exp_2', amount: 180, category: 'travel', note: 'Metro Card Topup', paymentMode: 'UPI', date: daysAgo(0, 9) },
    { id: 'demo_exp_3', amount: 340, category: 'food', note: 'Lunch Thali', paymentMode: 'UPI', date: daysAgo(1, 14) },
    { id: 'demo_exp_4', amount: 120, category: 'travel', note: 'Auto to Station', paymentMode: 'Cash', date: daysAgo(1, 19) },
    { id: 'demo_exp_5', amount: 899, category: 'shopping', note: 'T-shirt Sale', paymentMode: 'Card', date: daysAgo(2, 17) },
    { id: 'demo_exp_6', amount: 299, category: 'bills', note: 'Mobile Recharge', paymentMode: 'UPI', date: daysAgo(3, 11) },
    { id: 'demo_exp_7', amount: 450, category: 'study', note: 'Reference Book', paymentMode: 'Card', date: daysAgo(4, 16) },
    { id: 'demo_exp_8', amount: 320, category: 'entertainment', note: 'Movie Night', paymentMode: 'UPI', date: daysAgo(5, 20) },
    { id: 'demo_exp_9', amount: 210, category: 'health', note: 'Vitamins', paymentMode: 'Cash', date: daysAgo(6, 12) },
  ];
}

export function buildSampleUdhaar(): UdhaarEntry[] {
  return [
    { id: 'demo_udh_1', person: 'Rohan', amount: 450, type: 'lent', note: 'Dinner split', date: daysAgo(1, 21), settled: false },
    { id: 'demo_udh_2', person: 'Priya', amount: 220, type: 'borrowed', note: 'Cab fare', date: daysAgo(2, 18), settled: false },
    { id: 'demo_udh_3', person: 'Amit', amount: 150, type: 'lent', note: 'Coffee & snacks', date: daysAgo(4, 16), settled: true },
  ];
}
