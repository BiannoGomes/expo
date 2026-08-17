import { useState } from "react";
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
import { submitDebrief, today } from "@/lib/api";
import { theme } from "@/lib/theme";

export default function DebriefScreen() {
  const [text, setText] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const result = await submitDebrief(today(), text.trim());
      setReply(result.reply);
      setText("");
    } catch {
      setReply(
        "I couldn't reach the server — nothing was lost. Try again when you're connected.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={theme.type.label}>Evening debrief</Text>
          <Text style={[theme.type.title, styles.title]}>What happened?</Text>
          <Text style={theme.type.dim}>
            Talk naturally. Achievements, decisions, feelings, failures — all
            of it is useful. Skipping tonight is also fine.
          </Text>

          <TextInput
            style={styles.input}
            multiline
            placeholder="Today I…"
            placeholderTextColor={theme.colors.textDim}
            value={text}
            onChangeText={setText}
          />

          <Pressable
            style={[styles.button, !text.trim() && styles.buttonDisabled]}
            onPress={send}
            disabled={!text.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator color={theme.colors.background} />
            ) : (
              <Text style={styles.buttonText}>Reflect</Text>
            )}
          </Pressable>

          {reply && (
            <View style={styles.reply}>
              <Text style={theme.type.label}>Today's evolution</Text>
              <Text style={[theme.type.body, styles.replyText]}>{reply}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  flex: { flex: 1 },
  content: { padding: theme.spacing(3), paddingBottom: theme.spacing(6) },
  title: { marginTop: theme.spacing(1), marginBottom: theme.spacing(1.5) },
  input: {
    marginTop: theme.spacing(3),
    minHeight: 160,
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.line,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: theme.spacing(2),
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  button: {
    marginTop: theme.spacing(2),
    backgroundColor: theme.colors.accent,
    borderRadius: 12,
    paddingVertical: theme.spacing(1.75),
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.35 },
  buttonText: {
    color: theme.colors.background,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  reply: {
    marginTop: theme.spacing(4),
    paddingTop: theme.spacing(3),
    borderTopColor: theme.colors.line,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  replyText: { marginTop: theme.spacing(1) },
});
