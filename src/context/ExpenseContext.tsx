import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryId, Expense, PaymentMode, UdhaarEntry } from '../types/expense';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';

const EXPENSES_KEY = '@kharchabook_expenses_v1';
const BUDGET_KEY = '@kharchabook_budget_v1';
const PROFILE_KEY = '@kharchabook_profile_v1';
const UDHAAR_KEY = '@kharchabook_udhaar_v1';

export interface UserProfile {
  name: string;
  avatar: string;
  language: AppLanguage;
  hasOnboarded: boolean;
}

interface ExpenseContextType {
  expenses: Expense[];
  udhaarList: UdhaarEntry[];
  monthlyBudget: number;
  profile: UserProfile;
  t: (typeof TRANSLATIONS)['en'];
  isLoading: boolean;
  addExpense: (data: {
    amount: number;
    category: CategoryId;
    note: string;
    paymentMode: PaymentMode;
    date?: string;
  }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addUdhaar: (data: {
    person: string;
    amount: number;
    type: 'lent' | 'borrowed';
    note: string;
  }) => Promise<void>;
  toggleSettleUdhaar: (id: string) => Promise<void>;
  deleteUdhaar: (id: string) => Promise<void>;
  updateBudget: (amount: number) => Promise<void>;
  saveProfile: (
    name: string,
    avatar: string,
    budget?: number,
    language?: AppLanguage
  ) => Promise<void>;
  clearAllData: () => Promise<void>;
  currentMonthTotal: number;
  todayTotal: number;
  dailySafeSpend: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [udhaarList, setUdhaarList] = useState<UdhaarEntry[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(10000);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    avatar: '👩🏻‍💻',
    language: 'en',
    hasOnboarded: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedExpenses, savedBudget, savedProfile, savedUdhaar] = await Promise.all([
        AsyncStorage.getItem(EXPENSES_KEY),
        AsyncStorage.getItem(BUDGET_KEY),
        AsyncStorage.getItem(PROFILE_KEY),
        AsyncStorage.getItem(UDHAAR_KEY),
      ]);
      if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
      if (savedBudget) setMonthlyBudget(Number(savedBudget));
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfile({ language: 'en', ...parsed });
      }
      if (savedUdhaar) setUdhaarList(JSON.parse(savedUdhaar));
    } catch (e) {
      console.error('Failed to load KharchaBook data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const addExpense = async (data: {
    amount: number;
    category: CategoryId;
    note: string;
    paymentMode: PaymentMode;
    date?: string;
  }) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      amount: data.amount,
      category: data.category,
      note: data.note.trim(),
      paymentMode: data.paymentMode,
      date: data.date || new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  };

  const deleteExpense = async (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(updated));
  };

  const addUdhaar = async (data: {
    person: string;
    amount: number;
    type: 'lent' | 'borrowed';
    note: string;
  }) => {
    const entry: UdhaarEntry = {
      id: Date.now().toString(),
      person: data.person.trim(),
      amount: data.amount,
      type: data.type,
      note: data.note.trim(),
      date: new Date().toISOString(),
      settled: false,
    };
    const updated = [entry, ...udhaarList];
    setUdhaarList(updated);
    await AsyncStorage.setItem(UDHAAR_KEY, JSON.stringify(updated));
  };

  const toggleSettleUdhaar = async (id: string) => {
    const updated = udhaarList.map((item) =>
      item.id === id ? { ...item, settled: !item.settled } : item
    );
    setUdhaarList(updated);
    await AsyncStorage.setItem(UDHAAR_KEY, JSON.stringify(updated));
  };

  const deleteUdhaar = async (id: string) => {
    const updated = udhaarList.filter((item) => item.id !== id);
    setUdhaarList(updated);
    await AsyncStorage.setItem(UDHAAR_KEY, JSON.stringify(updated));
  };

  const updateBudget = async (amount: number) => {
    setMonthlyBudget(amount);
    await AsyncStorage.setItem(BUDGET_KEY, String(amount));
  };

  const saveProfile = async (
    name: string,
    avatar: string,
    budget?: number,
    language?: AppLanguage
  ) => {
    const updatedProfile: UserProfile = {
      name: name.trim() || 'User',
      avatar,
      language: language || profile.language || 'en',
      hasOnboarded: true,
    };
    setProfile(updatedProfile);
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    if (budget && budget > 0) {
      await updateBudget(budget);
    }
  };

  const clearAllData = async () => {
    setExpenses([]);
    setUdhaarList([]);
    await Promise.all([
      AsyncStorage.removeItem(EXPENSES_KEY),
      AsyncStorage.removeItem(UDHAAR_KEY),
    ]);
  };

  const now = new Date();
  const currentMonthTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const todayTotal = expenses
    .filter((e) => {
      const d = new Date(e.date);
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((sum, item) => sum + item.amount, 0);

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const remainingDays = Math.max(daysInMonth - now.getDate() + 1, 1);
  const remainingBudget = Math.max(monthlyBudget - currentMonthTotal, 0);
  const dailySafeSpend = Math.round(remainingBudget / remainingDays);

  const t = TRANSLATIONS[profile.language || 'en'] as (typeof TRANSLATIONS)['en'];

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        udhaarList,
        monthlyBudget,
        profile,
        t,
        isLoading,
        addExpense,
        deleteExpense,
        addUdhaar,
        toggleSettleUdhaar,
        deleteUdhaar,
        updateBudget,
        saveProfile,
        clearAllData,
        currentMonthTotal,
        todayTotal,
        dailySafeSpend,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
