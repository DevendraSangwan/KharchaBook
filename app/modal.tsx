import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useExpenses } from '../src/context/ExpenseContext';
import { CATEGORY_LIST, CategoryId, PaymentMode } from '../src/types/expense';

const QUICK_AMOUNTS = [20, 50, 100, 200, 500];
const PAYMENT_MODES: PaymentMode[] = ['UPI', 'Cash', 'Card'];

export default function AddExpenseModal() {
  const { addExpense, t } = useExpenses();
  const router = useRouter();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('food');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('UPI');
  const [note, setNote] = useState('');

  const handleSave = async () => {
    const numericAmount = parseFloat(amount);
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter an amount greater than ₹0.');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await addExpense({ amount: numericAmount, category, note, paymentMode });
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <Text style={styles.modalTitle}>{t.addNewTitle}</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#CBD5E1" />
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
              autoFocus
            />
          </View>

          <View style={styles.chipsRow}>
            {QUICK_AMOUNTS.map((val) => (
              <TouchableOpacity
                key={val}
                style={styles.chip}
                onPress={() => setAmount(String(val))}
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
                    isSelected && { borderColor: '#10B981', backgroundColor: '#064E3B' },
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[styles.catIcon, { backgroundColor: cat.bgColor }]}>
                    <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                  </View>
                  <Text style={styles.catLabel} numberOfLines={1}>
                    {cat.label}
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

          <Text style={styles.label}>{t.noteOptional}</Text>
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder={t.notePlaceholder}
            placeholderTextColor="#64748B"
          />

          <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
            <Ionicons name="checkmark-circle" size={22} color="#0F172A" />
            <Text style={styles.saveBtnText}>{t.saveExpense}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 36 : 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#F8FAFC' },
  closeBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 20 },
  amountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  rupeeSymbol: { fontSize: 34, fontWeight: '800', color: '#10B981', marginRight: 6 },
  amountInput: {
    fontSize: 42,
    fontWeight: '800',
    color: '#F8FAFC',
    minWidth: 100,
    textAlign: 'center',
  },
  chipsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  chip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  chipText: { color: '#6EE7B7', fontSize: 12, fontWeight: '700' },
  label: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  catItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    gap: 10,
  },
  catIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  catLabel: { color: '#F8FAFC', fontSize: 13, fontWeight: '600', flex: 1 },
  modeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  modeText: { color: '#94A3B8', fontWeight: '700' },
  modeTextActive: { color: '#0F172A' },
  noteInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 24,
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});
