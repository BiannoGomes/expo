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
import { Switch } from "react-native";
import {
  fetchMe,
  fetchOnboarding,
  giveConsent,
  sendOnboardingMessage,
  updateMe,
  type OnboardingState,
} from "@/lib/api";
import { fonts, theme } from "@/lib/theme";
import { LivingSky, skyModeForNow } from "@/lib/sky";

interface Bubble {
  role: "user" | "assistant";
  text: string;
  emphasis?: boolean;
}

/** Unbundled Article-9 consent (spec 04 §3) — the door into the story. */
function ConsentStep({ onDone }: { onDone: (challenge: boolean) => void }) {
  const [challenge, setChallenge] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  async function begin() {
    setSaving(true);
    try {
      await giveConsent(true, challenge);
      const trimmed = name.trim().slice(0, 40);
      if (trimmed) {
        // A missing name never blocks the door; it can be set later too.
        await updateMe({ preferredName: trimmed }).catch(() => {});
      }
      onDone(challenge);
    } catch {
      setSaving(false);
    }
  }
  return (
    <ScrollView contentContainerStyle={consentStyles.wrap}>
      <Text style={theme.type.label}>Before your story begins</Text>
      <Text style={[theme.type.title, consentStyles.title]}>
        What you share stays yours
      </Text>
      <Text style={theme.type.body}>
        Your reflections will hold real things: fears, health, people you
        love. Everything is held privately, cites its evidence, can be
        corrected by you, and can be erased completely at any time. Nothing is
        sold, and nothing trains anyone else's model.
      </Text>
      <Text style={[theme.type.dim, consentStyles.legal]}>
        By continuing you agree that Dawnward may work with what you choose
        to share, including sensitive things, for one purpose only: building
        your own Personal Model. You can withdraw this any time in Settings.
      </Text>
      <View style={consentStyles.nameBlock}>
        <Text style={theme.type.body}>And what should I call you?</Text>
        <TextInput
          style={consentStyles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Your name, or skip this"
          placeholderTextColor={theme.colors.faint}
          autoCapitalize="words"
          autoComplete="name"
        />
      </View>
      <View style={consentStyles.optRow}>
        <View style={{ flex: 1, paddingRight: 16 }}>
          <Text style={theme.type.body}>May I challenge you?</Text>
          <Text style={theme.type.dim}>
            When I see a contradiction between what you say and what you do,
            I can name it. Honest, never harsh. You can turn this off anytime.
          </Text>
        </View>
        <Switch
          value={challenge}
          onValueChange={setChallenge}
          trackColor={{ false: theme.colors.line, true: theme.colors.gold }}
          thumbColor={theme.colors.ink}
        />
      </View>
      <Pressable
        style={[consentStyles.begin, saving && { opacity: 0.5 }]}
        onPress={begin}
        disabled={saving}
      >
        <Text style={consentStyles.beginText}>I understand. Begin</Text>
      </Pressable>
    </ScrollView>
  );
}

export default function OnboardingScreen() {
  const [state, setState] = useState<OnboardingState | null>(null);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finished, setFinished] = useState(false);
  const [consented, setConsented] = useState<boolean | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await fetchMe();
        setConsented(Boolean(me.consent.reflections?.granted));
      } catch {
        setConsented(true); // offline: don't wall the demo; server still gates
      }
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
            text: "I couldn't reach the server. Come back when you're connected. Nothing is lost.",
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
          text: `${result.nextChapterTitle}`,
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
          text: "That didn't reach me, but nothing you wrote is lost. Try once more.",
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

  if (consented === false) {
    return (
      <View style={styles.root}>
        <LivingSky mode={skyModeForNow()} />
        <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
          <ConsentStep onDone={() => setConsented(true)} />
        </SafeAreaView>
      </View>
    );
  }

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
          <Pressable style={styles.button} onPress={() => router.replace("/")}>
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

const consentStyles = StyleSheet.create({
  wrap: { padding: theme.spacing(3), gap: theme.spacing(2) },
  title: { marginBottom: theme.spacing(0.5) },
  legal: { fontStyle: "italic" },
  nameBlock: { gap: theme.spacing(1) },
  nameInput: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: theme.colors.ink,
    backgroundColor: theme.colors.raised,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: theme.spacing(1.5),
    paddingVertical: theme.spacing(1.25),
  },
  optRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2.5),
  },
  begin: {
    marginTop: theme.spacing(1),
    backgroundColor: theme.colors.gold,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.75),
    alignItems: "center",
  },
  beginText: {
    color: theme.colors.ground,
    fontSize: 12,
    letterSpacing: 12 * 0.22,
    textTransform: "uppercase",
  },
});
