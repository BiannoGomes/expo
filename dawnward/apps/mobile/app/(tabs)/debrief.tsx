import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
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
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from "expo-audio";
import { File } from "expo-file-system";
import { fetchMe, fetchPlan, submitDebrief, today, transcribe } from "@/lib/api";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draft";
import { fonts, theme } from "@/lib/theme";
import { LivingSky } from "@/lib/sky";
import { Press } from "@/lib/motion";

/** Read the finished recording back as base64, wherever it landed. */
async function recordingToBase64(uri: string): Promise<string> {
  if (Platform.OS === "web") {
    const blob = await (await fetch(uri)).blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onloadend = () => {
        const dataUrl = String(reader.result ?? "");
        resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
      };
      reader.readAsDataURL(blob);
    });
  }
  return new File(uri).base64();
}

/** A quiet gold pulse that only exists while Dawnward is listening. */
function ListeningDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  return (
    <Animated.View
      style={[
        styles.listeningDot,
        { opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }) },
      ]}
    />
  );
}

export default function DebriefScreen() {
  const [text, setText] = useState("");
  const [question, setQuestion] = useState<string | null>(null);
  const [reply, setReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [focused, setFocused] = useState(false);

  // The morning asked one question; the evening answers it. And a
  // half-written reflection survives the app being closed mid-thought.
  useEffect(() => {
    const draft = loadDraft();
    if (draft) setText(draft);
    fetchMe()
      .then((me) => {
        // Never generate a plan for someone whose story hasn't begun.
        if (!me.onboardingComplete) return;
        return fetchPlan(today()).then(
          (plan) => plan.question && setQuestion(plan.question),
        );
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    const id = setTimeout(() => saveDraft(text), 400);
    return () => clearTimeout(id);
  }, [text]);
  const [voiceState, setVoiceState] = useState<
    "idle" | "recording" | "transcribing"
  >("idle");
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const result = await submitDebrief(today(), text.trim());
      setReply(result.reply);
      setText("");
      clearDraft();
    } catch {
      setReply(
        "I couldn't reach the server just now. Nothing was lost. Try again in a moment.",
      );
    } finally {
      setSending(false);
    }
  }

  async function startListening() {
    setVoiceNote(null);
    try {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        setVoiceNote("The microphone stays off until you allow it. Typing works too.");
        return;
      }
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      await recorder.prepareToRecordAsync();
      recorder.record();
      setVoiceState("recording");
    } catch {
      setVoiceNote("I couldn't start listening on this device. Typing still works.");
      setVoiceState("idle");
    }
  }

  async function finishListening() {
    setVoiceState("transcribing");
    try {
      await recorder.stop();
      await setAudioModeAsync({ allowsRecording: false });
      const uri = recorder.uri;
      if (!uri) throw new Error("no recording");
      const base64 = await recordingToBase64(uri);
      const mimeType = Platform.OS === "web" ? "audio/webm" : "audio/m4a";
      const words = await transcribe(base64, mimeType);
      if (words.trim()) {
        setText((t) => (t.trim() ? `${t.trim()} ${words.trim()}` : words.trim()));
      } else {
        setVoiceNote("I didn't catch any words in that. Try again, or type it.");
      }
    } catch {
      setVoiceNote("I couldn't hear that just now. Typing still works.");
    } finally {
      setVoiceState("idle");
    }
  }

  return (
    <View style={styles.root}>
      <LivingSky mode="dusk" />
      <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={theme.type.label}>Evening debrief</Text>
          <Text style={[theme.type.title, styles.title]}>What happened?</Text>
          <Text style={theme.type.dim}>
            {question ?? "Say it how it was. Skipping tonight is fine too."}
          </Text>

          <TextInput
            style={[styles.input, focused && styles.inputFocused]}
            multiline
            placeholder="Today I…"
            placeholderTextColor={theme.colors.textDim}
            value={text}
            onChangeText={setText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />

          <View style={styles.voiceRow}>
            {voiceState === "idle" && (
              <Pressable
                onPress={startListening}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Speak your debrief instead of typing"
              >
                <Text style={styles.voiceAction}>Speak it instead</Text>
              </Pressable>
            )}
            {voiceState === "recording" && (
              <Pressable
                onPress={finishListening}
                hitSlop={8}
                style={styles.listeningRow}
                accessibilityRole="button"
                accessibilityLabel="Finish speaking"
              >
                <ListeningDot />
                <Text style={styles.voiceListening}>
                  Listening. Tap when you're done.
                </Text>
              </Pressable>
            )}
            {voiceState === "transcribing" && (
              <View style={styles.listeningRow}>
                <ActivityIndicator size="small" color={theme.colors.accent} />
                <Text style={styles.voiceListening}>Writing your words down…</Text>
              </View>
            )}
          </View>
          {voiceNote && (
            <Text style={[theme.type.dim, styles.voiceNote]}>{voiceNote}</Text>
          )}

          <Press
            style={[styles.button, !text.trim() && styles.buttonDisabled]}
            onPress={send}
            disabled={!text.trim() || sending}
            accessibilityLabel="Send tonight's reflection"
          >
            {sending ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.buttonText}>Reflect</Text>
            )}
          </Press>

          {reply && (
            <View style={styles.reply}>
              <Text style={theme.type.label}>Today's evolution</Text>
              <Text style={[theme.type.body, styles.replyText]}>{reply}</Text>
              <Text style={[theme.type.dim, styles.goodnight]}>
                That's the day, witnessed. Sleep well. Tomorrow starts from
                here.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.colors.ground },
  screen: { flex: 1 },
  flex: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  input: {
    marginTop: theme.spacing(3),
    minHeight: 160,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.card,
    padding: theme.spacing(2),
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  inputFocused: { borderColor: theme.colors.accent, borderWidth: 1 },
  voiceRow: {
    marginTop: theme.spacing(1.5),
    minHeight: 24,
    alignItems: "flex-start",
  },
  voiceAction: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    color: theme.colors.accent,
  },
  listeningRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  listeningDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
  },
  voiceListening: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: theme.colors.text,
  },
  voiceNote: { marginTop: theme.spacing(1) },
  button: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.75),
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: {
    fontFamily: fonts.labelMedium,
    color: theme.colors.ground,
    fontSize: 12,
    letterSpacing: 12 * 0.22,
    textTransform: "uppercase",
  },
  reply: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(3),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyText: { marginTop: theme.spacing(1) },
  goodnight: { marginTop: theme.spacing(2), fontStyle: "italic" },
});
