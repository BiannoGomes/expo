import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Me } from "@/lib/api";

/**
 * Presence (spec 03 §5): Dawnward reaches out exactly twice a day, at the
 * user's chosen times, and never otherwise. Both notifications are local:
 * nothing about the user leaves the device to make them happen.
 */

const MORNING = {
  title: "Good morning.",
  body: "Your plan is ready when you are.",
};
const EVENING = {
  title: "How was today?",
  body: "When you're ready, tell me about it.",
};

function parseTime(value: string): { hour: number; minute: number } | null {
  const m = value.match(/^(\d{2}):(\d{2})$/);
  if (!m) return null;
  return { hour: Number(m[1]), minute: Number(m[2]) };
}

/**
 * Bring the scheduled notifications in line with the chosen touchpoints.
 * With `ask` false this never prompts: no permission yet means no presence
 * yet, quietly. Settings passes `ask: true` because there the user is
 * actively choosing their times.
 */
export async function syncPresence(
  touchpoints: Me["touchpoints"],
  { ask = false }: { ask?: boolean } = {},
): Promise<void> {
  if (Platform.OS === "web") return;

  let { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  if (!granted && ask && canAskAgain) {
    ({ granted } = await Notifications.requestPermissionsAsync());
  }
  if (!granted) return;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("presence", {
      name: "Daily presence",
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: undefined,
      sound: undefined,
    });
  }

  await Notifications.cancelAllScheduledNotificationsAsync();

  const morning = parseTime(touchpoints.morning);
  const evening = parseTime(touchpoints.evening);
  const daily = (hour: number, minute: number) =>
    ({
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      ...(Platform.OS === "android" ? { channelId: "presence" } : {}),
    }) as Notifications.DailyTriggerInput;

  if (morning) {
    await Notifications.scheduleNotificationAsync({
      content: MORNING,
      trigger: daily(morning.hour, morning.minute),
    });
  }
  if (evening) {
    await Notifications.scheduleNotificationAsync({
      content: EVENING,
      trigger: daily(evening.hour, evening.minute),
    });
  }
}
