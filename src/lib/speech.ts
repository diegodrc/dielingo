import { useSyncExternalStore } from 'react';

// Text-to-speech through the browser's Web Speech API. No audio files needed:
// any Chinese text in a config can be read aloud.

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

let voices: SpeechSynthesisVoice[] = [];
const listeners = new Set<() => void>();

function loadVoices() {
  voices = window.speechSynthesis.getVoices();
  listeners.forEach((listener) => listener());
}

if (supported) {
  loadVoices();
  // Chrome fills the voice list asynchronously.
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

function chineseVoice(): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => /^zh[-_]CN/i.test(v.lang)) ?? voices.find((v) => /^zh/i.test(v.lang))
  );
}

export interface SpeakOptions {
  /** Turtle mode. */
  slow?: boolean;
  /** Base rate, 0.1–2. Default 0.9. */
  rate?: number;
}

export function speak(text: string, { slow = false, rate = 0.9 }: SpeakOptions = {}): void {
  if (!supported || !text) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  const voice = chineseVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = slow ? rate * 0.55 : rate;
  window.speechSynthesis.speak(utterance);
}

export type VoiceStatus = 'ok' | 'missing' | 'loading' | 'unsupported';

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Whether this browser can read Chinese aloud, to warn the learner when it can't. */
export function useVoiceStatus(): VoiceStatus {
  const list = useSyncExternalStore(
    subscribe,
    () => voices,
    () => voices,
  );
  if (!supported) return 'unsupported';
  if (list.length === 0) return 'loading';
  return chineseVoice() ? 'ok' : 'missing';
}
