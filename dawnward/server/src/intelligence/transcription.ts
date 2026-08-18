/**
 * Speech to text behind an interface, like the Intelligence layer: the app
 * depends on the contract, the vendor stays swappable (docs/voice.md holds
 * the provider research and the decision).
 *
 * Default vendor: ElevenLabs Scribe, chosen for best-in-class accuracy and
 * because one ElevenLabs key later powers the spoken reveals too. Deepgram
 * is the documented cost fallback. Voice audio is transcribed and dropped;
 * only the words become a record, per the privacy posture (spec 04 §5).
 */

export interface Transcription {
  transcribe(audio: Buffer, mimeType: string): Promise<string>;
}

class ElevenLabsScribe implements Transcription {
  async transcribe(audio: Buffer, mimeType: string): Promise<string> {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error("ELEVENLABS_API_KEY is not set");
    }
    const form = new FormData();
    form.append("model_id", "scribe_v1");
    form.append(
      "file",
      new Blob([new Uint8Array(audio)], { type: mimeType }),
      "debrief.m4a",
    );
    const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": key },
      body: form,
    });
    if (!res.ok) {
      throw new Error(`transcription failed: ${res.status}`);
    }
    const data = (await res.json()) as { text?: string };
    return data.text?.trim() ?? "";
  }
}

class MockTranscription implements Transcription {
  async transcribe(): Promise<string> {
    return "Today I kept the promise to myself and did the deep work first.";
  }
}

export const transcription: Transcription =
  process.env.MOCK_INTELLIGENCE === "1"
    ? new MockTranscription()
    : new ElevenLabsScribe();
