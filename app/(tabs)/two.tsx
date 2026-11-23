import React, { useMemo } from 'react';
import { Platform, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useExpenses } from '../../src/context/ExpenseContext';
import { CATEGORY_LIST } from '../../src/types/expense';
import { formatINR } from '../../src/utils/format';

export default function AnalyticsScreen() {
  const { expenses, currentMonthTotal, t } = useExpenses();

  const monthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthExpenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    return CATEGORY_LIST.map((cat) => {
      const total = map[cat.id] || 0;
      const percent = currentMonthTotal > 0 ? (total / currentMonthTotal) * 100 : 0;
      return { ...cat, total, percent };
    })
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total);
  }, [monthExpenses, currentMonthTotal]);

  const modeBreakdown = useMemo(() => {
    const modes = { UPI: 0, Cash: 0, Card: 0 };
    monthExpenses.forEach((e) => {
      modes[e.paymentMode] = (modes[e.paymentMode] || 0) + e.amount;
    });
    return modes;
  }, [monthExpenses]);

  const topCategory = categoryBreakdown[0];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{t.analyticsTitle}</Text>
      <Text style={styles.headerSub}>{t.analyticsSub}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {topCategory ? (
          <View style={styles.highlightCard}>
            <View style={styles.highlightTop}>
              <View style={[styles.iconBox, { backgroundColor: topCategory.bgColor }]}>
                <Ionicons name={topCategory.icon as any} size={22} color={topCategory.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.highlightTag}>{t.topCategoryTag}</Text>
                <Text style={styles.highlightName}>{topCategory.label}</Text>
              </View>
              <Text style={styles.highlightAmt}>{formatINR(topCategory.total)}</Text>
            </View>
            <Text style={styles.highlightNote}>
              <Text style={{ color: '#10B981', fontWeight: '700' }}>
                {topCategory.percent.toFixed(0)}%{' '}
              </Text>
              {t.ofTotalSpent}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={40} color="#475569" />
            <Text style={styles.emptyText}>{t.noAnalytics}</Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>{t.paymentModesTitle}</Text>
        <View style={styles.modeGrid}>
          {(['UPI', 'Cash', 'Card'] as const).map((mode) => (
            <View key={mode} style={styles.modeCard}>
              <Text style={styles.modeLabel}>{mode}</Text>
              <Text style={styles.modeValue}>{formatINR(modeBreakdown[mode])}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{t.categoryBreakdownTitle}</Text>
        {categoryBreakdown.map((item) => (
          <View key={item.id} style={styles.catRow}>
            <View style={styles.catRowHeader}>
              <View style={styles.catLeft}>
                <View style={[styles.smallIcon, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon as any} size={16} color={item.color} />
                </View>
                <Text style={styles.catTitle}>{item.label}</Text>
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
      </ScrollView>
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
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2, marginBottom: 18 },
  highlightCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  highlightTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  highlightTag: { color: '#10B981', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  highlightName: { color: '#F8FAFC', fontSize: 16, fontWeight: '700' },
  highlightAmt: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  highlightNote: { color: '#94A3B8', fontSize: 12, marginTop: 12 },
  emptyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  emptyText: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginTop: 10 },
  sectionTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  modeGrid: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  modeCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modeLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  modeValue: { color: '#38BDF8', fontSize: 16, fontWeight: '800', marginTop: 4 },
  catRow: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  catRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  catLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  catTitle: { color: '#F8FAFC', fontSize: 14, fontWeight: '600' },
  catAmt: { color: '#F8FAFC', fontSize: 14, fontWeight: '700' },
  catPct: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },
  barBg: { height: 7, backgroundColor: '#1E293B', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
});
