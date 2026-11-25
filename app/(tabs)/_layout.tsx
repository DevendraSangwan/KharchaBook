import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { useExpenses } from '../../src/context/ExpenseContext';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useExpenses();

  const bottomPadding = Math.max(insets.bottom, 10);
  const tabBarHeight = 60 + bottomPadding;

  const iconColor = (color: unknown, focused: boolean) =>
    typeof color === 'string' ? color : focused ? COLORS.primary : COLORS.textMuted;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: tabBarHeight,
          paddingBottom: bottomPadding,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabHome,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wallet' : 'wallet-outline'}
              size={22}
              color={iconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="udhaar"
        options={{
          title: t.tabUdhaar,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              size={22}
              color={iconColor(color, focused)}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: t.tabAnalytics,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'pie-chart' : 'pie-chart-outline'}
              size={22}
              color={iconColor(color, focused)}
            />
          ),
        }}
      />
    </Tabs>
  );
}
