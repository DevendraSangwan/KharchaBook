import React, { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useExpenses } from '../../src/context/ExpenseContext';
import { CATEGORIES } from '../../src/types/expense';
import { formatINR } from '../../src/utils/format';
import { AppLanguage } from '../../src/utils/i18n';

const BUDGET_PRESETS = [3000, 5000, 10000, 20000];
const AVATARS = ['👩🏻‍💻', '🧑🏻‍🎓', '💼', '🚀', '🌟', '🦁'];

export default function ProfileScreen() {
  const { monthlyBudget, currentMonthTotal, profile, t, saveProfile, expenses, clearAllData } =
    useExpenses();
  const [nameInput, setNameInput] = useState(profile.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '👩🏻‍💻');
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(profile.language || 'en');
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));

  useEffect(() => {
    setNameInput(profile.name);
    setSelectedAvatar(profile.avatar);
    setSelectedLang(profile.language || 'en');
    setBudgetInput(String(monthlyBudget));
  }, [profile, monthlyBudget]);

  const handleSaveSettings = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) {
      Alert.alert('Invalid Budget', 'Please enter a valid monthly budget amount.');
      return;
    }
    await saveProfile(nameInput, selectedAvatar, val, selectedLang);
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    Alert.alert('Saved!', 'Profile, language & budget updated.');
  };

  const handleExportCSV = async () => {
    if (expenses.length === 0) {
      Alert.alert('No Data', 'Add at least one expense before exporting.');
      return;
    }

    const header = 'Date,Category,Note,Payment Mode,Amount (INR)\n';
    const rows = expenses
      .map((e) => {
        const dateStr = new Date(e.date).toLocaleDateString('en-IN');
        const catName = CATEGORIES[e.category]?.label || e.category;
        const cleanNote = (e.note || '-').replace(/,/g, ' ');
        return `${dateStr},${catName},${cleanNote},${e.paymentMode},${e.amount}`;
      })
      .join('\n');

    try {
      await Share.share({
        title: 'KharchaBook Expense Report',
        message: header + rows,
      });
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleReset = () => {
    Alert.alert('Reset All Data?', 'This will permanently delete all saved entries.', [
      { text: t.cancel, style: 'cancel' },
      {
        text: t.delete,
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          Alert.alert('Cleared', 'All data has been reset.');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>{t.profileTitle}</Text>
      <Text style={styles.headerSub}>{t.profileSub}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Top User Identity Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.bigAvatarCircle}>
            <Text style={styles.bigAvatarText}>{profile.avatar || '👩🏻‍💻'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerName}>{profile.name || 'KharchaBook User'}</Text>
            <Text style={styles.bannerMeta}>
              {t.budgetLabel} {formatINR(monthlyBudget)} • {formatINR(currentMonthTotal)}
            </Text>
          </View>
        </View>

        {/* Edit Profile & Budget Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.editProfileCard}</Text>

          {/* Language Toggle */}
          <Text style={styles.fieldLabel}>{t.chooseLang}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'en' && styles.langBtnActive]}
              onPress={() => setSelectedLang('en')}
            >
              <Text style={[styles.langText, selectedLang === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'hi' && styles.langBtnActive]}
              onPress={() => setSelectedLang('hi')}
            >
              <Text style={[styles.langText, selectedLang === 'hi' && styles.langTextActive]}>
                हिंदी (Hindi)
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>{t.selectAvatar}</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.avatarBtn, selectedAvatar === item && styles.avatarBtnActive]}
                onPress={() => setSelectedAvatar(item)}
              >
                <Text style={{ fontSize: 20 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t.yourName}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 14 }]}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder="Your Name"
            placeholderTextColor="#64748B"
          />

          <Text style={styles.fieldLabel}>{t.monthlyLimitLabel}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="numeric"
            placeholder="10000"
            placeholderTextColor="#64748B"
          />

          <View style={styles.presetRow}>
            {BUDGET_PRESETS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.presetChip}
                onPress={() => setBudgetInput(String(amt))}
              >
                <Text style={styles.presetText}>₹{amt / 1000}k</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleSaveSettings}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#0F172A" />
            <Text style={styles.saveBtnText}>{t.saveChanges}</Text>
          </TouchableOpacity>
        </View>

        {/* Export Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.exportTitle}</Text>
          <Text style={styles.cardDesc}>{t.exportDesc}</Text>
          <TouchableOpacity style={styles.exportBtn} onPress={handleExportCSV}>
            <Ionicons name="share-social-outline" size={20} color="#0F172A" />
            <Text style={styles.exportBtnText}>{t.shareCsv}</Text>
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={[styles.card, { borderColor: '#7F1D1D' }]}>
          <Text style={[styles.cardTitle, { color: '#FCA5A5' }]}>{t.resetTitle}</Text>
          <Text style={styles.cardDesc}>{t.resetDesc}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="trash-outline" size={18} color="#FCA5A5" />
            <Text style={styles.resetBtnText}>{t.clearAll}</Text>
          </TouchableOpacity>
        </View>
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
  headerSub: { fontSize: 13, color: '#94A3B8', marginTop: 2, marginBottom: 16 },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
    gap: 14,
  },
  bigAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#064E3B',
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: { fontSize: 28 },
  bannerName: { color: '#F8FAFC', fontSize: 18, fontWeight: '800' },
  bannerMeta: { color: '#6EE7B7', fontSize: 12, fontWeight: '600', marginTop: 3 },
  card: {
    backgroundColor: '#0F172A',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  cardTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  cardDesc: { color: '#94A3B8', fontSize: 13, marginBottom: 14, lineHeight: 18 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  langBtn: {
    flex: 1,
    backgroundColor: '#020617',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  langBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  langText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  langTextActive: { color: '#0F172A' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  avatarBtnActive: { borderColor: '#10B981', backgroundColor: '#064E3B' },
  fieldLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: '#020617',
    color: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetChip: {
    flex: 1,
    backgroundColor: '#020617',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  presetText: { color: '#6EE7B7', fontSize: 12, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  exportBtn: {
    flexDirection: 'row',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportBtnText: { color: '#0F172A', fontWeight: '800', fontSize: 14 },
  resetBtn: {
    flexDirection: 'row',
    backgroundColor: '#450A0A',
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetBtnText: { color: '#FCA5A5', fontWeight: '700', fontSize: 14 },
});
