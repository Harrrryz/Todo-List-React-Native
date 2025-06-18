import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import 'react-native-reanimated';

import { client } from '@/client/client.gen';
import { SessionProvider } from '@/components/ctx';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  const getToken = () => {
    return localStorage.getItem("token") || '';
  };

  client.setConfig({
    auth: () => getToken(),
    baseURL: "http://127.0.0.1:8089",
  });

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Slot />
      </ThemeProvider>
    </SessionProvider>
  );
}
