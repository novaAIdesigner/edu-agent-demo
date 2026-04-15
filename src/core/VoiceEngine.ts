import {
  VoiceLiveClient,
  VoiceLiveSession,
  type VoiceLiveSessionHandlers,
  type VoiceLiveSubscription,
  type ConnectedEventArgs,
  type DisconnectedEventArgs,
  type ErrorEventArgs,
  type ConnectionContext,
  type SessionContext,
} from '@azure/ai-voicelive';
import { AzureKeyCredential } from '@azure/core-auth';
import type { TokenCredential, KeyCredential } from '@azure/core-auth';
import * as speechSDK from 'microsoft-cognitiveservices-speech-sdk';
import { SimpleAudioCapture } from './AudioCapture.js';
import { AudioResampler } from './AudioResampler.js';
import { LatencyTracker } from './LatencyTracker.js';
import type {
  VoiceEngineConfig,
  VoiceEngineCallbacks,
  ConversationMessage,
  TurnLatencyTrace,
  AudioBytesWithTimestamp,
  ScenarioId,
} from './types.js';

class MockDefaultAzureCredential implements TokenCredential {
  async getToken(): Promise<{ token: string; expiresOnTimestamp: number } | null> {
    console.warn('Mock DefaultAzureCredential used');
    return { token: 'mock-token-for-demo', expiresOnTimestamp: Date.now() + 3600000 };
  }
}

export class VoiceEngine {
  private credential?: TokenCredential | KeyCredential;
  private client?: VoiceLiveClient;
  private session?: VoiceLiveSession;
  private subscription?: VoiceLiveSubscription;
  private audioCapture: SimpleAudioCapture;
  private callbacks?: VoiceEngineCallbacks;
  private isConnected = false;
  private isConversationActive = false;
  private currentResponseId?: string;
  private audioContext?: AudioContext;

  // Text streaming state
  private currentAssistantMessage = '';
  private messageStartTime?: Date;
  private currentAssistantMessageId?: string;

  // User transcription state
  private currentUserTranscription = '';
  private userSpeechStartTime?: Date;

  // Audio playback queue
  private audioQueue: AudioBuffer[] = [];
  private isPlayingAudio = false;
  private nextAudioStartTime = 0;
  private currentAudioSources: AudioBufferSourceNode[] = [];

  // Pronunciation Assessment state
  private speechConfig?: speechSDK.SpeechConfig;
  private recognitionLanguage = 'en-US';
  private silenceTimeout = 1500;
  private enablePronunciationAssessment = true;
  private paWithReferenceText = true;
  private turnLatencySeq = 0;
  private activeTurnLatency?: TurnLatencyTrace;
  private audioChunksToAssess: Uint8Array[] = [];
  private audioChunks: AudioBytesWithTimestamp[] = [];
  private audioStartMillis: number | null = null;
  private audioEndMillis: number | null = null;
  private paStreamingPushStream?: speechSDK.PushAudioInputStream;
  private paStreamingActive = false;
  private paStreamingWriteReady: Promise<void> = Promise.resolve();

  private audioTimeline = { totalBytes: 0 };

  // Latency tracker
  readonly latencyTracker = new LatencyTracker();
  private currentScenarioId: ScenarioId = 'free-conversation';

  constructor() {
    this.audioCapture = new SimpleAudioCapture();
  }

  setCallbacks(callbacks: VoiceEngineCallbacks): void {
    this.callbacks = callbacks;
  }

  setScenarioId(id: ScenarioId): void {
    this.currentScenarioId = id;
  }

  async connect(config: VoiceEngineConfig): Promise<void> {
    try {
      this.enablePronunciationAssessment = config.enablePronunciationAssessment !== false;
      this.paWithReferenceText = config.paWithReferenceText !== false;
      this.recognitionLanguage = config.recognitionLanguage || 'en-US';

      this.callbacks?.onConnectionStatusChange('connecting');

      this.credential = this.createCredential(config);

      console.log('[VoiceEngine] Connecting to:', config.endpoint);
      console.log('[VoiceEngine] Auth method:', config.useTokenCredential ? 'token' : 'apikey');
      console.log('[VoiceEngine] Voice:', config.voice);

      const sessionOptions: any = {
        connectionTimeoutInMs: 30000,
        enableDebugLogging: config.debugMode !== false,
      };

      this.client = new VoiceLiveClient(config.endpoint, this.credential, {
        apiVersion: '2025-10-01',
        defaultSessionOptions: sessionOptions,
      });

      console.log('[VoiceEngine] Starting session...');
      const deploymentName = config.deploymentName || 'gpt-4o';
      console.log('[VoiceEngine] Deployment name:', deploymentName);
      this.session = await this.client.startSession(deploymentName, sessionOptions);
      console.log('[VoiceEngine] Session started, subscribing to events...');
      this.subscription = this.session.subscribe(this.createEventHandlers());
      console.log('[VoiceEngine] Configuring session...');
      await this.configureSession(config);
      console.log('[VoiceEngine] Session configured successfully');

      // Setup Speech config for PA — pass credential object per reference implementation
      try {
        this.speechConfig = speechSDK.SpeechConfig.fromEndpoint(
          new URL(config.endpoint),
          this.credential,
        );
        this.speechConfig.setProperty(
          speechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
          this.silenceTimeout.toString(),
        );
        if (this.recognitionLanguage !== 'auto') {
          this.speechConfig.speechRecognitionLanguage = this.recognitionLanguage;
        }
      } catch (paError) {
        console.warn('[VoiceEngine] PA SpeechConfig setup failed (PA will be unavailable):', paError);
        this.speechConfig = undefined;
      }

      this.isConnected = true;
      this.callbacks?.onConnectionStatusChange('connected');
    } catch (error) {
      console.error('[VoiceEngine] Connection failed:', error);
      this.callbacks?.onConnectionStatusChange('disconnected');
      this.callbacks?.onError(`Connection failed: ${error}`);
      throw error;
    }
  }

  private createCredential(config: VoiceEngineConfig): TokenCredential | KeyCredential {
    if (config.useTokenCredential) {
      return new MockDefaultAzureCredential();
    }
    if (!config.apiKey) {
      throw new Error('API key is required when not using token credential');
    }
    return new AzureKeyCredential(config.apiKey);
  }

  async disconnect(): Promise<void> {
    try {
      this.stopConversation();
      if (this.subscription) {
        await this.subscription.close();
        this.subscription = undefined;
      }
      if (this.session && this.isConnected) {
        await this.session.disconnect();
        await this.session.dispose();
        this.session = undefined;
      }
      this.isConnected = false;
      this.callbacks?.onConnectionStatusChange('disconnected');
      this.resetPAState();
    } catch (error) {
      this.callbacks?.onError(`Disconnect failed: ${error}`);
    }
  }

  private resetPAState(): void {
    this.audioTimeline.totalBytes = 0;
    this.audioChunksToAssess = [];
    this.audioChunks = [];
    this.audioStartMillis = null;
    this.audioEndMillis = null;
    this.paStreamingActive = false;
    this.paStreamingPushStream = undefined;
    this.paStreamingWriteReady = Promise.resolve();
  }

  // ── Event Handlers ─────────────────────────────────────────────

  private createEventHandlers(): VoiceLiveSessionHandlers {
    return {
      onConnected: async (args: ConnectedEventArgs, _ctx: ConnectionContext) => {
        console.log('[VoiceEngine] WebSocket connected event received');
        this.callbacks?.onEventReceived({ type: 'connected', data: args, timestamp: new Date() });
      },

      onDisconnected: async (args: DisconnectedEventArgs, _ctx: ConnectionContext) => {
        console.warn('[VoiceEngine] WebSocket disconnected:', JSON.stringify(args));
        this.isConnected = false;
        this.callbacks?.onConnectionStatusChange('disconnected');
        this.callbacks?.onEventReceived({ type: 'disconnected', data: args, timestamp: new Date() });
      },

      onError: async (args: ErrorEventArgs, _ctx: ConnectionContext) => {
        console.error('[VoiceEngine] Service error:', args.error.message, args.error);
        this.callbacks?.onError(`Service error: ${args.error.message}`);
        this.callbacks?.onEventReceived({ type: 'error', data: args, timestamp: new Date() });
      },

      onResponseCreated: async (event: any, _ctx: SessionContext) => {
        if (this.currentResponseId && this.currentResponseId !== event.response.id) {
          this.clearAudioQueue();
        }
        this.currentResponseId = event.response.id;
        this.currentAssistantMessage = '';
        this.messageStartTime = new Date();
        this.currentAssistantMessageId = `response_${event.response.id}_${Date.now()}`;
        this.clearAudioQueue();
        this.callbacks?.onConversationMessageUpdate({
          role: 'assistant',
          content: '',
          timestamp: this.messageStartTime,
          messageId: this.currentAssistantMessageId,
          isStreaming: true,
        });
        this.callbacks?.onAssistantStatusChange('thinking');
        this.callbacks?.onEventReceived({ type: 'response.created', data: event, timestamp: new Date() });
      },

      onResponseDone: async (event: any, _ctx: SessionContext) => {
        if (this.currentAssistantMessageId && this.currentAssistantMessage.trim()) {
          this.callbacks?.onConversationMessageUpdate({
            role: 'assistant',
            content: this.currentAssistantMessage.trim(),
            timestamp: this.messageStartTime || new Date(),
            messageId: this.currentAssistantMessageId,
            isStreaming: false,
          });
        }
        this.currentAssistantMessage = '';
        this.messageStartTime = undefined;
        this.currentAssistantMessageId = undefined;
        this.callbacks?.onAssistantStatusChange('listening');
        this.callbacks?.onEventReceived({ type: 'response.done', data: event, timestamp: new Date() });
      },

      onInputAudioBufferSpeechStarted: async (event: any, _ctx: SessionContext) => {
        this.currentUserTranscription = '';
        this.userSpeechStartTime = new Date();
        this.audioStartMillis = event.audioStartInMs;

        if (this.isPlayingAudio) {
          this.clearAudioQueue();
          this.callbacks?.onAssistantStatusChange('interrupted');
          this.callbacks?.onConversationMessageUpdate({
            role: 'system',
            content: '[Conversation interrupted by user]',
            timestamp: new Date(),
            messageId: 'barge_in_' + Date.now(),
            isStreaming: false,
          });
        }

        // Streaming PA: start at speech begin
        if (this.enablePronunciationAssessment && !this.paWithReferenceText) {
          this.activeTurnLatency = {
            turnId: ++this.turnLatencySeq,
            speechStoppedAt: 0,
          };
          this.startStreamingPA(this.activeTurnLatency);
        }

        this.callbacks?.onAssistantStatusChange('listening (speech detected)');
        this.callbacks?.onEventReceived({ type: 'speech.started', data: event, timestamp: new Date() });
      },

      onInputAudioBufferSpeechStopped: async (event: any, _ctx: SessionContext) => {
        this.callbacks?.onAssistantStatusChange('processing');
        this.audioEndMillis = event.audioEndInMs;

        if (this.paStreamingActive && this.activeTurnLatency) {
          this.activeTurnLatency.speechStoppedAt = performance.now();
          if (this.paStreamingPushStream) {
            const stream = this.paStreamingPushStream;
            const trace = this.activeTurnLatency;
            this.paStreamingWriteReady = this.paStreamingWriteReady.then(() => {
              stream.close();
              trace.paStreamClosedAt = performance.now();
            });
          }
        } else {
          this.activeTurnLatency = {
            turnId: ++this.turnLatencySeq,
            speechStoppedAt: performance.now(),
          };
        }

        this.callbacks?.onEventReceived({ type: 'speech.stopped', data: event, timestamp: new Date() });
      },

      onInputAudioBufferCommitted: async (event: any, _ctx: SessionContext) => {
        if (this.paStreamingActive) return;
        this.extractValidAudio();
        if (
          this.enablePronunciationAssessment &&
          this.activeTurnLatency &&
          !this.activeTurnLatency.paAudioPreparePromise &&
          !this.activeTurnLatency.preparedPaAudio &&
          this.audioChunksToAssess.length > 0
        ) {
          this.activeTurnLatency.paAudioPreparePromise = this.preparePAAudio();
        }
      },

      onResponseTextDelta: async (event: any, _ctx: SessionContext) => {
        this.currentAssistantMessage += event.delta;
        if (this.currentAssistantMessageId) {
          this.callbacks?.onConversationMessageUpdate({
            role: 'assistant',
            content: this.currentAssistantMessage,
            timestamp: this.messageStartTime || new Date(),
            messageId: this.currentAssistantMessageId,
            isStreaming: true,
          });
        }
      },

      onResponseAudioTranscriptDelta: async (event: any, _ctx: SessionContext) => {
        this.currentAssistantMessage += event.delta;
        if (this.currentAssistantMessageId) {
          this.callbacks?.onConversationMessageUpdate({
            role: 'assistant',
            content: this.currentAssistantMessage,
            timestamp: this.messageStartTime || new Date(),
            messageId: this.currentAssistantMessageId,
            isStreaming: true,
          });
        }
      },

      onConversationItemInputAudioTranscriptionDelta: async (event: any, _ctx: SessionContext) => {
        this.currentUserTranscription += event.delta;
      },

      onConversationItemInputAudioTranscriptionCompleted: async (event: any, _ctx: SessionContext) => {
        const userText = event.transcript || this.currentUserTranscription || '[Audio input]';
        const userMsgTimestamp = this.userSpeechStartTime || new Date();
        const userMsgId = `user_${Date.now()}`;
        const turnTrace: TurnLatencyTrace = this.activeTurnLatency || {
          turnId: ++this.turnLatencySeq,
          speechStoppedAt: performance.now(),
        };
        turnTrace.userText = userText;
        turnTrace.userMessageTimestamp = userMsgTimestamp;
        turnTrace.userMessageId = userMsgId;
        this.activeTurnLatency = turnTrace;

        this.callbacks?.onConversationMessageUpdate({
          role: 'user',
          content: userText,
          timestamp: userMsgTimestamp,
          messageId: userMsgId,
          isStreaming: false,
        });

        if (!this.enablePronunciationAssessment) {
          turnTrace.paScoreLabel = 'PA disabled';
          this.publishTurnLatencyMessage(turnTrace);
          this.clearPAAudioCache();
          this.session?.sendEvent({ type: 'response.create' });
          this.currentUserTranscription = '';
          this.userSpeechStartTime = undefined;
          return;
        }

        const [isSuccess, paResult] = this.paWithReferenceText
          ? await this.runPAForTurn(turnTrace, event.transcript || this.currentUserTranscription || '', true)
          : await (turnTrace.paPromise || this.runPAForTurn(turnTrace, '', false));

        const paScoreLabel = 'PA analyzed';
        if (isSuccess && paResult) {
          try {
            const paArr = JSON.parse(paResult);
            if (Array.isArray(paArr) && paArr.length > 0) {
              const nBest = paArr[0]?.NBest?.[0];
              const words: any[] = nBest?.Words || [];
              if (words.length > 0) {
                const wordSpans = words
                  .map((w: any) => {
                    const score = w.PronunciationAssessment?.AccuracyScore ?? 100;
                    const errorType = w.PronunciationAssessment?.ErrorType || 'None';
                    let cls = 'pa-word-good';
                    if (errorType === 'Omission') cls = 'pa-word-omission';
                    else if (errorType === 'Insertion') cls = 'pa-word-insertion';
                    else if (score < 60) cls = 'pa-word-bad';
                    else if (score < 80) cls = 'pa-word-fair';
                    const escaped = w.Word.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    return `<span class="pa-word ${cls}" title="Score: ${score}, Error: ${errorType}">${escaped}</span>`;
                  })
                  .join(' ');
                turnTrace.wordSpansHtml = wordSpans;
              }
            }
          } catch {
            // ignore parse errors
          }
        }
        turnTrace.paScoreLabel = paScoreLabel;

        this.publishTurnLatencyMessage(turnTrace);

        this.session?.sendEvent({
          type: 'response.create',
          additionalInstructions: `This is the pronunciation assessment result for above user speech: '${paResult}'`,
        });

        this.currentUserTranscription = '';
        this.userSpeechStartTime = undefined;
      },

      onConversationItemInputAudioTranscriptionFailed: async (_event: any, _ctx: SessionContext) => {
        this.callbacks?.onConversationMessage({
          role: 'user',
          content: '[Audio input - transcription unavailable]',
          timestamp: this.userSpeechStartTime || new Date(),
        });
        this.currentUserTranscription = '';
        this.userSpeechStartTime = undefined;
        this.activeTurnLatency = undefined;
      },

      onResponseAudioDelta: async (event: any, _ctx: SessionContext) => {
        if (event.delta && event.delta.byteLength > 0) {
          if (this.activeTurnLatency?.userMessageId && !this.activeTurnLatency.firstAudioChunkAt) {
            this.activeTurnLatency.firstAudioChunkAt = performance.now();
            this.publishTurnLatencyMessage(this.activeTurnLatency);
            if (!this.enablePronunciationAssessment) {
              this.activeTurnLatency = undefined;
            } else if (this.activeTurnLatency.paResultReadyAt != null) {
              this.activeTurnLatency = undefined;
            }
          }
          const audioBuffer = new ArrayBuffer(event.delta.byteLength);
          new Uint8Array(audioBuffer).set(event.delta);
          await this.playAudioChunk(audioBuffer);
        }
      },

      onServerEvent: async (event: any, _ctx: SessionContext) => {
        this.callbacks?.onEventReceived({ type: event.type, data: event, timestamp: new Date() });
      },
    };
  }

  // ── Conversation lifecycle ────────────────────────────────────

  async startConversation(): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Voice Live service');
    }
    console.log('[VoiceEngine] Starting conversation — initializing audio capture...');
    await this.audioCapture.initialize();
    this.audioContext = new AudioContext();
    console.log('[VoiceEngine] AudioContext created, sample rate:', this.audioContext.sampleRate);
    this.audioCapture.startCapture(
      (level) => this.callbacks?.onAudioLevel(level),
      (audioData) => this.sendAudioData(audioData),
    );
    this.isConversationActive = true;
    this.callbacks?.onAssistantStatusChange('listening');
    this.callbacks?.onConversationMessage({
      role: 'system',
      content: 'Conversation started. Start speaking!',
      timestamp: new Date(),
    });
    console.log('[VoiceEngine] Conversation active, sending audio...');
  }

  stopConversation(): void {
    this.clearAudioQueue();
    this.audioCapture.stopCapture();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
    }
    this.isConversationActive = false;
    this.callbacks?.onAssistantStatusChange('idle');
    this.callbacks?.onAudioLevel(0);
  }

  async sendWavFile(file: File): Promise<void> {
    if (!this.session || !this.isConnected) {
      throw new Error('Not connected to Voice Live service');
    }

    console.log(`[VoiceEngine] Sending WAV file: ${file.name} (${file.size} bytes)`);
    this.callbacks?.onConversationMessage({
      role: 'system',
      content: `Sending audio file: ${file.name}`,
      timestamp: new Date(),
    });

    const arrayBuffer = await file.arrayBuffer();
    const view = new DataView(arrayBuffer);

    // Parse WAV header
    const sampleRate = view.getUint32(24, true);
    const bitsPerSample = view.getUint16(34, true);
    const channels = view.getUint16(22, true);
    console.log(`[VoiceEngine] WAV: ${sampleRate}Hz, ${bitsPerSample}-bit, ${channels}ch`);

    // Find data chunk (skip header — typically 44 bytes but search for 'data' marker)
    let dataOffset = 12;
    while (dataOffset < arrayBuffer.byteLength - 8) {
      const chunkId = String.fromCharCode(
        view.getUint8(dataOffset), view.getUint8(dataOffset + 1),
        view.getUint8(dataOffset + 2), view.getUint8(dataOffset + 3),
      );
      const chunkSize = view.getUint32(dataOffset + 4, true);
      if (chunkId === 'data') {
        dataOffset += 8;
        break;
      }
      dataOffset += 8 + chunkSize;
    }

    const pcmData = new Uint8Array(arrayBuffer, dataOffset);
    console.log(`[VoiceEngine] PCM data: ${pcmData.byteLength} bytes starting at offset ${dataOffset}`);

    // Resample to 16kHz if needed (VoiceLive expects 16kHz PCM16)
    let audioToSend: Uint8Array;
    if (sampleRate !== 16000) {
      console.log(`[VoiceEngine] Resampling ${sampleRate}Hz → 16000Hz`);
      const resampled = await AudioResampler.toTargetRatePcm16([pcmData], sampleRate, 16000);
      audioToSend = new Uint8Array(resampled);
    } else {
      audioToSend = pcmData;
    }

    console.log(`[VoiceEngine] Sending ${audioToSend.byteLength} bytes of 16kHz PCM16`);

    // Create AudioContext for playback if not already created
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    this.isConversationActive = true;
    this.callbacks?.onAssistantStatusChange('listening');

    // Stream in chunks matching ScriptProcessor buffer size (4096 samples = 8192 bytes at 16-bit)
    const chunkBytes = 8192;
    const chunkDurationMs = (chunkBytes / 2) / 16000 * 1000; // ~256ms per chunk at 16kHz
    let offset = 0;
    let chunkCount = 0;

    const sendNextChunk = (): Promise<void> => {
      return new Promise((resolve) => {
        const send = async () => {
          if (offset >= audioToSend.byteLength || !this.isConnected) {
            console.log(`[VoiceEngine] Finished sending ${chunkCount} chunks`);
            this.callbacks?.onConversationMessage({
              role: 'system',
              content: `Audio file sent: ${chunkCount} chunks, waiting for response...`,
              timestamp: new Date(),
            });
            resolve();
            return;
          }

          const end = Math.min(offset + chunkBytes, audioToSend.byteLength);
          const chunk = audioToSend.slice(offset, end);

          try {
            this.cacheAudioChunks(chunk);
            await this.session!.sendAudio(chunk);
            chunkCount++;
            if (chunkCount % 10 === 0) {
              console.log(`[VoiceEngine] Sent chunk ${chunkCount} (${offset}/${audioToSend.byteLength} bytes)`);
            }
          } catch (error) {
            console.error(`[VoiceEngine] Failed to send chunk ${chunkCount}:`, error);
            this.callbacks?.onError(`Failed to send audio chunk: ${error}`);
            resolve();
            return;
          }

          offset = end;
          setTimeout(send, chunkDurationMs);
        };
        send();
      });
    };

    await sendNextChunk();
  }

  cleanup(): void {
    this.stopConversation();
    this.audioCapture.cleanup();
  }

  get connected(): boolean {
    return this.isConnected;
  }

  get conversationActive(): boolean {
    return this.isConversationActive;
  }

  // ── Session configuration ─────────────────────────────────────

  private async configureSession(config: VoiceEngineConfig): Promise<void> {
    if (!this.session) return;
    const voice = this.createVoiceObject(config.voice);
    try {
      await this.session.updateSession({
        modalities: ['audio', 'text'],
        instructions: config.instructions,
        voice,
        inputAudioFormat: 'pcm16',
        inputAudioSamplingRate: 16000,
        outputAudioFormat: 'pcm16',
        turnDetection: {
          type: 'server_vad',
          threshold: 0.5,
          prefixPaddingInMs: 1000,
          silenceDurationInMs: this.silenceTimeout,
          createResponse: false,
        },
      });
      console.log('[VoiceEngine] Session configured successfully');
    } catch (error) {
      console.error('[VoiceEngine] Failed to configure session:', error);
      throw error;
    }
  }

  private createVoiceObject(voiceName: string): any {
    // Azure VoiceLive only supports Azure voices (type: 'azure-standard').
    // If a legacy/invalid voice name is passed (e.g. OpenAI "alloy"), use default.
    if (!voiceName.includes(':') && !voiceName.includes('Neural')) {
      console.warn(`[VoiceEngine] Invalid voice "${voiceName}", falling back to default`);
      voiceName = 'en-US-Ava:DragonHDLatestNeural';
    }
    return { type: 'azure-standard', name: voiceName };
  }

  // ── Audio send / playback ─────────────────────────────────────

  private async sendAudioData(audioData: ArrayBuffer): Promise<void> {
    if (!this.session || !this.isConversationActive) return;
    try {
      const audioBytes = new Uint8Array(audioData);
      this.cacheAudioChunks(audioBytes);
      await this.session.sendAudio(audioBytes);

      if (this.paStreamingActive && this.paStreamingPushStream) {
        const stream = this.paStreamingPushStream;
        this.paStreamingWriteReady = this.paStreamingWriteReady.then(async () => {
          const resampled = await AudioResampler.to16kHzPcm16(
            [audioBytes],
            this.audioCapture.currentSampleRate || 24000,
          );
          if (resampled.byteLength > 0 && this.paStreamingActive) {
            stream.write(resampled);
          }
        });
      }
    } catch (error) {
      console.error('Failed to send audio data:', error);
    }
  }

  private async playAudioChunk(audioData: ArrayBuffer): Promise<void> {
    if (!this.audioContext) return;
    const sampleRate = 24000;
    const numberOfSamples = audioData.byteLength / 2;
    if (numberOfSamples === 0) return;

    const audioBuffer = this.audioContext.createBuffer(1, numberOfSamples, sampleRate);
    const pcm16Data = new Int16Array(audioData);
    const float32Data = audioBuffer.getChannelData(0);
    for (let i = 0; i < numberOfSamples; i++) {
      float32Data[i] = pcm16Data[i] / 32768.0;
    }
    this.audioQueue.push(audioBuffer);
    if (!this.isPlayingAudio) {
      this.startAudioPlayback();
    }
  }

  private startAudioPlayback(): void {
    if (!this.audioContext || this.isPlayingAudio || this.audioQueue.length === 0) return;
    this.isPlayingAudio = true;
    this.nextAudioStartTime = this.audioContext.currentTime;
    this.callbacks?.onAssistantStatusChange('speaking');
    this.playNextAudioChunk();
  }

  private playNextAudioChunk(): void {
    if (!this.audioContext || this.audioQueue.length === 0) {
      this.isPlayingAudio = false;
      this.callbacks?.onAssistantStatusChange('listening');
      return;
    }
    const audioBuffer = this.audioQueue.shift()!;
    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);
    this.currentAudioSources.push(source);
    source.start(this.nextAudioStartTime);
    this.nextAudioStartTime += audioBuffer.length / audioBuffer.sampleRate;
    source.onended = () => {
      const idx = this.currentAudioSources.indexOf(source);
      if (idx > -1) this.currentAudioSources.splice(idx, 1);
      this.playNextAudioChunk();
    };
  }

  private clearAudioQueue(): void {
    this.currentAudioSources.forEach((s) => { try { s.stop(); } catch {} });
    this.currentAudioSources = [];
    this.audioQueue = [];
    this.isPlayingAudio = false;
    if (this.audioContext) {
      this.nextAudioStartTime = this.audioContext.currentTime;
    }
  }

  // ── Pronunciation Assessment ──────────────────────────────────

  private async runPAForTurn(
    turnTrace: TurnLatencyTrace,
    referenceText: string,
    useReferenceText: boolean,
  ): Promise<[boolean, string]> {
    const audioChunks16k = turnTrace.preparedPaAudio
      ? turnTrace.preparedPaAudio
      : turnTrace.paAudioPreparePromise
        ? await turnTrace.paAudioPreparePromise
        : await this.preparePAAudio();
    turnTrace.preparedPaAudio = audioChunks16k;
    turnTrace.paInputAt = performance.now();
    const result = await this.startPAWithStream(referenceText, audioChunks16k, useReferenceText);
    turnTrace.paOutputAt = performance.now();
    turnTrace.paResultReadyAt = turnTrace.paOutputAt;
    this.clearPAAudioCache();
    turnTrace.paAudioPreparePromise = undefined;
    turnTrace.preparedPaAudio = undefined;
    turnTrace.paPromise = undefined;
    return result;
  }

  private startStreamingPA(turnTrace: TurnLatencyTrace): void {
    if (!this.speechConfig) return;

    const pushStream = speechSDK.AudioInputStream.createPushStream();
    this.paStreamingPushStream = pushStream;
    this.paStreamingActive = true;
    this.paStreamingWriteReady = Promise.resolve();

    this.paStreamingWriteReady = this.pushCachedAudioToStream(pushStream);

    const audioConfig = speechSDK.AudioConfig.fromStreamInput(pushStream);
    let reco: speechSDK.SpeechRecognizer;
    try {
      reco = new speechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
    } catch {
      this.paStreamingActive = false;
      this.paStreamingPushStream = undefined;
      return;
    }

    const paConfig = new speechSDK.PronunciationAssessmentConfig(
      '',
      speechSDK.PronunciationAssessmentGradingSystem.HundredMark,
      speechSDK.PronunciationAssessmentGranularity.Phoneme,
      false,
    );
    paConfig.enableProsodyAssessment = true;
    paConfig.applyTo(reco);

    turnTrace.paInputAt = performance.now();
    const PAResults: string[] = [];

    turnTrace.paPromise = new Promise<[boolean, string]>((resolve) => {
      let finished = false;
      const safeResolve = (result: [boolean, string]) => {
        if (finished) return;
        finished = true;
        this.paStreamingActive = false;
        this.paStreamingPushStream = undefined;
        this.clearPAAudioCache();
        resolve(result);
      };

      reco.recognized = (_s: any, e: any) => {
        const json = e.result.properties.getProperty(speechSDK.PropertyId.SpeechServiceResponse_JsonResult);
        if (json) PAResults.push(json);
      };
      reco.sessionStopped = () => {
        reco.stopContinuousRecognitionAsync();
        reco.close();
        turnTrace.paOutputAt = performance.now();
        turnTrace.paResultReadyAt = turnTrace.paOutputAt;
        safeResolve([true, `[${PAResults.join(',')}]`]);
      };
      reco.canceled = (_s: any, e: any) => {
        reco.stopContinuousRecognitionAsync();
        if (e.errorCode !== speechSDK.CancellationErrorCode.NoError) {
          safeResolve([false, '']);
        }
      };
      reco.startContinuousRecognitionAsync();
    });
  }

  private async pushCachedAudioToStream(pushStream: speechSDK.PushAudioInputStream): Promise<void> {
    if (this.audioStartMillis == null) return;
    const bytesPerMs = (this.audioCapture.currentSampleRate || 24000) * 2 / 1000;
    const startByte = Math.floor(this.audioStartMillis * bytesPerMs);
    const chunksToResample: Uint8Array[] = [];
    for (const c of this.audioChunks) {
      if (c.endByte <= startByte) continue;
      const sliceStart = Math.max(startByte, c.startByte) - c.startByte;
      chunksToResample.push(c.bytes.slice(sliceStart));
    }
    if (chunksToResample.length > 0) {
      const resampled = await AudioResampler.to16kHzPcm16(
        chunksToResample,
        this.audioCapture.currentSampleRate || 24000,
      );
      if (resampled.byteLength > 0) pushStream.write(resampled);
    }
  }

  private async preparePAAudio(): Promise<ArrayBuffer> {
    const result = await AudioResampler.to16kHzPcm16(
      this.audioChunksToAssess,
      this.audioCapture.currentSampleRate || 24000,
    );
    this.audioChunksToAssess = [];
    return result;
  }

  private startPAWithStream(
    referenceText: string,
    audioChunksToAssess: ArrayBuffer,
    useReferenceText: boolean,
  ): Promise<[boolean, string]> {
    return new Promise((resolve) => {
      let finished = false;
      const safeResolve = (result: [boolean, string]) => {
        if (finished) return;
        finished = true;
        resolve(result);
      };

      if (!this.speechConfig) {
        safeResolve([false, '']);
        return;
      }
      if (!audioChunksToAssess || audioChunksToAssess.byteLength === 0) {
        safeResolve([false, '']);
        return;
      }

      const pushStream = speechSDK.AudioInputStream.createPushStream();
      pushStream.write(audioChunksToAssess);
      pushStream.close();
      const audioConfig = speechSDK.AudioConfig.fromStreamInput(pushStream);
      let reco: speechSDK.SpeechRecognizer;
      try {
        reco = new speechSDK.SpeechRecognizer(this.speechConfig, audioConfig);
      } catch {
        safeResolve([false, '']);
        return;
      }

      const paConfig = new speechSDK.PronunciationAssessmentConfig(
        useReferenceText ? referenceText : '',
        speechSDK.PronunciationAssessmentGradingSystem.HundredMark,
        speechSDK.PronunciationAssessmentGranularity.Phoneme,
        useReferenceText,
      );
      paConfig.enableProsodyAssessment = true;
      paConfig.applyTo(reco);

      const PAResults: string[] = [];
      reco.recognized = (_s: any, e: any) => {
        const json = e.result.properties.getProperty(speechSDK.PropertyId.SpeechServiceResponse_JsonResult);
        if (json) PAResults.push(json);
      };
      reco.sessionStopped = () => {
        reco.stopContinuousRecognitionAsync();
        reco.close();
        safeResolve([true, `[${PAResults.join(',')}]`]);
      };
      reco.canceled = (_s: any, e: any) => {
        reco.stopContinuousRecognitionAsync();
        if (e.errorCode !== speechSDK.CancellationErrorCode.NoError) {
          safeResolve([false, '']);
        }
      };
      reco.startContinuousRecognitionAsync();
    });
  }

  // ── Audio caching helpers ─────────────────────────────────────

  private cacheAudioChunks(chunk: Uint8Array): void {
    const start = this.audioTimeline.totalBytes;
    const end = start + chunk.byteLength;
    this.audioChunks.push({ bytes: chunk, startByte: start, endByte: end });
    this.audioTimeline.totalBytes = end;
  }

  private extractValidAudio(): void {
    if (this.audioStartMillis == null || this.audioEndMillis == null || this.audioEndMillis < this.audioStartMillis) return;
    const bytesPerMs = (this.audioCapture.currentSampleRate ?? 24000) * 2 / 1000;
    const startByte = Math.floor(this.audioStartMillis * bytesPerMs);
    const endByte = Math.ceil(this.audioEndMillis * bytesPerMs);
    for (const c of this.audioChunks) {
      if (c.endByte <= startByte) continue;
      if (c.startByte >= endByte) break;
      const sliceStart = Math.max(startByte, c.startByte) - c.startByte;
      const sliceEnd = Math.min(endByte, c.endByte) - c.startByte;
      this.audioChunksToAssess.push(c.bytes.slice(sliceStart, sliceEnd));
    }
    this.audioChunks = [];
    this.audioStartMillis = null;
    this.audioEndMillis = null;
  }

  private clearPAAudioCache(): void {
    this.audioChunks = [];
    this.audioChunksToAssess = [];
    this.audioStartMillis = null;
    this.audioEndMillis = null;
  }

  // ── Latency publishing ────────────────────────────────────────

  private publishTurnLatencyMessage(trace: TurnLatencyTrace): void {
    if (!trace.userMessageId || !trace.userText || !trace.userMessageTimestamp) return;

    const latencyLabel = this.latencyTracker.buildLatencyLabel(trace);
    const content = `${trace.userText}\n[${latencyLabel}]`;
    let contentHtml: string | undefined;
    if (trace.wordSpansHtml) {
      contentHtml =
        `<div>${this.escHtml(trace.userText)}</div>` +
        `<div class="mt-1">${trace.wordSpansHtml}</div>` +
        `<div class="text-xs text-gray-400 mt-1">${latencyLabel}</div>`;
    } else {
      contentHtml =
        `<div>${this.escHtml(trace.userText)}</div>` +
        `<div class="text-xs text-gray-400 mt-1">${latencyLabel}</div>`;
    }

    this.callbacks?.onConversationMessageUpdate({
      role: 'user',
      content,
      timestamp: trace.userMessageTimestamp,
      messageId: trace.userMessageId,
      isStreaming: false,
      contentHtml,
    });

    // Record metric
    const metric = this.latencyTracker.recordTurn(trace, this.currentScenarioId);
    this.callbacks?.onLatencyMetric?.(metric);
  }

  private escHtml(text: string): string {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
