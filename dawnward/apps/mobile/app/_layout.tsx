import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
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
import { View } from "react-native";
import { theme } from "@/lib/theme";

export default function RootLayout() {
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
