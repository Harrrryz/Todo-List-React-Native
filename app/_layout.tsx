import { client } from '@/client/client.gen';
import { SessionProvider } from '@/components/ctx';
import "@/global.css";
import { authEvents, isTokenExpired } from '@/lib/auth';
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Setup getToken function
  const getToken = React.useCallback(() => {
    let token = '';
    if (Platform.OS === "web") {
      try {
        token = localStorage.getItem("session") || '';
      } catch (e) {
        console.error("Local storage is unavailable:", e);
        return '';
      }
    } else {
      token = SecureStore.getItem("session") || '';
    }

    // Check if token is expired before returning
    if (token && isTokenExpired(token)) {
      console.log('Token expired, triggering sign out');
      // Clear the stored token and emit event
      if (Platform.OS === "web") {
        try {
          localStorage.removeItem("session");
        } catch (e) {
          console.error("Local storage is unavailable:", e);
        }
      } else {
        SecureStore.deleteItemAsync("session");
      }
      // Emit token expired event to trigger sign out in SessionProvider
      authEvents.emitTokenExpired();
      return '';
    }

    return token;
  }, []);

  // Configure API client
  React.useEffect(() => {
    client.setConfig({
      auth: () => getToken(),
      baseURL: process.env.EXPO_PUBLIC_API_BASE_URL || "https://putian-ai-backend-litestar.onrender.com",
    });
  }, [getToken]);

  // Add response interceptor to handle 401 errors
  React.useEffect(() => {
    const interceptorId = client.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Check if the error is a 401 Unauthorized
        if (error.response?.status === 401) {
          console.log('Received 401 Unauthorized, triggering sign out');
          // Clear the stored token
          if (Platform.OS === "web") {
            try {
              localStorage.removeItem("session");
            } catch (e) {
              console.error("Local storage is unavailable:", e);
            }
          } else {
            SecureStore.deleteItemAsync("session");
          }
          // Emit token expired event to trigger sign out
          authEvents.emitTokenExpired();
        }
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      client.instance.interceptors.response.eject(interceptorId);
    };
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SessionProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
          <Slot />
          <PortalHost />
        </ThemeProvider>
      </SessionProvider>
    </GestureHandlerRootView>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;