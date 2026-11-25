import React, { useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  Share,
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
import { CATEGORIES } from '../src/types/expense';
import { ENABLE_SAMPLE_DATA } from '../src/utils/demoSeed';
import { showAlert, showConfirm, triggerHaptic } from '../src/utils/feedback';
import { formatINR } from '../src/utils/format';
import { AppLanguage } from '../src/utils/i18n';

function sanitizeCsvField(val: string): string {
  const cleaned = val.replace(/"/g, '""');
  return `"${cleaned}"`;
}

async function shareOrDownloadText(filename: string, title: string, content: string, mimeType: string) {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return;
  }

  await Share.share({
    title,
    message: content,
  });
}

export default function ProfileScreen() {
  const router = useRouter();
  const {
    monthlyBudget,
    currentMonthTotal,
    profile,
    t,
    saveProfile,
    expenses,
    udhaarList,
    hasLoadedDemo,
    loadDemoData,
    importBackup,
    clearAllData,
  } = useExpenses();

  const [nameInput, setNameInput] = useState(profile.name || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '👩🏻‍💻');
  const [selectedLang, setSelectedLang] = useState<AppLanguage>(profile.language || 'en');
  const [budgetInput, setBudgetInput] = useState(String(monthlyBudget));
  const [backupInput, setBackupInput] = useState('');
  const [showRestoreBox, setShowRestoreBox] = useState(false);

  useEffect(() => {
    setNameInput(profile.name);
    setSelectedAvatar(profile.avatar);
    setSelectedLang(profile.language || 'en');
    setBudgetInput(String(monthlyBudget));
  }, [profile, monthlyBudget]);

  const handleSaveSettings = async () => {
    const val = parseFloat(budgetInput);
    if (!val || val <= 0) {
      showAlert(t.invalidAmountTitle, t.invalidBudgetMsg);
      return;
    }
    await saveProfile(nameInput, selectedAvatar, val, selectedLang);
    triggerHaptic('success');
    showAlert(t.savedTitle, t.profileSavedMsg);
  };

  const handleExportExpensesCSV = async () => {
    if (expenses.length === 0) {
      showAlert(t.errorTitle, t.noExportDataMsg);
      return;
    }

    const header = 'Date,Category,Note,Payment Mode,Amount (INR)\n';
    const rows = expenses
      .map((e) => {
        const dateStr = new Date(e.date).toLocaleDateString('en-IN');
        const catName = CATEGORIES[e.category]?.label || e.category;
        return [
          sanitizeCsvField(dateStr),
          sanitizeCsvField(catName),
          sanitizeCsvField(e.note || '-'),
          sanitizeCsvField(e.paymentMode),
          e.amount,
        ].join(',');
      })
      .join('\n');

    try {
      await shareOrDownloadText(
        'kharchabook-expenses.csv',
        'KharchaBook Expense Report',
        header + rows,
        'text/csv;charset=utf-8;'
      );
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportUdhaarCSV = async () => {
    if (udhaarList.length === 0) {
      showAlert(t.errorTitle, t.noUdhaarExportMsg);
      return;
    }

    const header = 'Date,Person,Type,Note,Amount (INR),Settled\n';
    const rows = udhaarList
      .map((u) => {
        const dateStr = new Date(u.date).toLocaleDateString('en-IN');
        return [
          sanitizeCsvField(dateStr),
          sanitizeCsvField(u.person),
          sanitizeCsvField(u.type),
          sanitizeCsvField(u.note || '-'),
          u.amount,
          u.settled ? 'Yes' : 'No',
        ].join(',');
      })
      .join('\n');

    try {
      await shareOrDownloadText(
        'kharchabook-udhaar.csv',
        'KharchaBook Udhaar Report',
        header + rows,
        'text/csv;charset=utf-8;'
      );
    } catch (error) {
      console.error('Udhaar export failed:', error);
    }
  };

  const handleExportJSON = async () => {
    const payload = JSON.stringify(
      {
        app: 'KharchaBook',
        version: 1,
        exportedAt: new Date().toISOString(),
        monthlyBudget,
        expenses,
        udhaarList,
      },
      null,
      2
    );

    try {
      await shareOrDownloadText(
        'kharchabook-backup.json',
        'KharchaBook Full Backup',
        payload,
        'application/json'
      );
    } catch (error) {
      console.error('JSON backup failed:', error);
    }
  };

  const handleRestoreJSON = async () => {
    const ok = await importBackup(backupInput.trim());
    if (!ok) {
      showAlert(t.errorTitle, t.restoreErrorMsg);
      return;
    }
    triggerHaptic('success');
    setBackupInput('');
    setShowRestoreBox(false);
    showAlert(t.savedTitle, t.restoreSuccessMsg);
  };

  const handleLoadDemo = async () => {
    const added = await loadDemoData();
    if (!added) {
      showAlert(t.demoTitle, t.demoAlreadyLoadedMsg);
      return;
    }
    triggerHaptic('success');
    showAlert(t.savedTitle, t.demoLoadedMsg);
  };

  const handleReset = () => {
    showConfirm(
      t.resetConfirmTitle,
      t.resetConfirmMsg,
      t.cancel,
      t.delete,
      async () => {
        await clearAllData();
        showAlert(t.savedTitle, t.resetDoneMsg);
      }
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.8}
          hitSlop={8}
        >
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>{t.profileTitle}</Text>
          <Text style={styles.headerSub}>{t.profileSub}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Top User Identity Banner */}
        <View style={styles.profileBanner}>
          <View style={styles.bigAvatarCircle}>
            <Text style={styles.bigAvatarText}>{profile.avatar || '👩🏻‍💻'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerName}>{profile.name || t.userFallback}</Text>
            <Text style={styles.bannerMeta}>
              {t.budgetLabel} {formatINR(monthlyBudget)} • {formatINR(currentMonthTotal)}
            </Text>
          </View>
        </View>

        {/* Edit Profile & Budget Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.editProfileCard}</Text>

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
                <Text style={{ fontSize: 18 }}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>{t.yourName}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 14 }]}
            value={nameInput}
            onChangeText={setNameInput}
            placeholder={t.namePlaceholder}
            placeholderTextColor={COLORS.textSubtle}
          />

          <Text style={styles.fieldLabel}>{t.monthlyLimitLabel}</Text>
          <TextInput
            style={[styles.input, { marginBottom: 10 }]}
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="numeric"
            placeholder="10000"
            placeholderTextColor={COLORS.textSubtle}
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
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.primaryText} />
            <Text style={styles.saveBtnText}>{t.saveChanges}</Text>
          </TouchableOpacity>
        </View>

        {/* Export & Backup Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t.exportTitle}</Text>
          <Text style={styles.cardDesc}>{t.exportDesc}</Text>
          <View style={{ gap: 10 }}>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExportExpensesCSV}>
              <Ionicons name="share-social-outline" size={19} color={COLORS.primaryText} />
              <Text style={styles.exportBtnText}>{t.shareCsv}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportUdhaarCSV}>
              <Ionicons name="people-outline" size={18} color={COLORS.info} />
              <Text style={styles.secondaryBtnText}>{t.shareUdhaarCsv}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleExportJSON}>
              <Ionicons name="cloud-download-outline" size={18} color={COLORS.primaryLight} />
              <Text style={[styles.secondaryBtnText, { color: COLORS.primaryLight }]}>
                {t.exportJsonBackup}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => setShowRestoreBox((prev) => !prev)}
            >
              <Ionicons name="cloud-upload-outline" size={18} color={COLORS.textSecondary} />
              <Text style={[styles.secondaryBtnText, { color: COLORS.textSecondary }]}>
                {t.importJsonBackup}
              </Text>
            </TouchableOpacity>

            {showRestoreBox ? (
              <View style={styles.restoreBox}>
                <TextInput
                  style={styles.restoreInput}
                  value={backupInput}
                  onChangeText={setBackupInput}
                  placeholder={t.pasteBackupPlaceholder}
                  placeholderTextColor={COLORS.textSubtle}
                  multiline
                />
                <TouchableOpacity style={styles.saveBtn} onPress={handleRestoreJSON}>
                  <Text style={styles.saveBtnText}>{t.restoreBtn}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        </View>

        {/* Sample Data (controlled by ENABLE_SAMPLE_DATA in src/utils/demoSeed.ts) */}
        {ENABLE_SAMPLE_DATA ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.demoTitle}</Text>
            <Text style={styles.cardDesc}>{t.demoDesc}</Text>
            <TouchableOpacity
              style={[styles.secondaryBtn, hasLoadedDemo && { opacity: 0.6 }]}
              onPress={handleLoadDemo}
              disabled={hasLoadedDemo}
            >
              <Ionicons
                name={hasLoadedDemo ? 'checkmark-circle-outline' : 'sparkles-outline'}
                size={18}
                color={hasLoadedDemo ? COLORS.primaryLight : COLORS.warning}
              />
              <Text
                style={[
                  styles.secondaryBtnText,
                  { color: hasLoadedDemo ? COLORS.primaryLight : COLORS.warning },
                ]}
              >
                {hasLoadedDemo ? t.demoAlreadyLoadedBtn : t.loadDemoBtn}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Danger Zone */}
        <View style={[styles.card, { borderColor: COLORS.dangerBorder }]}>
          <Text style={[styles.cardTitle, { color: COLORS.dangerText }]}>{t.resetTitle}</Text>
          <Text style={styles.cardDesc}>{t.resetDesc}</Text>
          <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
            <Ionicons name="trash-outline" size={18} color={COLORS.dangerText} />
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
    backgroundColor: COLORS.bg,
    paddingHorizontal: 18,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    gap: 14,
  },
  bigAvatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigAvatarText: { fontSize: 28 },
  bannerName: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  bannerMeta: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '600', marginTop: 3 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 10 },
  cardDesc: { color: COLORS.textMuted, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  langRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  langBtn: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  langBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  langText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '700' },
  langTextActive: { color: COLORS.primaryText },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  avatarBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryDark },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 6 },
  input: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  presetChip: {
    flex: 1,
    backgroundColor: COLORS.bg,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  presetText: { color: COLORS.primaryLight, fontSize: 12, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnText: { color: COLORS.primaryText, fontWeight: '800', fontSize: 14 },
  exportBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.info,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  exportBtnText: { color: COLORS.primaryText, fontWeight: '800', fontSize: 14 },
  secondaryBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.bg,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryBtnText: { color: COLORS.info, fontWeight: '700', fontSize: 13 },
  restoreBox: { gap: 10, marginTop: 4 },
  restoreInput: {
    backgroundColor: COLORS.bg,
    color: COLORS.text,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 90,
    fontSize: 12,
    textAlignVertical: 'top',
  },
  resetBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.dangerBg,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resetBtnText: { color: COLORS.dangerText, fontWeight: '700', fontSize: 14 },
});
