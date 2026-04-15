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
