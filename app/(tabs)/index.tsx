import React, { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useExpenses } from '../../src/context/ExpenseContext';
import { CATEGORIES, Expense } from '../../src/types/expense';
import { formatExpenseDate, formatINR } from '../../src/utils/format';

const FILTERS = ['All', 'UPI', 'Cash', 'Card'] as const;

export default function HomeScreen() {
  const {
    expenses,
    monthlyBudget,
    profile,
    t,
    currentMonthTotal,
    todayTotal,
    dailySafeSpend,
    deleteExpense,
  } = useExpenses();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<(typeof FILTERS)[number]>('All');

  const remaining = monthlyBudget - currentMonthTotal;
  const usagePercent =
    monthlyBudget > 0 ? Math.min((currentMonthTotal / monthlyBudget) * 100, 100) : 0;

  const progressColor =
    usagePercent >= 90 ? '#EF4444' : usagePercent >= 70 ? '#F59E0B' : '#10B981';

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchesMode = selectedMode === 'All' || item.paymentMode === selectedMode;
      const catLabel = CATEGORIES[item.category]?.label.toLowerCase() || '';
      const noteText = (item.note || '').toLowerCase();
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || noteText.includes(q) || catLabel.includes(q);
      return matchesMode && matchesSearch;
    });
  }, [expenses, selectedMode, searchQuery]);

  const handleDelete = (item: Expense) => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
    Alert.alert(
      t.deleteTitle,
      `${CATEGORIES[item.category].label} — ${formatINR(item.amount)}`,
      [
        { text: t.cancel, style: 'cancel' },
        { text: t.delete, style: 'destructive', onPress: () => deleteExpense(item.id) },
      ]
    );
  };

  const monthName = new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>
            {profile.avatar} {t.hiUser}, {profile.name || 'Friend'}
          </Text>
          <Text style={styles.subtitle}>{monthName}</Text>
        </View>
        <TouchableOpacity
          style={styles.quickAddBtn}
          onPress={() => router.push('/modal')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color="#0F172A" />
          <Text style={styles.quickAddText}>{t.newBtn}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.cardLabel}>{t.thisMonthSpent}</Text>
            <Text style={styles.bigAmount}>{formatINR(currentMonthTotal)}</Text>
          </View>
          <View style={styles.safePill}>
            <Text style={styles.safePillLabel}>{t.safeDailyLimit}</Text>
            <Text style={styles.safePillVal}>
              {formatINR(dailySafeSpend)}
              {t.perDay}
            </Text>
          </View>
        </View>

        <View style={styles.progressBg}>
          <View
            style={[
              styles.progressFill,
              { width: `${usagePercent}%`, backgroundColor: progressColor },
            ]}
          />
        </View>

        <View style={styles.budgetRow}>
          <Text style={styles.budgetMeta}>
            {t.budgetLabel} <Text style={styles.budgetBold}>{formatINR(monthlyBudget)}</Text>
          </Text>
          <Text
            style={[
              styles.budgetMeta,
              { color: remaining < 0 ? '#FCA5A5' : '#6EE7B7', fontWeight: '700' },
            ]}
          >
            {remaining >= 0
              ? `${formatINR(remaining)} ${t.left}`
              : `${formatINR(Math.abs(remaining))} ${t.over}`}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>{t.todaysSpend}</Text>
          <Text style={styles.miniValue}>{formatINR(todayTotal)}</Text>
        </View>
        <View style={styles.miniCard}>
          <Text style={styles.miniLabel}>{t.totalEntries}</Text>
          <Text style={styles.miniValue}>{expenses.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#64748B" />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchPlaceholder}
          placeholderTextColor="#64748B"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color="#64748B" />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((mode) => {
          const active = selectedMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setSelectedMode(mode)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{mode}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#475569" />
            <Text style={styles.emptyTitle}>{t.noMatching}</Text>
            <Text style={styles.emptySub}>{t.noMatchingSub}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const cat = CATEGORIES[item.category] || CATEGORIES.other;
          return (
            <View style={styles.txCard}>
              <View style={[styles.iconCircle, { backgroundColor: cat.bgColor }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>

              <View style={styles.txMiddle}>
                <Text style={styles.txTitle}>{item.note || cat.label}</Text>
                <View style={styles.txMetaRow}>
                  <Text style={styles.txCat}>{cat.label}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.paymentMode}</Text>
                  </View>
                </View>
                <Text style={styles.txDate}>{formatExpenseDate(item.date)}</Text>
              </View>

              <View style={styles.txRight}>
                <Text style={styles.txAmount}>-{formatINR(item.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  appTitle: { fontSize: 22, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.4 },
  subtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  quickAddText: { color: '#0F172A', fontWeight: '700', fontSize: 14 },
  summaryCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
  },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  bigAmount: { color: '#F8FAFC', fontSize: 32, fontWeight: '800', marginTop: 4 },
  safePill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  safePillLabel: { color: '#6EE7B7', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  safePillVal: { color: '#ECFDF5', fontSize: 13, fontWeight: '800', marginTop: 2 },
  progressBg: {
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 99,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetMeta: { color: '#94A3B8', fontSize: 12 },
  budgetBold: { color: '#E2E8F0', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  miniCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  miniLabel: { color: '#94A3B8', fontSize: 11 },
  miniValue: { color: '#F8FAFC', fontSize: 18, fontWeight: '700', marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 8,
    gap: 8,
  },
  searchInput: { flex: 1, color: '#F8FAFC', paddingVertical: 9, fontSize: 13 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  filterChipActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  filterText: { color: '#94A3B8', fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: '#0F172A' },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txMiddle: { flex: 1 },
  txTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  txCat: { color: '#94A3B8', fontSize: 11 },
  badge: { backgroundColor: '#1E293B', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  badgeText: { color: '#38BDF8', fontSize: 10, fontWeight: '700' },
  txDate: { color: '#64748B', fontSize: 10, marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 8 },
  txAmount: { color: '#F87171', fontSize: 15, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  emptyTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: '#64748B', fontSize: 12, textAlign: 'center', marginTop: 4 },
});
