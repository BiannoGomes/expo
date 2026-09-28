import { Tabs } from "expo-router";
import { Text, View } from "react-native";
import { fonts, theme } from "@/lib/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={{ alignItems: "center", gap: 5 }}>
      <Text
        style={{
          fontFamily: fonts.label,
          fontSize: 10,
          letterSpacing: 10 * 0.22,
          textTransform: "uppercase",
          color: focused ? theme.colors.gold : theme.colors.faint,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          width: 3,
          height: 3,
          borderRadius: 1.5,
          backgroundColor: focused ? theme.colors.gold : "transparent",
        }}
      />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIconStyle: { display: "none" },
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.line,
          height: 64,
          paddingTop: 14,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Today" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="debrief"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Debrief" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="you"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="You" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
