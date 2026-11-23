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
import { AppLanguage, TRANSLATIONS } from '../src/utils/i18n';

const AVATARS = ['👩🏻‍💻', '🧑🏻‍🎓', '💼', '🚀', '🌟', '🦁'];
const BUDGET_PRESETS = [3000, 5000, 10000, 20000];

export default function OnboardingScreen() {
  const { saveProfile } = useExpenses();
  const router = useRouter();

  const [lang, setLang] = useState<AppLanguage>('en');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👩🏻‍💻');
  const [budget, setBudget] = useState('5000');

  const t = TRANSLATIONS[lang];

  const handleStart = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name.');
      return;
    }
    const numericBudget = parseFloat(budget);
    if (!numericBudget || numericBudget <= 0) {
      Alert.alert('Required', 'Please enter a valid monthly budget amount (₹).');
      return;
    }

    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    await saveProfile(name, avatar, numericBudget, lang);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.badge}>
            <Ionicons name="wallet" size={28} color="#10B981" />
          </View>
          <Text style={styles.title}>{t.welcomeTitle}</Text>
          <Text style={styles.subtitle}>{t.welcomeSub}</Text>

          {/* Language Selector */}
          <Text style={styles.label}>{t.chooseLang}</Text>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'en' && styles.langBtnActive]}
              onPress={() => setLang('en')}
            >
              <Text style={[styles.langText, lang === 'en' && styles.langTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, lang === 'hi' && styles.langBtnActive]}
              onPress={() => setLang('hi')}
            >
              <Text style={[styles.langText, lang === 'hi' && styles.langTextActive]}>
                हिंदी (Hindi)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Avatar Picker */}
          <Text style={styles.label}>{t.chooseAvatar}</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.avatarBtn, avatar === item && styles.avatarBtnActive]}
                onPress={() => setAvatar(item)}
              >
                <Text style={styles.avatarEmoji}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name Input */}
          <Text style={styles.label}>{t.yourName}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Sama"
            placeholderTextColor="#64748B"
          />

          {/* Monthly Budget Input */}
          <Text style={styles.label}>{t.setBudget}</Text>
          <View style={styles.budgetBox}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor="#64748B"
            />
          </View>

          <View style={styles.presetRow}>
            {BUDGET_PRESETS.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={styles.presetChip}
                onPress={() => setBudget(String(amt))}
              >
                <Text style={styles.presetText}>₹{amt.toLocaleString('en-IN')}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
            <Text style={styles.startBtnText}>{t.startTracking}</Text>
            <Ionicons name="arrow-forward" size={20} color="#0F172A" />
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
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 40 : 16,
  },
  scroll: { paddingBottom: 40 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#064E3B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: '#F8FAFC', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 6, marginBottom: 20, lineHeight: 19 },
  label: { color: '#CBD5E1', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  langBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  langBtnActive: { backgroundColor: '#10B981', borderColor: '#10B981' },
  langText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  langTextActive: { color: '#0F172A' },
  avatarRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  avatarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E293B',
  },
  avatarBtnActive: { borderColor: '#10B981', backgroundColor: '#064E3B' },
  avatarEmoji: { fontSize: 22 },
  input: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 20,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  rupee: { color: '#10B981', fontSize: 22, fontWeight: '800', marginRight: 8 },
  budgetInput: { flex: 1, color: '#F8FAFC', fontSize: 22, fontWeight: '800', paddingVertical: 13 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 26 },
  presetChip: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  presetText: { color: '#6EE7B7', fontSize: 12, fontWeight: '700' },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: { color: '#0F172A', fontSize: 16, fontWeight: '800' },
});
