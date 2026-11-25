import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { formatMonthYear } from '../utils/format';
import { AppLanguage } from '../utils/i18n';

interface MonthSwitcherProps {
  year: number;
  month: number;
  lang: AppLanguage;
  onChange: (year: number, month: number) => void;
}

export function MonthSwitcher({ year, month, lang, onChange }: MonthSwitcherProps) {
  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  const handlePrev = () => {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  };

  const handleNext = () => {
    if (isCurrentMonth) return;
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={handlePrev} style={styles.arrowBtn} hitSlop={8}>
        <Ionicons name="chevron-back" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
      <Text style={styles.monthText}>{formatMonthYear(year, month, lang)}</Text>
      <TouchableOpacity
        onPress={handleNext}
        disabled={isCurrentMonth}
        style={[styles.arrowBtn, isCurrentMonth && { opacity: 0.3 }]}
        hitSlop={8}
      >
        <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  arrowBtn: {
    padding: 2,
  },
  monthText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
});
