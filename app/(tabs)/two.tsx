import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MonthSwitcher } from '../../src/components/MonthSwitcher';
import {
  CategoryDonutChart,
  DayBarItem,
  SevenDayBarChart,
} from '../../src/components/SpendingCharts';
import { COLORS } from '../../src/constants/theme';
import { useExpenses } from '../../src/context/ExpenseContext';
import { CATEGORY_LIST, getCategoryLabel } from '../../src/types/expense';
import { formatINR } from '../../src/utils/format';

export default function AnalyticsScreen() {
  const { expenses, profile, t } = useExpenses();
  const lang = profile.language || 'en';

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());

  const monthExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [expenses, selectedMonth, selectedYear]);

  const monthTotal = useMemo(
    () => monthExpenses.reduce((sum, e) => sum + e.amount, 0),
    [monthExpenses]
  );

  const prevMonthTotal = useMemo(() => {
    const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1;
    const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear;
    return expenses
      .filter((e) => {
        const d = new Date(e.date);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      })
      .reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, selectedMonth, selectedYear]);

  const momDiffPercent = useMemo(() => {
    if (prevMonthTotal <= 0) return null;
    return ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100;
  }, [monthTotal, prevMonthTotal]);

  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    const counts: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
      counts[e.category] = (counts[e.category] || 0) + 1;
    });

    return CATEGORY_LIST.map((cat) => {
      const total = totals[cat.id] || 0;
      const count = counts[cat.id] || 0;
      const percent = monthTotal > 0 ? (total / monthTotal) * 100 : 0;
      return {
        ...cat,
        localizedLabel: getCategoryLabel(cat.id, lang),
        total,
        count,
        percent,
      };
    })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses, monthTotal, lang]);

  const modeBreakdown = useMemo(() => {
    const modes = { UPI: 0, Cash: 0, Card: 0 };
    monthExpenses.forEach((e) => {
      modes[e.paymentMode] = (modes[e.paymentMode] || 0) + e.amount;
    });
    return modes;
  }, [monthExpenses]);

  const { avgDaily, highestDayLabel, highestDayAmount } = useMemo(() => {
    const isCurrentMonth =
      selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
    const daysElapsed = isCurrentMonth
      ? now.getDate()
      : new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const avg = Math.round(monthTotal / Math.max(daysElapsed, 1));

    const dayTotals = new Map<string, { label: string; total: number }>();
    for (const e of monthExpenses) {
      const d = new Date(e.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const existing = dayTotals.get(key);
      const label = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        day: 'numeric',
        month: 'short',
      });
      dayTotals.set(key, {
        label,
        total: (existing?.total || 0) + e.amount,
      });
    }

    let topDay = { label: '-', total: 0 };
    for (const entry of dayTotals.values()) {
      if (entry.total > topDay.total) {
        topDay = entry;
      }
    }

    return {
      avgDaily: avg,
      highestDayLabel: topDay.label,
      highestDayAmount: topDay.total,
    };
  }, [monthExpenses, monthTotal, selectedMonth, selectedYear, lang]);

  const sevenDayBars: DayBarItem[] = useMemo(() => {
    const isCurrentMonth =
      selectedYear === now.getFullYear() && selectedMonth === now.getMonth();
    const anchorDate = isCurrentMonth
      ? new Date()
      : new Date(selectedYear, selectedMonth + 1, 0);

    const items: DayBarItem[] = [];
    for (let offset = 6; offset >= 0; offset--) {
      const d = new Date(anchorDate);
      d.setDate(anchorDate.getDate() - offset);
      const dayAmt = expenses
        .filter((e) => {
          const ed = new Date(e.date);
          return (
            ed.getDate() === d.getDate() &&
            ed.getMonth() === d.getMonth() &&
            ed.getFullYear() === d.getFullYear()
          );
        })
        .reduce((s, e) => s + e.amount, 0);

      const label = d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
        weekday: 'narrow',
      });
      items.push({
        label,
        amount: dayAmt,
        isHighlight: offset === 0,
      });
    }
    return items;
  }, [expenses, selectedMonth, selectedYear, lang]);

  const topCategory = categoryBreakdown[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>{t.analyticsTitle}</Text>
          <Text style={styles.headerSub}>{t.analyticsSub}</Text>
        </View>
      </View>

      <View style={{ marginBottom: 14 }}>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {topCategory ? (
          <>
            <CategoryDonutChart
              slices={categoryBreakdown.map((c) => ({
                id: c.id,
                label: c.localizedLabel,
                value: c.total,
                percent: c.percent,
                color: c.color,
              }))}
              total={monthTotal}
              txCount={monthExpenses.length}
              txWord={t.transactionsWord}
            />

            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{t.avgDailySpend}</Text>
                <Text style={styles.kpiVal}>{formatINR(avgDaily)}</Text>
                <Text style={styles.kpiMeta}>
                  {momDiffPercent === null
                    ? t.noPrevMonthData
                    : `${momDiffPercent >= 0 ? '+' : ''}${momDiffPercent.toFixed(0)}% ${t.vsLastMonth}`}
                </Text>
              </View>
              <View style={styles.kpiCard}>
                <Text style={styles.kpiLabel}>{t.highestDay}</Text>
                <Text style={styles.kpiVal}>{formatINR(highestDayAmount)}</Text>
                <Text style={styles.kpiMeta}>{highestDayLabel}</Text>
              </View>
            </View>

            <View style={styles.highlightCard}>
              <View style={styles.highlightTop}>
                <View style={[styles.iconBox, { backgroundColor: topCategory.bgColor }]}>
                  <Ionicons name={topCategory.icon as any} size={22} color={topCategory.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.highlightTag}>{t.topCategoryTag}</Text>
                  <Text style={styles.highlightName}>{topCategory.localizedLabel}</Text>
                </View>
                <Text style={styles.highlightAmt}>{formatINR(topCategory.total)}</Text>
              </View>
              <Text style={styles.highlightNote}>
                <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
                  {topCategory.percent.toFixed(0)}%{' '}
                </Text>
                {t.ofTotalSpent}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={40} color="#475569" />
            <Text style={styles.emptyText}>{t.noAnalytics}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t.dailyTrendTitle}</Text>
        <SevenDayBarChart days={sevenDayBars} />

        <Text style={styles.sectionTitle}>{t.paymentModesTitle}</Text>
        <View style={styles.modeGrid}>
          {(['UPI', 'Cash', 'Card'] as const).map((mode) => {
            const val = modeBreakdown[mode];
            const pct = monthTotal > 0 ? Math.round((val / monthTotal) * 100) : 0;
            return (
              <View key={mode} style={styles.modeCard}>
                <Text style={styles.modeLabel}>{mode}</Text>
                <Text style={styles.modeValue}>{formatINR(val)}</Text>
                <Text style={styles.modePct}>{pct}%</Text>
              </View>
            );
          })}
        </View>

        {categoryBreakdown.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>{t.categoryBreakdownTitle}</Text>
            {categoryBreakdown.map((item) => (
              <View key={item.id} style={styles.catRow}>
                <View style={styles.catRowHeader}>
                  <View style={styles.catLeft}>
                    <View style={[styles.smallIcon, { backgroundColor: item.bgColor }]}>
                      <Ionicons name={item.icon as any} size={16} color={item.color} />
                    </View>
                    <View>
                      <Text style={styles.catTitle}>{item.localizedLabel}</Text>
                      <Text style={styles.catCount}>
                        {item.count} {t.transactionsWord}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.catAmt}>
                    {formatINR(item.total)}{' '}
                    <Text style={styles.catPct}>({item.percent.toFixed(0)}%)</Text>
                  </Text>
                </View>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${Math.max(item.percent, 4)}%`, backgroundColor: item.color },
                    ]}
                  />
                </View>
              </View>
            ))}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
  },
  headerRow: { marginTop: 8 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, marginBottom: 10 },
  kpiRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  kpiCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  kpiLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  kpiVal: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 3 },
  kpiMeta: { color: COLORS.primaryLight, fontSize: 11, fontWeight: '600', marginTop: 3 },
  highlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  highlightTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  highlightTag: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  highlightName: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  highlightAmt: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  highlightNote: { color: COLORS.textMuted, fontSize: 12, marginTop: 10 },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  modeGrid: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  modeValue: { color: COLORS.info, fontSize: 15, fontWeight: '800', marginTop: 4 },
  modePct: { color: COLORS.textSubtle, fontSize: 11, fontWeight: '600', marginTop: 2 },
  catRow: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  catRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  catTitle: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  catCount: { color: COLORS.textSubtle, fontSize: 11, marginTop: 1 },
  catAmt: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  catPct: { color: COLORS.textMuted, fontSize: 12, fontWeight: '500' },
  barBg: { height: 7, backgroundColor: COLORS.surfaceAlt, borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
});
