import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../src/constants/theme';
import { useExpenses } from '../../src/context/ExpenseContext';
import { UdhaarEntry } from '../../src/types/expense';
import { showAlert, showConfirm, triggerHaptic } from '../../src/utils/feedback';
import { formatExpenseDate, formatINR } from '../../src/utils/format';

type StatusFilter = 'all' | 'pending' | 'settled';

export default function UdhaarScreen() {
  const { udhaarList, profile, t, addUdhaar, toggleSettleUdhaar, deleteUdhaar } = useExpenses();
  const lang = profile.language || 'en';

  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'lent' | 'borrowed'>('lent');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { totalToReceive, totalToPay, netBalance } = useMemo(() => {
    let receive = 0;
    let pay = 0;
    for (const u of udhaarList) {
      if (u.settled) continue;
      if (u.type === 'lent') receive += u.amount;
      else pay += u.amount;
    }
    return {
      totalToReceive: receive,
      totalToPay: pay,
      netBalance: receive - pay,
    };
  }, [udhaarList]);

  const filteredList = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return udhaarList.filter((item) => {
      if (statusFilter === 'pending' && item.settled) return false;
      if (statusFilter === 'settled' && !item.settled) return false;
      if (!q) return true;
      return (
        item.person.toLowerCase().includes(q) ||
        (item.note || '').toLowerCase().includes(q)
      );
    });
  }, [udhaarList, statusFilter, searchQuery]);

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!person.trim() || !val || val <= 0) {
      showAlert(t.requiredTitle, t.udhaarRequiredMsg);
      return;
    }

    await addUdhaar({ person, amount: val, type, note });
    triggerHaptic('success');
    setPerson('');
    setAmount('');
    setNote('');
  };

  const handleRemind = async (item: UdhaarEntry) => {
    const reasonText = item.note ? ` ${t.remindMessageFor} "${item.note}"` : '';
    const message = `${t.remindMessagePrefix} ${item.person}, ${t.remindMessageLent} ${formatINR(item.amount)}${reasonText} (KharchaBook).`;

    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        showAlert(t.remind, message);
        return;
      }
      await Share.share({ message });
    } catch {
      showAlert(t.remind, message);
    }
  };

  const handleDelete = (item: UdhaarEntry) => {
    triggerHaptic('warning');
    showConfirm(
      t.deleteUdhaarTitle,
      `${item.person} — ${formatINR(item.amount)}`,
      t.cancel,
      t.delete,
      () => deleteUdhaar(item.id)
    );
  };

  const netNote =
    netBalance > 0 ? t.netReceiveNote : netBalance < 0 ? t.netPayNote : t.netSettledNote;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>{t.udhaarTitle}</Text>
      <Text style={styles.headerSub}>{t.udhaarSub}</Text>

      <View style={styles.netBanner}>
        <View>
          <Text style={styles.netLabel}>{t.netBalance}</Text>
          <Text style={styles.netNote}>{netNote}</Text>
        </View>
        <Text
          style={[
            styles.netVal,
            {
              color:
                netBalance > 0
                  ? COLORS.primaryLight
                  : netBalance < 0
                  ? COLORS.dangerLight
                  : COLORS.text,
            },
          ]}
        >
          {netBalance > 0 ? `+${formatINR(netBalance)}` : formatINR(netBalance)}
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.sumCard, { borderColor: '#065F46' }]}>
          <Text style={styles.sumLabel}>{t.toReceive}</Text>
          <Text style={[styles.sumVal, { color: '#34D399' }]}>{formatINR(totalToReceive)}</Text>
        </View>
        <View style={[styles.sumCard, { borderColor: COLORS.dangerBorder }]}>
          <Text style={styles.sumLabel}>{t.toPay}</Text>
          <Text style={[styles.sumVal, { color: COLORS.dangerLight }]}>{formatINR(totalToPay)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'lent' && styles.typeBtnLent]}
            onPress={() => setType('lent')}
          >
            <Text style={[styles.typeText, type === 'lent' && { color: COLORS.primaryText }]}>
              {t.lentBtn}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'borrowed' && styles.typeBtnBorrowed]}
            onPress={() => setType('borrowed')}
          >
            <Text style={[styles.typeText, type === 'borrowed' && { color: COLORS.primaryText }]}>
              {t.borrowedBtn}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1.3 }]}
            value={person}
            onChangeText={setPerson}
            placeholder={t.friendPlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />
          <TextInput
            style={[styles.input, { flex: 0.9 }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder={t.amountPlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={note}
            onChangeText={setNote}
            placeholder={t.reasonPlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Ionicons name="add" size={22} color={COLORS.primaryText} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.controlsRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={14} color={COLORS.textSubtle} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t.udhaarSearchPlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={14} color={COLORS.textSubtle} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={styles.filterTabs}>
        {(['all', 'pending', 'settled'] as const).map((tab) => {
          const active = statusFilter === tab;
          const label =
            tab === 'all' ? t.filterAll : tab === 'pending' ? t.filterPending : t.filterSettled;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setStatusFilter(tab)}
            >
              <Text style={[styles.filterTabText, active && styles.filterTabTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>{t.noUdhaar}</Text>}
        renderItem={({ item }) => {
          const isLent = item.type === 'lent';
          return (
            <View style={[styles.itemCard, item.settled && { opacity: 0.6 }]}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <View style={styles.itemTop}>
                  <Text
                    style={[
                      styles.personName,
                      item.settled && { textDecorationLine: 'line-through' },
                    ]}
                  >
                    {item.person}
                  </Text>
                  <View
                    style={[
                      styles.tag,
                      { backgroundColor: isLent ? COLORS.primaryDark : COLORS.dangerBg },
                    ]}
                  >
                    <Text
                      style={{
                        color: isLent ? COLORS.primaryLight : COLORS.dangerText,
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {isLent ? t.toReceive : t.toPay}
                    </Text>
                  </View>
                </View>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                <Text style={styles.itemDate}>{formatExpenseDate(item.date, lang)}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text
                  style={[
                    styles.itemAmt,
                    { color: isLent ? '#34D399' : COLORS.dangerLight },
                  ]}
                >
                  {formatINR(item.amount)}
                </Text>
                <View style={styles.actionRow}>
                  {isLent && !item.settled ? (
                    <TouchableOpacity
                      style={styles.remindBtn}
                      onPress={() => handleRemind(item)}
                    >
                      <Ionicons name="paper-plane-outline" size={12} color={COLORS.info} />
                      <Text style={styles.remindText}>{t.remind}</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.settleBtn, item.settled && { backgroundColor: COLORS.surfaceAlt }]}
                    onPress={() => {
                      triggerHaptic('light');
                      toggleSettleUdhaar(item.id);
                    }}
                  >
                    <Text style={styles.settleText}>{item.settled ? t.settled : t.settle}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.textSubtle} />
                  </TouchableOpacity>
                </View>
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
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginTop: 8 },
  headerSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, marginBottom: 12 },
  netBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  netLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.7 },
  netNote: { color: COLORS.textSecondary, fontSize: 12, marginTop: 2 },
  netVal: { fontSize: 20, fontWeight: '800' },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  sumCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  sumLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  sumVal: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    gap: 8,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  typeBtnLent: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  typeBtnBorrowed: { backgroundColor: COLORS.dangerLight, borderColor: COLORS.dangerLight },
  typeText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '800' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsRow: { marginBottom: 8 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  searchInput: { flex: 1, color: COLORS.text, paddingVertical: 7, fontSize: 12 },
  filterTabs: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterTabActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterTabText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  filterTabTextActive: { color: COLORS.primaryText },
  emptyText: { color: COLORS.textSubtle, textAlign: 'center', marginTop: 28, fontSize: 13 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 13,
    marginBottom: 9,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  personName: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  itemNote: { color: COLORS.textMuted, fontSize: 12, marginTop: 3 },
  itemDate: { color: COLORS.textSubtle, fontSize: 11, marginTop: 3 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  itemAmt: { fontSize: 16, fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  remindBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.surfaceAlt,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  remindText: { color: COLORS.info, fontSize: 11, fontWeight: '700' },
  settleBtn: {
    backgroundColor: '#065F46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settleText: { color: '#ECFDF5', fontSize: 11, fontWeight: '700' },
});
