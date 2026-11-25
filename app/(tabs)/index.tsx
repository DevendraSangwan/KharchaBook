import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { MonthSwitcher } from '../../src/components/MonthSwitcher';
import { COLORS } from '../../src/constants/theme';
import { useExpenses } from '../../src/context/ExpenseContext';
import {
  CATEGORIES,
  CATEGORY_LIST,
  CategoryId,
  Expense,
  getCategoryLabel,
} from '../../src/types/expense';
import { showConfirm, triggerHaptic } from '../../src/utils/feedback';
import {
  formatDayHeading,
  formatExpenseDate,
  formatINR,
  getDayKey,
} from '../../src/utils/format';

const FILTERS = ['All', 'UPI', 'Cash', 'Card'] as const;

interface DaySection {
  title: string;
  dayTotal: number;
  data: Expense[];
}

export default function HomeScreen() {
  const {
    expenses,
    monthlyBudget,
    profile,
    t,
    todayTotal,
    dailySafeSpend,
    deleteExpense,
  } = useExpenses();
  const router = useRouter();
  const lang = profile.language || 'en';

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMode, setSelectedMode] = useState<(typeof FILTERS)[number]>('All');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');

  const isCurrentMonth =
    selectedYear === now.getFullYear() && selectedMonth === now.getMonth();

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthExpenses]
  );

  const daysInSelectedMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const monthDailyAvg = Math.round(monthTotal / Math.max(daysInSelectedMonth, 1));

  const remaining = monthlyBudget - monthTotal;
  const usagePercent =
    monthlyBudget > 0 ? Math.min((monthTotal / monthlyBudget) * 100, 100) : 0;

  const progressColor =
    usagePercent >= 90
      ? COLORS.danger
      : usagePercent >= 70
      ? COLORS.warning
      : COLORS.primary;

  const filteredExpenses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return monthExpenses.filter((item) => {
      const matchesMode = selectedMode === 'All' || item.paymentMode === selectedMode;
      const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
      const catLabelEn = CATEGORIES[item.category]?.label.toLowerCase() || '';
      const catLabelHi = CATEGORIES[item.category]?.labelHi.toLowerCase() || '';
      const noteText = (item.note || '').toLowerCase();
      const matchesSearch =
        !q || noteText.includes(q) || catLabelEn.includes(q) || catLabelHi.includes(q);
      return matchesMode && matchesCat && matchesSearch;
    });
  }, [monthExpenses, selectedMode, selectedCategory, searchQuery]);

  const groupedSections: DaySection[] = useMemo(() => {
    const groups = new Map<string, Expense[]>();
    for (const item of filteredExpenses) {
      const key = getDayKey(item.date);
      const list = groups.get(key) || [];
      list.push(item);
      groups.set(key, list);
    }

    return Array.from(groups.values()).map((items) => ({
      title: formatDayHeading(items[0].date, lang),
      dayTotal: items.reduce((s, e) => s + e.amount, 0),
      data: items,
    }));
  }, [filteredExpenses, lang]);

  const handleDelete = (item: Expense) => {
    triggerHaptic('warning');
    showConfirm(
      t.deleteTitle,
      `${getCategoryLabel(item.category, lang)} — ${formatINR(item.amount)}`,
      t.cancel,
      t.delete,
      () => deleteExpense(item.id)
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={{ gap: 6 }}>
          <Text style={styles.appTitle}>
            {profile.avatar} {t.hiUser}, {profile.name || t.friendFallback}
          </Text>
          <MonthSwitcher
            year={selectedYear}
            month={selectedMonth}
            lang={lang}
            onChange={(y, m) => {
              setSelectedYear(y);
              setSelectedMonth(m);
            }}
          />
        </View>
        <TouchableOpacity
          style={styles.quickAddBtn}
          onPress={() => router.push('/modal')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={20} color={COLORS.primaryText} />
          <Text style={styles.quickAddText}>{t.newBtn}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.cardLabel}>
              {isCurrentMonth ? t.thisMonthSpent : t.monthSpentLabel}
            </Text>
            <Text style={styles.bigAmount}>{formatINR(monthTotal)}</Text>
          </View>
          <View style={styles.safePill}>
            <Text style={styles.safePillLabel}>
              {isCurrentMonth ? t.safeDailyLimit : t.dailyAvgLabel}
            </Text>
            <Text style={styles.safePillVal}>
              {formatINR(isCurrentMonth ? dailySafeSpend : monthDailyAvg)}
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
              {
                color: remaining < 0 ? COLORS.dangerText : COLORS.primaryLight,
                fontWeight: '700',
              },
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
          <Text style={styles.miniValue}>{monthExpenses.length}</Text>
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textSubtle} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={t.searchPlaceholder}
          placeholderTextColor={COLORS.textSubtle}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textSubtle} />
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
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {mode === 'All' ? t.all : mode}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginBottom: 10 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === 'all' && styles.catChipActive]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text
              style={[
                styles.catChipText,
                selectedCategory === 'all' && styles.catChipTextActive,
              ]}
            >
              {t.allCategories}
            </Text>
          </TouchableOpacity>
          {CATEGORY_LIST.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.catChip, active && styles.catChipActive]}
                onPress={() => setSelectedCategory(active ? 'all' : cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={12}
                  color={active ? COLORS.primaryLight : cat.color}
                />
                <Text style={[styles.catChipText, active && styles.catChipTextActive]}>
                  {getCategoryLabel(cat.id, lang)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <SectionList
        sections={groupedSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="receipt-outline" size={40} color="#475569" />
            <Text style={styles.emptyTitle}>{t.noMatching}</Text>
            <Text style={styles.emptySub}>{t.noMatchingSub}</Text>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionTotal}>{formatINR(section.dayTotal)}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const cat = CATEGORIES[item.category] || CATEGORIES.other;
          const catLabel = getCategoryLabel(item.category, lang);
          return (
            <TouchableOpacity
              style={styles.txCard}
              activeOpacity={0.82}
              onPress={() => router.push(`/modal?id=${encodeURIComponent(item.id)}`)}
            >
              <View style={[styles.iconCircle, { backgroundColor: cat.bgColor }]}>
                <Ionicons name={cat.icon as any} size={20} color={cat.color} />
              </View>

              <View style={styles.txMiddle}>
                <Text style={styles.txTitle} numberOfLines={1}>
                  {item.note || catLabel}
                </Text>
                <View style={styles.txMetaRow}>
                  <Text style={styles.txCat}>{catLabel}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.paymentMode}</Text>
                  </View>
                </View>
                <Text style={styles.txDate}>{formatExpenseDate(item.date, lang)}</Text>
              </View>

              <View style={styles.txRight}>
                <Text style={styles.txAmount}>-{formatINR(item.amount)}</Text>
                <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={10}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.textSubtle} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/modal')}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={28} color={COLORS.primaryText} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  appTitle: { fontSize: 21, fontWeight: '800', color: COLORS.text, letterSpacing: -0.4 },
  quickAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  quickAddText: { color: COLORS.primaryText, fontWeight: '700', fontSize: 14 },
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  summaryTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  bigAmount: { color: COLORS.text, fontSize: 30, fontWeight: '800', marginTop: 4 },
  safePill: {
    backgroundColor: COLORS.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'flex-end',
  },
  safePillLabel: { color: COLORS.primaryLight, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  safePillVal: { color: '#ECFDF5', fontSize: 13, fontWeight: '800', marginTop: 2 },
  progressBg: {
    height: 8,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: 99,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressFill: { height: '100%', borderRadius: 99 },
  budgetRow: { flexDirection: 'row', justifyContent: 'space-between' },
  budgetMeta: { color: COLORS.textMuted, fontSize: 12 },
  budgetBold: { color: '#E2E8F0', fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  miniCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  miniLabel: { color: COLORS.textMuted, fontSize: 11 },
  miniValue: { color: COLORS.text, fontSize: 17, fontWeight: '700', marginTop: 2 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 8, fontSize: 13 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  filterTextActive: { color: COLORS.primaryText },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catChipActive: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  catChipText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  catChipTextActive: { color: COLORS.primaryLight, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 12, fontWeight: '700' },
  sectionTotal: { color: COLORS.textMuted, fontSize: 12, fontWeight: '700' },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  txTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  txMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  txCat: { color: COLORS.textMuted, fontSize: 11 },
  badge: { backgroundColor: COLORS.surfaceAlt, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  badgeText: { color: COLORS.info, fontSize: 10, fontWeight: '700' },
  txDate: { color: COLORS.textSubtle, fontSize: 10, marginTop: 3 },
  txRight: { alignItems: 'flex-end', gap: 8, marginLeft: 8 },
  txAmount: { color: COLORS.dangerLight, fontSize: 15, fontWeight: '800' },
  emptyBox: { alignItems: 'center', paddingVertical: 36, paddingHorizontal: 20 },
  emptyTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '700', marginTop: 10 },
  emptySub: { color: COLORS.textSubtle, fontSize: 12, textAlign: 'center', marginTop: 4 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 18,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
