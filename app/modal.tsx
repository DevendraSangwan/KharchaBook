import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS } from '../src/constants/theme';
import { useExpenses } from '../src/context/ExpenseContext';
import {
  CATEGORIES,
  CATEGORY_LIST,
  CategoryId,
  getCategoryLabel,
  PaymentMode,
} from '../src/types/expense';
import { showAlert, showConfirm, triggerHaptic } from '../src/utils/feedback';
import { formatINR, isSameDay } from '../src/utils/format';

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];
const PAYMENT_MODES: PaymentMode[] = ['UPI', 'Cash', 'Card'];

export default function AddEditExpenseModal() {
  const { expenses, profile, addExpense, updateExpense, deleteExpense, t } = useExpenses();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const editingId = typeof params.id === 'string' ? params.id : undefined;

  const existingExpense = useMemo(
    () => (editingId ? expenses.find((e) => e.id === editingId) : undefined),
    [editingId, expenses]
  );

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [note, setNote] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    if (existingExpense) {
      setAmount(String(existingExpense.amount));
      setCategory(existingExpense.category);
      setPaymentMode(existingExpense.paymentMode);
      setNote(existingExpense.note);
      setSelectedDate(new Date(existingExpense.date));
    }
  }, [existingExpense]);

  const lang = profile.language || 'en';
  const suggestions = CATEGORIES[category]?.suggestions[lang] || [];

  const handleQuickAdd = (val: number) => {
    triggerHaptic('light');
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const shiftDate = (days: number) => {
    triggerHaptic('light');
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + days);
    const now = new Date();
    if (next.getTime() > now.getTime()) return;
    setSelectedDate(next);
  };

  const setRelativeDay = (daysAgo: number) => {
    triggerHaptic('light');
    const target = new Date();
    target.setDate(target.getDate() - daysAgo);
    setSelectedDate(target);
  };

  const isTodaySelected = isSameDay(selectedDate, new Date());
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d;
  }, []);
  const twoDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d;
  }, []);

  const isYesterdaySelected = isSameDay(selectedDate, yesterday);
  const isTwoDaysAgoSelected = isSameDay(selectedDate, twoDaysAgo);

  const formattedDatePill = selectedDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      showAlert(t.invalidAmountTitle, t.invalidAmountMsg);
      return;
    }

    triggerHaptic('success');

    const payload = {
      amount: numericAmount,
      category,
      note,
      paymentMode,
      date: selectedDate.toISOString(),
    };

    if (existingExpense) {
      await updateExpense(existingExpense.id, payload);
    } else {
      await addExpense(payload);
    }
    router.back();
  };

  const handleDelete = () => {
    if (!existingExpense) return;
    triggerHaptic('warning');
    showConfirm(
      t.deleteTitle,
      `${getCategoryLabel(existingExpense.category, lang)} — ${formatINR(existingExpense.amount)}`,
      t.cancel,
      t.delete,
      async () => {
        await deleteExpense(existingExpense.id);
        router.back();
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <Text style={styles.modalTitle}>
            {existingExpense ? t.editExpenseTitle : t.addNewTitle}
          </Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={styles.amountBox}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              autoFocus={!existingExpense}
            />
            {amount ? (
              <TouchableOpacity
                onPress={() => setAmount('')}
                style={styles.clearAmtBtn}
                hitSlop={8}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSubtle} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.chipsRow}>
            {QUICK_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.chip}
                onPress={() => handleQuickAdd(val)}
              >
                <Text style={styles.chipText}>+₹{val}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>{t.category}</Text>
          <View style={styles.catGrid}>
            {CATEGORY_LIST.map((cat) => {
              const isSelected = category === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.catItem,
                    isSelected && { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDark },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[styles.catIcon, { backgroundColor: cat.bgColor }]}>
                    <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {getCategoryLabel(cat.id, lang)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t.paymentMode}</Text>
          <View style={styles.modeRow}>
            {PAYMENT_MODES.map((mode) => {
              const active = paymentMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeBtn, active && styles.modeBtnActive]}
                  onPress={() => setPaymentMode(mode)}
                >
                  <Text style={[styles.modeText, active && styles.modeTextActive]}>{mode}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>{t.dateLabel}</Text>
          <View style={styles.dateRow}>
            <TouchableOpacity
              style={[styles.dateChip, isTodaySelected && styles.dateChipActive]}
              onPress={() => setRelativeDay(0)}
            >
              <Text style={[styles.dateChipText, isTodaySelected && styles.dateChipTextActive]}>
                {t.today}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateChip, isYesterdaySelected && styles.dateChipActive]}
              onPress={() => setRelativeDay(1)}
            >
              <Text style={[styles.dateChipText, isYesterdaySelected && styles.dateChipTextActive]}>
                {t.yesterday}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.dateChip, isTwoDaysAgoSelected && styles.dateChipActive]}
              onPress={() => setRelativeDay(2)}
            >
              <Text style={[styles.dateChipText, isTwoDaysAgoSelected && styles.dateChipTextActive]}>
                {t.twoDaysAgo}
              </Text>
            </TouchableOpacity>
            <View style={styles.dateStepper}>
              <TouchableOpacity onPress={() => shiftDate(-1)} hitSlop={6}>
                <Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.dateStepperText}>{formattedDatePill}</Text>
              <TouchableOpacity
                onPress={() => shiftDate(1)}
                disabled={isTodaySelected}
                hitSlop={6}
                style={{ opacity: isTodaySelected ? 0.35 : 1 }}
              >
                <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.label}>{t.noteOptional}</Text>
          <View style={styles.suggestionsRow}>
            {suggestions.map((tag) => {
              const active = note === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.suggestionChip, active && styles.suggestionChipActive]}
                  onPress={() => setNote(active ? '' : tag)}
                >
                  <Text
                    style={[
                      styles.suggestionText,
                      active && styles.suggestionTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t.notePlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={22} color={COLORS.primaryText} />
            <Text style={styles.saveBtnText}>
              {existingExpense ? t.updateExpense : t.saveExpense}
            </Text>
          </TouchableOpacity>

          {existingExpense ? (
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={handleDelete}
              activeOpacity={0.85}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.dangerText} />
              <Text style={styles.deleteBtnText}>{t.deleteExpenseBtn}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { backgroundColor: COLORS.surfaceAlt, padding: 8, borderRadius: 20 },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  rupeeSymbol: { fontSize: 34, fontWeight: '800', color: COLORS.primary, marginRight: 6 },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    color: COLORS.text,
    minWidth: 110,
    textAlign: 'center',
  },
  clearAmtBtn: {
    position: 'absolute',
    right: 16,
  },
  chipsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18, gap: 8 },
  chip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '700' },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  catItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 10,
  },
  catIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catLabel: { color: COLORS.text, fontSize: 13, fontWeight: '600', flex: 1 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  modeBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  modeText: { color: COLORS.textMuted, fontWeight: '700' },
  modeTextActive: { color: COLORS.primaryText },
  dateRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  dateChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dateChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primary },
  dateChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  dateChipTextActive: { color: COLORS.primaryLight },
  dateStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
    marginLeft: 'auto',
  },
  dateStepperText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  suggestionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  suggestionChip: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestionChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  suggestionText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  suggestionTextActive: { color: COLORS.primaryLight },
  noteInput: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 22,
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: COLORS.primaryText, fontSize: 16, fontWeight: '800' },
  deleteBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: COLORS.dangerBorder,
  },
  deleteBtnText: { color: COLORS.dangerText, fontSize: 14, fontWeight: '700' },
});
