import { Tabs } from "expo-router";
import { Text } from "react-native";
import { theme } from "@/lib/theme";

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontSize: 11,
        letterSpacing: 2,
        textTransform: "uppercase",
        color: focused ? theme.colors.accent : theme.colors.textDim,
      }}
    >
      {label}
    </Text>
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
