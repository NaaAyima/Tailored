import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  CormorantGaramond_400Regular,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  DMSans_300Light,
} from '@expo-google-fonts/dm-sans';
import { useEffect } from 'react';
import { useSession } from '@/lib/auth/use-session';
import useTailoredStore from '@/lib/state/tailored-store';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { data: session, isLoading } = useSession();
  const setProfile = useTailoredStore((s: ReturnType<typeof useTailoredStore.getState>) => s.setProfile);

  useEffect(() => {
    const name = session?.user?.name;
    if (name) {
      setProfile({ userName: name });
    }
  }, [session?.user?.name]);

  if (isLoading) return null;

  const isSignedIn = !!session?.user;
  const hasName = !!session?.user?.name;

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0A0A0A' },
          animation: 'fade',
        }}
      >
        {/* Signed in + has name → main app */}
        <Stack.Protected guard={isSignedIn ? hasName : false}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="profile-setup" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen
            name="fit-analysis"
            options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }}
          />
          <Stack.Screen name="body-scan" options={{ headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="measurements-edit" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="profile-edit" options={{ presentation: 'modal', headerShown: false, animation: 'slide_from_bottom' }} />
          <Stack.Screen name="settings-notifications" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="settings-privacy" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="settings-units" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="settings-about" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="garment-preferences" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="customer-add" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="customer-edit" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="customer-detail" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="customer-add-garment" options={{ headerShown: false, animation: 'slide_from_right' }} />
        </Stack.Protected>

        {/* Signed in but no name → ask for name */}
        <Stack.Protected guard={isSignedIn ? !hasName : false}>
          <Stack.Screen name="enter-name" options={{ headerShown: false, animation: 'fade' }} />
        </Stack.Protected>

        {/* Not signed in → auth flow */}
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name="sign-in" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="verify-otp" options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
        </Stack.Protected>
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold_Italic,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSans_300Light,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootLayoutNav />
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
