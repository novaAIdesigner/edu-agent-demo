// Minimal test: just connect, configure, and wait — no audio
const { VoiceLiveClient } = require('@azure/ai-voicelive');
const { AzureKeyCredential } = require('@azure/core-auth');

const ENDPOINT = process.env.VOICELIVE_ENDPOINT;
const API_KEY = process.env.VOICELIVE_API_KEY;
const DEPLOYMENT = process.env.VOICELIVE_DEPLOYMENT || 'gpt-4o';

function ts() { return new Date().toISOString().split('T')[1].replace('Z', ''); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  console.log(`[${ts()}] Connecting to ${ENDPOINT} with deployment ${DEPLOYMENT}...`);

  // Match reference project exactly: pass defaultSessionOptions to client constructor
  const sessionOptions = {
    connectionTimeoutInMs: 30000,
    enableDebugLogging: true,
  };

  const client = new VoiceLiveClient(ENDPOINT, new AzureKeyCredential(API_KEY), {
    apiVersion: '2025-10-01',
    defaultSessionOptions: sessionOptions,
  });

  const session = await client.startSession(DEPLOYMENT, sessionOptions);
  console.log(`[${ts()}] Session started`);

  let connected = true;
  session.subscribe({
    onConnected: async () => console.log(`[${ts()}] + Connected event`),
    onDisconnected: async (a) => { connected = false; console.log(`[${ts()}] x Disconnected:`, JSON.stringify(a)); },
    onError: async (a) => console.error(`[${ts()}] x Error: ${a.error.message}`),
    onResponseCreated: async () => {},
    onResponseDone: async () => {},
    onResponseTextDelta: async () => {},
    onResponseAudioTranscriptDelta: async () => {},
    onResponseAudioDelta: async () => {},
    onInputAudioBufferSpeechStarted: async () => {},
    onInputAudioBufferSpeechStopped: async () => {},
    onConversationItemInputAudioTranscriptionCompleted: async () => {},
    onConversationItemInputAudioTranscriptionFailed: async () => {},
    onInputAudioBufferCommitted: async () => {},
    onServerEvent: async () => {},
  });

  // Test 1: Just configure session, no audio
  console.log(`[${ts()}] Configuring session...`);
  await session.updateSession({
    modalities: ['audio', 'text'],
    instructions: 'You are a helpful assistant.',
    voice: { type: 'azure-standard', name: 'en-US-Ava:DragonHDLatestNeural' },
    inputAudioFormat: 'pcm16',
    inputAudioSamplingRate: 16000,
    outputAudioFormat: 'pcm16',
    turnDetection: {
      type: 'server_vad',
      threshold: 0.5,
      prefixPaddingInMs: 1000,
      silenceDurationInMs: 1500,
      createResponse: false,
    },
  });
  console.log(`[${ts()}] Session configured`);

  // Wait 5s with no audio — does connection stay alive?
  console.log(`[${ts()}] Waiting 5s with no audio...`);
  await sleep(5000);
  console.log(`[${ts()}] After 5s: connected=${connected}`);

  if (!connected) {
    console.log('RESULT: Connection dropped WITHOUT sending audio — service issue');
    process.exit(1);
  }

  // Test 2: Send 1 second of silence (16kHz PCM16 = 32000 bytes)
  console.log(`[${ts()}] Sending 1s of silence (32000 bytes of zeros)...`);
  const silence = new Uint8Array(32000);
  const chunkSize = 8192;
  for (let i = 0; i < silence.byteLength; i += chunkSize) {
    const end = Math.min(i + chunkSize, silence.byteLength);
    const chunk = silence.slice(i, end);
    await session.sendAudio(chunk);
    await sleep(256); // ~256ms per 4096-sample chunk at 16kHz
  }
  console.log(`[${ts()}] Silence sent`);

  await sleep(3000);
  console.log(`[${ts()}] After silence: connected=${connected}`);

  if (!connected) {
    console.log('RESULT: Connection dropped after sending SILENCE — audio send triggers disconnect');
    process.exit(1);
  }

  // Test 3: Send actual WAV audio
  console.log(`[${ts()}] Sending WAV audio...`);
  const { readFileSync, readdirSync } = require('fs');
  const { resolve } = require('path');
  const wavDir = process.env.WAV_DIR;
  const wavFile = readdirSync(wavDir).filter(f => f.endsWith('.wav')).sort()[0];
  const raw = readFileSync(resolve(wavDir, wavFile));
  // Skip 44-byte header
  const pcm = raw.slice(44);
  for (let i = 0; i < pcm.byteLength; i += chunkSize) {
    const end = Math.min(i + chunkSize, pcm.byteLength);
    const chunk = new Uint8Array(pcm.buffer, pcm.byteOffset + i, end - i);
    await session.sendAudio(chunk);
    await sleep(256);
  }
  console.log(`[${ts()}] WAV sent: ${wavFile}`);

  await sleep(5000);
  console.log(`[${ts()}] After WAV: connected=${connected}`);
  console.log(`RESULT: ${connected ? 'SUCCESS — connection survived everything' : 'FAILED — dropped after WAV audio'}`);

  try { await session.disconnect(); await session.dispose(); } catch {}
  process.exit(connected ? 0 : 1);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
