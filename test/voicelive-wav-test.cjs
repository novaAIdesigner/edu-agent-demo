// Test script: Connect to VoiceLive and send WAV audio files
// Usage: VOICELIVE_ENDPOINT=https://... VOICELIVE_API_KEY=... node test/voicelive-wav-test.cjs

const { readFileSync, readdirSync } = require('fs');
const { resolve, basename } = require('path');
const { VoiceLiveClient } = require('@azure/ai-voicelive');
const { AzureKeyCredential } = require('@azure/core-auth');

const ENDPOINT = process.env.VOICELIVE_ENDPOINT;
const API_KEY = process.env.VOICELIVE_API_KEY;
const DEPLOYMENT = process.env.VOICELIVE_DEPLOYMENT || 'gpt-4o';
const WAV_DIR = process.env.WAV_DIR;

if (!ENDPOINT || !API_KEY || !WAV_DIR) {
  console.error('Required env vars: VOICELIVE_ENDPOINT, VOICELIVE_API_KEY, WAV_DIR');
  console.error('Optional: VOICELIVE_DEPLOYMENT (default: gpt-4o)');
  process.exit(1);
}

// ── WAV parser ──────────────────────────────────────────────────

function parseWav(buffer) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const sampleRate = view.getUint32(24, true);
  const bitsPerSample = view.getUint16(34, true);
  const channels = view.getUint16(22, true);

  let offset = 12;
  while (offset < buffer.byteLength - 8) {
    const id = String.fromCharCode(buffer[offset], buffer[offset+1], buffer[offset+2], buffer[offset+3]);
    const size = view.getUint32(offset + 4, true);
    if (id === 'data') {
      return { sampleRate, bitsPerSample, channels, pcmData: buffer.slice(offset + 8, offset + 8 + size) };
    }
    offset += 8 + size;
  }
  throw new Error('No data chunk found in WAV');
}

// ── Helpers ─────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function ts() {
  return new Date().toISOString().split('T')[1].replace('Z', '');
}

// ── Main test ───────────────────────────────────────────────────

async function runTest() {
  const wavFiles = readdirSync(WAV_DIR)
    .filter(f => f.endsWith('.wav'))
    .sort()
    .map(f => resolve(WAV_DIR, f));

  if (wavFiles.length === 0) {
    console.error(`No .wav files found in ${WAV_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${wavFiles.length} WAV files in ${WAV_DIR}`);
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Deployment: ${DEPLOYMENT}`);
  console.log('');

  // Match reference: pass defaultSessionOptions to client constructor
  const sessionOptions = {
    connectionTimeoutInMs: 30000,
    enableDebugLogging: true,
  };

  const credential = new AzureKeyCredential(API_KEY);
  const client = new VoiceLiveClient(ENDPOINT, credential, {
    apiVersion: '2025-10-01',
    defaultSessionOptions: sessionOptions,
  });

  console.log(`[${ts()}] Starting session...`);
  const session = await client.startSession(DEPLOYMENT, sessionOptions);

  let connected = true;
  const transcriptions = [];
  const responses = [];
  const errors = [];
  let currentAssistantText = '';

  const subscription = session.subscribe({
    onConnected: async () => {
      console.log(`[${ts()}] + WebSocket connected`);
    },
    onDisconnected: async (args) => {
      connected = false;
      console.log(`[${ts()}] x WebSocket disconnected:`, JSON.stringify(args));
    },
    onError: async (args) => {
      errors.push(args.error.message);
      console.error(`[${ts()}] x Error: ${args.error.message}`);
    },
    onResponseCreated: async () => {
      currentAssistantText = '';
    },
    onResponseDone: async () => {
      if (currentAssistantText.trim()) {
        responses.push(currentAssistantText.trim());
        console.log(`[${ts()}] Assistant: ${currentAssistantText.trim().substring(0, 120)}...`);
      }
    },
    onResponseTextDelta: async (event) => {
      currentAssistantText += event.delta;
    },
    onResponseAudioTranscriptDelta: async (event) => {
      currentAssistantText += event.delta;
    },
    onResponseAudioDelta: async () => {},
    onInputAudioBufferSpeechStarted: async () => {
      console.log(`[${ts()}] VAD: speech started`);
    },
    onInputAudioBufferSpeechStopped: async () => {
      console.log(`[${ts()}] VAD: speech stopped`);
    },
    onConversationItemInputAudioTranscriptionCompleted: async (event) => {
      const text = event.transcript || '[no transcript]';
      transcriptions.push(text);
      console.log(`[${ts()}] Transcription: "${text}"`);
    },
    onConversationItemInputAudioTranscriptionFailed: async () => {
      console.log(`[${ts()}] x Transcription failed`);
    },
    onServerEvent: async () => {},
    onInputAudioBufferCommitted: async () => {},
  });

  console.log(`[${ts()}] Configuring session...`);
  await session.updateSession({
    modalities: ['audio', 'text'],
    instructions: 'You are a helpful assistant. Keep responses brief.',
    voice: { type: 'azure-standard', name: 'en-US-Ava:DragonHDLatestNeural' },
    inputAudioFormat: 'pcm16',
    inputAudioSamplingRate: 16000,
    outputAudioFormat: 'pcm16',
    turnDetection: {
      type: 'server_vad',
      threshold: 0.5,
      prefixPaddingInMs: 1000,
      silenceDurationInMs: 1500,
      createResponse: true,
    },
    inputAudioTranscription: { model: 'whisper-1' },
  });
  console.log(`[${ts()}] Session configured\n`);

  // Send first 3 WAV files
  for (let i = 0; i < Math.min(wavFiles.length, 3); i++) {
    if (!connected) {
      console.error(`\n[${ts()}] Connection lost — aborting remaining files`);
      break;
    }

    const filePath = wavFiles[i];
    const fileName = basename(filePath);
    const rawBuf = readFileSync(filePath);
    const wav = parseWav(rawBuf);

    console.log(`\n-- File ${i+1}: ${fileName} --`);
    console.log(`   Format: ${wav.sampleRate}Hz, ${wav.bitsPerSample}-bit, ${wav.channels}ch, ${wav.pcmData.byteLength} bytes`);

    // Stream audio in chunks (simulate real-time)
    const chunkBytes = 8192;
    const chunkDurationMs = (chunkBytes / 2) / wav.sampleRate * 1000;
    let offset = 0;
    let chunkCount = 0;

    while (offset < wav.pcmData.byteLength && connected) {
      const end = Math.min(offset + chunkBytes, wav.pcmData.byteLength);
      const chunk = new Uint8Array(wav.pcmData.buffer, wav.pcmData.byteOffset + offset, end - offset);
      await session.sendAudio(chunk);
      chunkCount++;
      offset = end;
      await sleep(chunkDurationMs);
    }

    console.log(`   Sent ${chunkCount} chunks (${offset} bytes)`);

    // Send 2s of silence to trigger VAD end-of-speech
    const silenceBytes = new Uint8Array(32000); // 1s at 16kHz 16-bit
    await session.sendAudio(silenceBytes);
    await sleep(1000);
    await session.sendAudio(silenceBytes);

    console.log(`   Waiting for response...`);
    await sleep(6000);
  }

  console.log(`\n[${ts()}] Waiting for final responses...`);
  await sleep(5000);

  // Summary
  console.log('\n========================================');
  console.log('TEST SUMMARY');
  console.log('========================================');
  console.log(`Connection:     ${connected ? '+ Still alive' : 'x Disconnected'}`);
  console.log(`Errors:         ${errors.length === 0 ? '+ None' : 'x ' + errors.join('; ')}`);
  console.log(`Transcriptions: ${transcriptions.length}`);
  transcriptions.forEach((t, i) => console.log(`  ${i+1}. "${t}"`));
  console.log(`Responses:      ${responses.length}`);
  responses.forEach((r, i) => console.log(`  ${i+1}. "${r.substring(0, 120)}${r.length > 120 ? '...' : ''}"`));
  console.log('========================================');

  try {
    await subscription.close();
    await session.disconnect();
    await session.dispose();
  } catch { /* ignore cleanup errors */ }

  process.exit(errors.length > 0 || !connected ? 1 : 0);
}

runTest().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
