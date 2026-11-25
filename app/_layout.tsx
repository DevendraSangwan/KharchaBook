import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ExpenseProvider, useExpenses } from '../src/context/ExpenseContext';

function RootNavigator() {
  const { profile, isLoading } = useExpenses();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const onOnboarding = segments[0] === 'onboarding';
    if (!profile.hasOnboarded && !onOnboarding) {
      router.replace('/onboarding');
    }
  }, [profile.hasOnboarded, isLoading, segments]);

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ExpenseProvider>
        <RootNavigator />
      </ExpenseProvider>
    </SafeAreaProvider>
  );
}
