import { AccessibilityInfo, Platform } from "react-native";

/**
 * Speak a status change to screen-reader users. accessibilityLiveRegion only
 * exists on Android, so iOS always needs an explicit announcement. Pass
 * `android: true` where the text has no live region of its own; on the web
 * the element's aria-live does the work.
 */
export function announce(message: string | null | undefined, opts: { android?: boolean } = {}) {
  if (!message) return;
  if (Platform.OS === "ios" || (Platform.OS === "android" && opts.android)) {
    AccessibilityInfo.announceForAccessibility(message);
  }
}
