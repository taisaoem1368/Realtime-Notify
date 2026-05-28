import { useEffect, useRef } from "react";
import { Stack } from "expo-router";
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import * as SplashScreen from "expo-splash-screen";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  registerForPushNotificationsAsync,
  registerTokenWithServer,
} from "@/services/pushNotifications";
import { saveNotificationToFirebase } from "@/services/firebase";
import { playSoundFromUrl } from "@/services/audioPlayer";
import type { Subscription } from "expo-notifications";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        registerTokenWithServer(token);
      }
    });

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const data = notification.request.content.data as {
          id?: string;
          title?: string;
          body?: string;
          soundUrl?: string;
          createdAt?: number;
        };

        if (data.soundUrl) {
          playSoundFromUrl(data.soundUrl);
        }

        saveNotificationToFirebase({
          title: notification.request.content.title ?? data.title ?? "",
          body: notification.request.content.body ?? data.body ?? "",
          soundUrl: data.soundUrl,
          createdAt: data.createdAt ?? Date.now(),
          read: false,
        }).catch(console.warn);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as {
          id?: string;
          title?: string;
          body?: string;
          soundUrl?: string;
          createdAt?: number;
        };
        if (data.title || data.body) {
          saveNotificationToFirebase({
            title: data.title ?? "",
            body: data.body ?? "",
            soundUrl: data.soundUrl,
            createdAt: data.createdAt ?? Date.now(),
            read: false,
          }).catch(console.warn);
        }
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <Stack screenOptions={{ headerShown: false }} />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
