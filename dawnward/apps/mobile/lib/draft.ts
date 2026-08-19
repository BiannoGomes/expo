import { Platform } from "react-native";
import { File, Paths } from "expo-file-system";

/**
 * The debrief promise is "nothing you said is lost", so a half-written
 * reflection must survive the app being killed mid-thought. One draft,
 * saved as it is typed, cleared only when the words have safely landed.
 */

const WEB_KEY = "dawnward.debrief-draft";

function nativeFile(): File {
  return new File(Paths.document, "debrief-draft.txt");
}

export function loadDraft(): string {
  try {
    if (Platform.OS === "web") {
      return globalThis.localStorage?.getItem(WEB_KEY) ?? "";
    }
    const f = nativeFile();
    return f.exists ? f.textSync() : "";
  } catch {
    return "";
  }
}

export function saveDraft(text: string): void {
  try {
    if (Platform.OS === "web") {
      if (text) globalThis.localStorage?.setItem(WEB_KEY, text);
      else globalThis.localStorage?.removeItem(WEB_KEY);
      return;
    }
    const f = nativeFile();
    if (text) f.write(text);
    else if (f.exists) f.delete();
  } catch {
    // Storage refused (private browsing, full disk): typing still works.
  }
}

export function clearDraft(): void {
  saveDraft("");
}
