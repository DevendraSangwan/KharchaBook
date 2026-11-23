import React, { useState } from 'react';
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
import * as Haptics from 'expo-haptics';
import { useExpenses } from '../../src/context/ExpenseContext';
import { formatExpenseDate, formatINR } from '../../src/utils/format';

export default function UdhaarScreen() {
  const { udhaarList, t, addUdhaar, toggleSettleUdhaar, deleteUdhaar } = useExpenses();

  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'lent' | 'borrowed'>('lent');

  const totalToReceive = udhaarList
    .filter((u) => u.type === 'lent' && !u.settled)
    .reduce((sum, u) => sum + u.amount, 0);

  const totalToPay = udhaarList
    .filter((u) => u.type === 'borrowed' && !u.settled)
    .reduce((sum, u) => sum + u.amount, 0);

  const handleAdd = async () => {
    const val = parseFloat(amount);
    if (!person.trim() || !val || val <= 0) {
      Alert.alert('Required', 'Please enter a person name and valid amount (₹).');
      return;
    }

    await addUdhaar({ person, amount: val, type, note });
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    setPerson('');
    setAmount('');
    setNote('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{t.udhaarTitle}</Text>
      <Text style={styles.headerSub}>{t.udhaarSub}</Text>

      <View style={styles.summaryRow}>
        <View style={[styles.sumCard, { borderColor: '#065F46' }]}>
          <Text style={styles.sumLabel}>{t.toReceive}</Text>
          <Text style={[styles.sumVal, { color: '#34D399' }]}>{formatINR(totalToReceive)}</Text>
        </View>
        <View style={[styles.sumCard, { borderColor: '#7F1D1D' }]}>
          <Text style={styles.sumLabel}>{t.toPay}</Text>
          <Text style={[styles.sumVal, { color: '#F87171' }]}>{formatINR(totalToPay)}</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'lent' && styles.typeBtnLent]}
            onPress={() => setType('lent')}
          >
            <Text style={[styles.typeText, type === 'lent' && { color: '#0F172A' }]}>
              {t.lentBtn}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, type === 'borrowed' && styles.typeBtnBorrowed]}
            onPress={() => setType('borrowed')}
          >
            <Text style={[styles.typeText, type === 'borrowed' && { color: '#0F172A' }]}>
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
            placeholderTextColor="#64748B"
          />
          <TextInput
            style={[styles.input, { flex: 0.9 }]}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder={t.amountPlaceholder}
            placeholderTextColor="#64748B"
          />
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={note}
            onChangeText={setNote}
            placeholder={t.reasonPlaceholder}
            placeholderTextColor="#64748B"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Ionicons name="add" size={22} color="#0F172A" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={udhaarList}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>{t.noUdhaar}</Text>}
        renderItem={({ item }) => {
          const isLent = item.type === 'lent';
          return (
            <View style={[styles.itemCard, item.settled && { opacity: 0.55 }]}>
              <View style={{ flex: 1 }}>
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
                    style={[styles.tag, { backgroundColor: isLent ? '#064E3B' : '#450A0A' }]}
                  >
                    <Text
                      style={{
                        color: isLent ? '#6EE7B7' : '#FCA5A5',
                        fontSize: 10,
                        fontWeight: '700',
                      }}
                    >
                      {isLent ? t.toReceive : t.toPay}
                    </Text>
                  </View>
                </View>
                {item.note ? <Text style={styles.itemNote}>{item.note}</Text> : null}
                <Text style={styles.itemDate}>{formatExpenseDate(item.date)}</Text>
              </View>

              <View style={styles.rightCol}>
                <Text style={[styles.itemAmt, { color: isLent ? '#34D399' : '#F87171' }]}>
                  {formatINR(item.amount)}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.settleBtn, item.settled && { backgroundColor: '#1E293B' }]}
                    onPress={() => toggleSettleUdhaar(item.id)}
                  >
                    <Text style={styles.settleText}>{item.settled ? t.settled : t.settle}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteUdhaar(item.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color="#64748B" />
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
    backgroundColor: '#020617',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 36 : 12,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#F8FAFC' },
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2, marginBottom: 14 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  sumCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
  },
  sumLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  sumVal: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  formCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
    gap: 10,
  },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#020617',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  typeBtnLent: { backgroundColor: '#10B981', borderColor: '#10B981' },
  typeBtnBorrowed: { backgroundColor: '#F87171', borderColor: '#F87171' },
  typeText: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    backgroundColor: '#020617',
    color: '#F8FAFC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  addBtn: {
    backgroundColor: '#10B981',
    width: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 32, fontSize: 13 },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  personName: { color: '#F8FAFC', fontSize: 15, fontWeight: '700' },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  itemNote: { color: '#94A3B8', fontSize: 12, marginTop: 3 },
  itemDate: { color: '#64748B', fontSize: 11, marginTop: 3 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  itemAmt: { fontSize: 16, fontWeight: '800' },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settleBtn: {
    backgroundColor: '#065F46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  settleText: { color: '#ECFDF5', fontSize: 11, fontWeight: '700' },
});
