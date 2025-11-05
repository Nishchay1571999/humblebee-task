import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { NetworkProvider } from '@/context/NetworkProvider';
import { FarmerFormProvider } from '@/forms/Blooming';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: 'form',
};

export default function RootLayout() {

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <NetworkProvider>
          <FarmerFormProvider>
            <ThemeProvider value={DefaultTheme}>
              <Stack screenOptions={{ headerShown: false }} />
              <StatusBar style="auto" />
            </ThemeProvider>
          </FarmerFormProvider>
        </NetworkProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
