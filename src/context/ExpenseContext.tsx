import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoryId, Expense, PaymentMode, UdhaarEntry } from '../types/expense';
import {
  buildSampleExpenses,
  buildSampleUdhaar,
  DEMO_SEEDED_KEY,
  ENABLE_SAMPLE_DATA,
} from '../utils/demoSeed';
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

export interface ExpenseInput {
  amount: number;
  category: CategoryId;
  note: string;
  paymentMode: PaymentMode;
  date?: string;
}

interface ExpenseContextType {
  expenses: Expense[];
  udhaarList: UdhaarEntry[];
  monthlyBudget: number;
  profile: UserProfile;
  t: (typeof TRANSLATIONS)['en'];
  isLoading: boolean;
  addExpense: (data: ExpenseInput) => Promise<void>;
  updateExpense: (id: string, data: ExpenseInput) => Promise<void>;
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
  hasLoadedDemo: boolean;
  loadDemoData: () => Promise<boolean>;
  importBackup: (rawJson: string) => Promise<boolean>;
  clearAllData: () => Promise<void>;
  currentMonthTotal: number;
  todayTotal: number;
  dailySafeSpend: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

function generateId(prefix = 'kb'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

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
  const [hasLoadedDemo, setHasLoadedDemo] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedExpenses, savedBudget, savedProfile, savedUdhaar, savedDemoFlag] =
          await Promise.all([
            AsyncStorage.getItem(EXPENSES_KEY),
            AsyncStorage.getItem(BUDGET_KEY),
            AsyncStorage.getItem(PROFILE_KEY),
            AsyncStorage.getItem(UDHAAR_KEY),
            AsyncStorage.getItem(DEMO_SEEDED_KEY),
          ]);

        let initialExpenses: Expense[] = savedExpenses
          ? sortByDateDesc(JSON.parse(savedExpenses) as Expense[])
          : [];
        let initialUdhaar: UdhaarEntry[] = savedUdhaar
          ? sortByDateDesc(JSON.parse(savedUdhaar) as UdhaarEntry[])
          : [];
        let demoAlreadySeeded = savedDemoFlag === 'true';

        // Seed sample data automatically once on first launch when enabled
        if (
          ENABLE_SAMPLE_DATA &&
          !demoAlreadySeeded &&
          initialExpenses.length === 0 &&
          initialUdhaar.length === 0
        ) {
          initialExpenses = sortByDateDesc(buildSampleExpenses());
          initialUdhaar = sortByDateDesc(buildSampleUdhaar());
          demoAlreadySeeded = true;
          await Promise.all([
            AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(initialExpenses)),
            AsyncStorage.setItem(UDHAAR_KEY, JSON.stringify(initialUdhaar)),
            AsyncStorage.setItem(DEMO_SEEDED_KEY, 'true'),
          ]);
        }

        setExpenses(initialExpenses);
        setUdhaarList(initialUdhaar);
        setHasLoadedDemo(demoAlreadySeeded);

        if (savedBudget) setMonthlyBudget(Number(savedBudget));
        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          setProfile({ language: 'en', ...parsed });
        }
      } catch (e) {
        console.error('Failed to load KharchaBook data:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const persistExpenses = useCallback(async (updated: Expense[]) => {
    const sorted = sortByDateDesc(updated);
    setExpenses(sorted);
    await AsyncStorage.setItem(EXPENSES_KEY, JSON.stringify(sorted));
  }, []);

  const persistUdhaar = useCallback(async (updated: UdhaarEntry[]) => {
    const sorted = sortByDateDesc(updated);
    setUdhaarList(sorted);
    await AsyncStorage.setItem(UDHAAR_KEY, JSON.stringify(sorted));
  }, []);

  const addExpense = useCallback(
    async (data: ExpenseInput) => {
      const newExpense: Expense = {
        id: generateId('exp'),
        amount: data.amount,
        category: data.category,
        note: data.note.trim(),
        paymentMode: data.paymentMode,
        date: data.date || new Date().toISOString(),
      };
      await persistExpenses([newExpense, ...expenses]);
    },
    [expenses, persistExpenses]
  );

  const updateExpense = useCallback(
    async (id: string, data: ExpenseInput) => {
      const updated = expenses.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: data.amount,
              category: data.category,
              note: data.note.trim(),
              paymentMode: data.paymentMode,
              date: data.date || item.date,
            }
          : item
      );
      await persistExpenses(updated);
    },
    [expenses, persistExpenses]
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await persistExpenses(expenses.filter((item) => item.id !== id));
    },
    [expenses, persistExpenses]
  );

  const addUdhaar = useCallback(
    async (data: {
      person: string;
      amount: number;
      type: 'lent' | 'borrowed';
      note: string;
    }) => {
      const entry: UdhaarEntry = {
        id: generateId('udh'),
        person: data.person.trim(),
        amount: data.amount,
        type: data.type,
        note: data.note.trim(),
        date: new Date().toISOString(),
        settled: false,
      };
      await persistUdhaar([entry, ...udhaarList]);
    },
    [udhaarList, persistUdhaar]
  );

  const toggleSettleUdhaar = useCallback(
    async (id: string) => {
      const updated = udhaarList.map((item) =>
        item.id === id ? { ...item, settled: !item.settled } : item
      );
      await persistUdhaar(updated);
    },
    [udhaarList, persistUdhaar]
  );

  const deleteUdhaar = useCallback(
    async (id: string) => {
      await persistUdhaar(udhaarList.filter((item) => item.id !== id));
    },
    [udhaarList, persistUdhaar]
  );

  const updateBudget = useCallback(async (amount: number) => {
    setMonthlyBudget(amount);
    await AsyncStorage.setItem(BUDGET_KEY, String(amount));
  }, []);

  const saveProfile = useCallback(
    async (name: string, avatar: string, budget?: number, language?: AppLanguage) => {
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
    },
    [profile.language, updateBudget]
  );

  const loadDemoData = useCallback(async (): Promise<boolean> => {
    if (!ENABLE_SAMPLE_DATA || hasLoadedDemo) {
      return false;
    }

    const alreadySeeded = await AsyncStorage.getItem(DEMO_SEEDED_KEY);
    if (alreadySeeded === 'true') {
      setHasLoadedDemo(true);
      return false;
    }

    const existingExpIds = new Set(expenses.map((e) => e.id));
    const existingUdhIds = new Set(udhaarList.map((u) => u.id));
    const sampleExpenses = buildSampleExpenses().filter((e) => !existingExpIds.has(e.id));
    const sampleUdhaar = buildSampleUdhaar().filter((u) => !existingUdhIds.has(u.id));

    await Promise.all([
      persistExpenses([...sampleExpenses, ...expenses]),
      persistUdhaar([...sampleUdhaar, ...udhaarList]),
      AsyncStorage.setItem(DEMO_SEEDED_KEY, 'true'),
    ]);
    setHasLoadedDemo(true);
    return true;
  }, [hasLoadedDemo, expenses, udhaarList, persistExpenses, persistUdhaar]);

  const importBackup = useCallback(
    async (rawJson: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(rawJson);
        if (!parsed || typeof parsed !== 'object') return false;
        const nextExpenses = Array.isArray(parsed.expenses) ? (parsed.expenses as Expense[]) : null;
        const nextUdhaar = Array.isArray(parsed.udhaarList) ? (parsed.udhaarList as UdhaarEntry[]) : null;
        if (!nextExpenses && !nextUdhaar) return false;

        if (nextExpenses) await persistExpenses(nextExpenses);
        if (nextUdhaar) await persistUdhaar(nextUdhaar);
        if (typeof parsed.monthlyBudget === 'number' && parsed.monthlyBudget > 0) {
          await updateBudget(parsed.monthlyBudget);
        }
        return true;
      } catch {
        return false;
      }
    },
    [persistExpenses, persistUdhaar, updateBudget]
  );

  const clearAllData = useCallback(async () => {
    setExpenses([]);
    setUdhaarList([]);
    setHasLoadedDemo(false);
    await Promise.all([
      AsyncStorage.removeItem(EXPENSES_KEY),
      AsyncStorage.removeItem(UDHAAR_KEY),
      AsyncStorage.removeItem(DEMO_SEEDED_KEY), // reset so demo can re-seed on next empty state
    ]);
  }, []);

  const { currentMonthTotal, todayTotal, dailySafeSpend } = useMemo(() => {
    const now = new Date();
    let monthSum = 0;
    let daySum = 0;

    for (const e of expenses) {
      const d = new Date(e.date);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        monthSum += e.amount;
        if (d.getDate() === now.getDate()) {
          daySum += e.amount;
        }
      }
    }

    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remainingDays = Math.max(daysInMonth - now.getDate() + 1, 1);
    const remainingBudget = Math.max(monthlyBudget - monthSum, 0);
    const safeDaily = Math.round(remainingBudget / remainingDays);

    return {
      currentMonthTotal: monthSum,
      todayTotal: daySum,
      dailySafeSpend: safeDaily,
    };
  }, [expenses, monthlyBudget]);

  const t = TRANSLATIONS[profile.language || 'en'] as (typeof TRANSLATIONS)['en'];

  const value = useMemo(
    () => ({
      expenses,
      udhaarList,
      monthlyBudget,
      profile,
      t,
      isLoading,
      addExpense,
      updateExpense,
      deleteExpense,
      addUdhaar,
      toggleSettleUdhaar,
      deleteUdhaar,
      updateBudget,
      saveProfile,
      hasLoadedDemo,
      loadDemoData,
      importBackup,
      clearAllData,
      currentMonthTotal,
      todayTotal,
      dailySafeSpend,
    }),
    [
      expenses,
      udhaarList,
      monthlyBudget,
      profile,
      t,
      isLoading,
      addExpense,
      updateExpense,
      deleteExpense,
      addUdhaar,
      toggleSettleUdhaar,
      deleteUdhaar,
      updateBudget,
      saveProfile,
      hasLoadedDemo,
      loadDemoData,
      importBackup,
      clearAllData,
      currentMonthTotal,
      todayTotal,
      dailySafeSpend,
    ]
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within ExpenseProvider');
  return ctx;
}
