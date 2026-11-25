import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { AVATARS, BUDGET_PRESETS, COLORS } from '../src/constants/theme';
import { useExpenses } from '../src/context/ExpenseContext';
import { showAlert, triggerHaptic } from '../src/utils/feedback';
import { AppLanguage, TRANSLATIONS } from '../src/utils/i18n';

export default function OnboardingScreen() {
  const { saveProfile } = useExpenses();
  const router = useRouter();

  const [lang, setLang] = useState<AppLanguage>('en');
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string>('👩🏻‍💻');
  const [budget, setBudget] = useState('5000');

  const t = TRANSLATIONS[lang];

  const handleStart = async () => {
    if (!name.trim()) {
      showAlert(t.requiredTitle, t.nameRequiredMsg);
      return;
    }
    const numericBudget = parseFloat(budget);
    if (!numericBudget || numericBudget <= 0) {
      showAlert(t.requiredTitle, t.budgetRequiredMsg);
      return;
    }

    triggerHaptic('success');
    await saveProfile(name, avatar, numericBudget, lang);
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.badge}>
            <Ionicons name="wallet" size={28} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>{t.welcomeTitle}</Text>
          <Text style={styles.subtitle}>{t.welcomeSub}</Text>

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

          <Text style={styles.label}>{t.yourName}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t.namePlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />

          <Text style={styles.label}>{t.setBudget}</Text>
          <View style={styles.budgetBox}>
            <Text style={styles.rupee}>₹</Text>
            <TextInput
              style={styles.budgetInput}
              value={budget}
              onChangeText={setBudget}
              keyboardType="numeric"
              placeholder="5000"
              placeholderTextColor={COLORS.textSubtle}
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
            <Ionicons name="arrow-forward" size={20} color={COLORS.primaryText} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingHorizontal: 22,
  },
  scroll: { paddingTop: 18, paddingBottom: 40 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 26, fontWeight: '800', color: COLORS.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 6, marginBottom: 20, lineHeight: 19 },
  label: { color: COLORS.textSecondary, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  langBtn: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
  langTextActive: { color: COLORS.primaryText },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  avatarBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatarBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDark },
  avatarEmoji: { fontSize: 20 },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  budgetBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  rupee: { color: COLORS.primary, fontSize: 22, fontWeight: '800', marginRight: 8 },
  budgetInput: { flex: 1, color: COLORS.text, fontSize: 22, fontWeight: '800', paddingVertical: 13 },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 26 },
  presetChip: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '700' },
  startBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startBtnText: { color: COLORS.primaryText, fontSize: 16, fontWeight: '800' },
});
