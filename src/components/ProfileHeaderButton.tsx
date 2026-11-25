import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../constants/theme';
import { useExpenses } from '../context/ExpenseContext';

/**
 * Compact top-right profile avatar button that opens the Profile screen,
 * matching standard mobile app header navigation.
 */
export function ProfileHeaderButton() {
  const { profile, t } = useExpenses();
  const router = useRouter();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={() => router.push('/profile')}
      activeOpacity={0.82}
      accessibilityRole="button"
      accessibilityLabel={t.tabProfile}
      hitSlop={8}
    >
      <Text style={styles.avatar}>{profile.avatar || '👩🏻‍💻'}</Text>
      <View style={styles.badge}>
        <Ionicons name="settings-sharp" size={9} color={COLORS.primaryText} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryDark,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 21,
  },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
