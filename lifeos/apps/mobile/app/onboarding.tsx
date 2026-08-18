import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import {
  fetchOnboarding,
  sendOnboardingMessage,
  type OnboardingState,
} from "@/lib/api";
import { theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";

interface Bubble {
  role: "user" | "assistant";
  text: string;
  emphasis?: boolean;
}

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await fetchOnboarding();
        setState(s);
        const initial: Bubble[] = s.messages.map((m) => ({
          role: m.role,
          text: m.text,
        }));
        if (s.opening) initial.push({ role: "assistant", text: s.opening });
        setBubbles(initial);
        if (s.complete) setFinished(true);
      } catch {
        setBubbles([
          {
            role: "assistant",
            text: "I couldn't reach the server. Check your connection and come back — nothing is lost.",
          },
        ]);
      }
    })();
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    setBubbles((b) => [...b, { role: "user", text }]);
    try {
      const result = await sendOnboardingMessage(text);
      const additions: Bubble[] = [{ role: "assistant", text: result.reply }];
      if (result.crisis) {
        setBubbles((b) => [...b, ...additions]);
        return;
      }
      if (result.chapterComplete && result.nextOpening) {
        additions.push({
          role: "assistant",
          text: `— ${result.nextChapterTitle} —`,
          emphasis: true,
        });
        additions.push({ role: "assistant", text: result.nextOpening });
      }
      if (result.onboardingComplete && result.reveal) {
        additions.push({
          role: "assistant",
          text: result.reveal,
          emphasis: true,
        });
        setFinished(true);
      }
      setBubbles((b) => [...b, ...additions]);
    } catch {
      setBubbles((b) => [
        ...b,
        {
          role: "assistant",
          text: "That didn't reach me — your words weren't lost on your side. Try once more.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  const progress =
    state && !state.complete
      ? `Chapter ${state.chapterIndex + 1} of ${state.chapterCount}`
      : null;

  return (
    <View style={styles.root}>
      <LivingSky mode={skyModeForNow()} />
      <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.header}>
          <Text style={theme.type.label}>
            {progress ?? "Your story"}
          </Text>
          {state && !state.complete && (
            <Text style={[theme.type.title, styles.title]}>
              {state.chapterTitle}
            </Text>
          )}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.flex}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          {bubbles.map((b, i) => (
            <View
              key={i}
              style={[
                styles.bubble,
                b.role === "user" ? styles.userBubble : styles.assistantBubble,
                b.emphasis && styles.emphasisBubble,
              ]}
            >
              <Text
                style={[
                  theme.type.body,
                  b.emphasis && { color: theme.colors.accent },
                ]}
              >
                {b.text}
              </Text>
            </View>
          ))}
          {sending && (
            <ActivityIndicator
              color={theme.colors.textDim}
              style={{ marginTop: theme.spacing(1) }}
            />
          )}
        </ScrollView>

        {finished ? (
          <Pressable style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Begin your evolution</Text>
          </Pressable>
        ) : (
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              multiline
              placeholder="Say it how it is…"
              placeholderTextColor={theme.colors.textDim}
              value={input}
              onChangeText={setInput}
            />
            <Pressable
              style={[styles.send, !input.trim() && { opacity: 0.35 }]}
              onPress={send}
              disabled={!input.trim() || sending}
            >
              <Text style={styles.sendText}>→</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  flex: { flex: 1 },
  header: {
    paddingHorizontal: theme.spacing(3),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(1),
  },
  title: { fontSize: 22, marginTop: 4 },
  messages: { padding: theme.spacing(3), gap: theme.spacing(1.5) },
  bubble: {
    borderRadius: theme.radius.card,
    padding: theme.spacing(2),
    maxWidth: "88%",
  },
  assistantBubble: {
    backgroundColor: theme.colors.surface,
    alignSelf: "flex-start",
  },
  userBubble: {
    backgroundColor: "#1B2330",
    alignSelf: "flex-end",
  },
  emphasisBubble: {
    borderColor: theme.colors.accent,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: theme.spacing(2),
    gap: theme.spacing(1),
  },
  input: {
    flex: 1,
    maxHeight: 120,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(1.5),
    color: theme.colors.text,
    fontSize: 16,
  },
  send: {
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingHorizontal: theme.spacing(2),
    paddingVertical: theme.spacing(1.25),
  },
  sendText: { color: theme.colors.background, fontSize: 18 },
  button: {
    margin: theme.spacing(2),
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.75),
    alignItems: "center",
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
});
