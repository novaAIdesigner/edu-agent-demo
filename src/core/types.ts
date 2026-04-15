// Shared types for the EduVoice AI platform

export type ScenarioId = 'bilingual-tutor' | 'fsi-drill' | 'ielts-sim' | 'free-conversation';

export interface ScenarioConfig {
  id: ScenarioId;
  instructions: string;
  voice: string;
  enablePA: boolean;
  paWithReferenceText: boolean;
  silenceTimeoutMs: number;
}

export interface VoiceEngineConfig {
  endpoint: string;
  apiKey?: string;
  useTokenCredential?: boolean;
  voice: string;
  instructions: string;
  debugMode?: boolean;
  enablePronunciationAssessment?: boolean;
  paWithReferenceText?: boolean;
  recognitionLanguage?: string;
  deploymentName?: string;
}

export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  messageId?: string;
  isStreaming?: boolean;
  contentHtml?: string;
}

export interface PAWordResult {
  word: string;
  accuracyScore: number;
  errorType: 'None' | 'Omission' | 'Insertion' | 'Mispronunciation';
}

export interface TurnLatencyTrace {
  turnId: number;
  speechStoppedAt: number;
  paAudioPreparePromise?: Promise<ArrayBuffer>;
  preparedPaAudio?: ArrayBuffer;
  paInputAt?: number;
  paOutputAt?: number;
  paResultReadyAt?: number;
  paStreamClosedAt?: number;
  firstAudioChunkAt?: number;
  paPromise?: Promise<[boolean, string]>;
  userMessageId?: string;
  userText?: string;
  userMessageTimestamp?: Date;
  wordSpansHtml?: string;
  paScoreLabel?: string;
}

export interface TurnMetric {
  turnId: number;
  timestamp: Date;
  scenarioId: ScenarioId;
  speechToFirstAudioMs: number | null;
  speechToPAResultMs: number | null;
  paIOMs: number | null;
  streamCloseToPAMs: number | null;
  totalResponseMs: number | null;
  inputTokensEst: number;
  outputTokensEst: number;
  costEstUSD: number;
}

export interface VoiceEngineCallbacks {
  onConnectionStatusChange: (status: string) => void;
  onAssistantStatusChange: (status: string) => void;
  onConversationMessage: (message: ConversationMessage) => void;
  onConversationMessageUpdate: (message: ConversationMessage) => void;
  onEventReceived: (event: { type: string; data: any; timestamp: Date }) => void;
  onError: (error: string) => void;
  onAudioLevel: (level: number) => void;
  onLatencyMetric?: (metric: TurnMetric) => void;
}

export interface AudioBytesWithTimestamp {
  bytes: Uint8Array;
  startByte: number;
  endByte: number;
}

/** All languages supported by Pronunciation Assessment, with locale codes. */
export const PA_LANGUAGES: { value: string; label: string; locale: string }[] = [
  { value: 'English', label: 'English (US)', locale: 'en-US' },
  { value: 'Spanish', label: 'Spanish (Spain)', locale: 'es-ES' },
  { value: 'French', label: 'French (France)', locale: 'fr-FR' },
  { value: 'Chinese', label: 'Chinese (Mandarin)', locale: 'zh-CN' },
  { value: 'Japanese', label: 'Japanese', locale: 'ja-JP' },
  // ── additional PA-supported languages ──
  { value: 'Arabic (Egypt)', label: 'Arabic (Egypt)', locale: 'ar-EG' },
  { value: 'Arabic (Saudi Arabia)', label: 'Arabic (Saudi Arabia)', locale: 'ar-SA' },
  { value: 'Catalan', label: 'Catalan', locale: 'ca-ES' },
  { value: 'Chinese (Cantonese)', label: 'Chinese (Cantonese)', locale: 'zh-HK' },
  { value: 'Chinese (Taiwanese)', label: 'Chinese (Taiwanese)', locale: 'zh-TW' },
  { value: 'Danish', label: 'Danish', locale: 'da-DK' },
  { value: 'Dutch', label: 'Dutch', locale: 'nl-NL' },
  { value: 'English (Australia)', label: 'English (Australia)', locale: 'en-AU' },
  { value: 'English (Canada)', label: 'English (Canada)', locale: 'en-CA' },
  { value: 'English (India)', label: 'English (India)', locale: 'en-IN' },
  { value: 'English (UK)', label: 'English (UK)', locale: 'en-GB' },
  { value: 'Finnish', label: 'Finnish', locale: 'fi-FI' },
  { value: 'French (Canada)', label: 'French (Canada)', locale: 'fr-CA' },
  { value: 'German', label: 'German', locale: 'de-DE' },
  { value: 'Hindi', label: 'Hindi', locale: 'hi-IN' },
  { value: 'Italian', label: 'Italian', locale: 'it-IT' },
  { value: 'Korean', label: 'Korean', locale: 'ko-KR' },
  { value: 'Malay', label: 'Malay', locale: 'ms-MY' },
  { value: 'Norwegian', label: 'Norwegian', locale: 'nb-NO' },
  { value: 'Polish', label: 'Polish', locale: 'pl-PL' },
  { value: 'Portuguese (Brazil)', label: 'Portuguese (Brazil)', locale: 'pt-BR' },
  { value: 'Portuguese (Portugal)', label: 'Portuguese (Portugal)', locale: 'pt-PT' },
  { value: 'Russian', label: 'Russian', locale: 'ru-RU' },
  { value: 'Spanish (Mexico)', label: 'Spanish (Mexico)', locale: 'es-MX' },
  { value: 'Swedish', label: 'Swedish', locale: 'sv-SE' },
  { value: 'Tamil', label: 'Tamil', locale: 'ta-IN' },
  { value: 'Thai', label: 'Thai', locale: 'th-TH' },
  { value: 'Vietnamese', label: 'Vietnamese', locale: 'vi-VN' },
];

/** Build an HTML <option> list from PA_LANGUAGES. First `topCount` items are shown above a separator. */
export function buildLanguageOptions(selectedValue = 'English', topCount = 5): string {
  return PA_LANGUAGES.map((lang, i) => {
    const sep = i === topCount ? '<option disabled>──────────</option>' : '';
    const sel = lang.value === selectedValue ? ' selected' : '';
    return `${sep}<option value="${lang.value}"${sel}>${lang.label}</option>`;
  }).join('\n');
}
