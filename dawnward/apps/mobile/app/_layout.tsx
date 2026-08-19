import { useEffect } from "react";
import { router, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { listenForPresenceTaps } from "@/lib/presence";
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_500Medium,
} from "@expo-google-fonts/cormorant-garamond";
import {
  AlbertSans_400Regular,
  AlbertSans_500Medium,
} from "@expo-google-fonts/albert-sans";
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from "@expo-google-fonts/ibm-plex-mono";
import { Pressable, Text, View } from "react-native";
import type { ErrorBoundaryProps } from "expo-router";
import { fonts, theme } from "@/lib/theme";

/**
 * If something breaks, the room stays calm: no red screens, no stack traces,
 * one honest sentence and a way back.
 */
export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.colors.ground,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        gap: 16,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: 28,
          color: theme.colors.ink,
          textAlign: "center",
        }}
      >
        Something slipped.
      </Text>
      <Text
        style={{
          fontFamily: fonts.body,
          fontSize: 16,
          lineHeight: 24,
          color: theme.colors.dim,
          textAlign: "center",
        }}
      >
        Not your fault, and nothing of yours was lost. Let's pick it back up.
      </Text>
      <Pressable onPress={retry} hitSlop={12}>
        <Text
          style={{
            fontFamily: fonts.bodyMedium,
            fontSize: 16,
            color: theme.colors.gold,
            paddingTop: 8,
          }}
        >
          Try again
        </Text>
      </Pressable>
    </View>
  );
}

export default function RootLayout() {
  useEffect(
    () => listenForPresenceTaps((path) => router.navigate(path as never)),
    [],
  );
  const [loaded] = useFonts({
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_500Medium,
    AlbertSans_400Regular,
    AlbertSans_500Medium,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  if (!loaded) {
    // The room stays dark while it dresses — never a white flash.
    return <View style={{ flex: 1, backgroundColor: theme.colors.ground }} />;
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.ground },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ presentation: "modal" }} />
        <Stack.Screen name="campaign" options={{ presentation: "modal" }} />
        <Stack.Screen name="settings" options={{ presentation: "modal" }} />
      </Stack>
    </>
  );
}
