import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import 'react-native-reanimated';
import { SesionProvider, useSesion } from '@/context/session';

export const unstable_settings = { anchor: '(tabs)' };

/**
 * Inner layout — uses sessionKey as a React key on the Stack.
 * Each time logout() increments sessionKey, the entire navigator
 * unmounts and remounts → clears all cached screens, tab state and
 * any stale component state across all tabs.
 */
function InnerLayout() {
  const { sessionKey } = useSesion();

  return (
    <Stack key={sessionKey} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)"   options={{ headerShown: false }} />
      <Stack.Screen
        name="modules"
        options={{ headerShown: false, animation: Platform.OS === 'ios' ? 'default' : 'fade' }}
      />
      <Stack.Screen
        name="reservar"
        options={{ headerShown: false, animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'fade' }}
      />
      <Stack.Screen name="lealtad"     options={{ headerShown: false, animation: Platform.OS === 'ios' ? 'default' : 'fade' }} />
      <Stack.Screen name="historial"   options={{ headerShown: false, animation: Platform.OS === 'ios' ? 'default' : 'fade' }} />
      <Stack.Screen name="cancelacion" options={{ headerShown: false, animation: Platform.OS === 'ios' ? 'default' : 'fade' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SesionProvider>
      <InnerLayout />
      <StatusBar style="light" />
    </SesionProvider>
  );
}
