// Diagnostic: intercept WebSocket traffic to understand the 1006 disconnect
const { VoiceLiveClient } = require('@azure/ai-voicelive');
const { AzureKeyCredential } = require('@azure/core-auth');

const ENDPOINT = process.env.VOICELIVE_ENDPOINT;
const API_KEY = process.env.VOICELIVE_API_KEY;
const DEPLOYMENT = process.env.VOICELIVE_DEPLOYMENT || 'gpt-4o';

function ts() { return new Date().toISOString().split('T')[1].replace('Z', ''); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Monkey-patch the ws module to log all messages
const WebSocket = require('ws');
const origSend = WebSocket.prototype.send;
WebSocket.prototype.send = function(data, ...args) {
  if (typeof data === 'string') {
    const parsed = JSON.parse(data);
    const type = parsed.type || 'unknown';
    if (type === 'input_audio_buffer.append') {
      const audioLen = parsed.audio ? parsed.audio.length : 0;
      console.log(`[${ts()}] WS SEND >> ${type} (audio base64 length: ${audioLen})`);
    } else {
      console.log(`[${ts()}] WS SEND >> ${type}:`, JSON.stringify(parsed, null, 2).substring(0, 500));
    }
  } else {
    console.log(`[${ts()}] WS SEND >> [binary, ${data.length} bytes]`);
  }
  return origSend.call(this, data, ...args);
};

async function main() {
  console.log(`[${ts()}] Connecting to ${ENDPOINT} with deployment ${DEPLOYMENT}...`);

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

  // Intercept incoming messages via onServerEvent
  let lastServerEvent = null;
  session.subscribe({
    onConnected: async () => console.log(`[${ts()}] + Connected event`),
    onDisconnected: async (a) => console.log(`[${ts()}] x Disconnected:`, JSON.stringify(a)),
    onError: async (a) => console.error(`[${ts()}] x Error: ${a.error.message}`),
    onResponseCreated: async () => console.log(`[${ts()}] <- response.created`),
    onResponseDone: async () => console.log(`[${ts()}] <- response.done`),
    onResponseTextDelta: async () => {},
    onResponseAudioTranscriptDelta: async () => {},
    onResponseAudioDelta: async () => {},
    onInputAudioBufferSpeechStarted: async () => console.log(`[${ts()}] <- speech.started`),
    onInputAudioBufferSpeechStopped: async () => console.log(`[${ts()}] <- speech.stopped`),
    onConversationItemInputAudioTranscriptionCompleted: async (e) => console.log(`[${ts()}] <- transcription: "${e.transcript}"`),
    onConversationItemInputAudioTranscriptionFailed: async () => console.log(`[${ts()}] <- transcription FAILED`),
    onInputAudioBufferCommitted: async () => console.log(`[${ts()}] <- buffer.committed`),
    onServerEvent: async (e) => {
      lastServerEvent = e;
      // Log ALL server events with full detail for errors
      const type = e.event?.type || e.type || 'unknown';
      if (type === 'error') {
        console.log(`[${ts()}] <- server ERROR:`, JSON.stringify(e, null, 2));
      } else if (!type.includes('audio_delta') && !type.includes('audio.delta')) {
        console.log(`[${ts()}] <- server: ${type}`, JSON.stringify(e).substring(0, 300));
      }
    },
  });

  // Configure session matching reference project exactly
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
  console.log(`[${ts()}] Session configured, waiting 2s...`);
  await sleep(2000);

  // Send a small chunk of silence
  console.log(`[${ts()}] Sending one small audio chunk (1024 bytes of silence)...`);
  const silence = new Uint8Array(1024);
  await session.sendAudio(silence);
  console.log(`[${ts()}] Chunk sent, waiting 5s...`);
  await sleep(5000);

  console.log(`[${ts()}] Done.`);
  try { await session.disconnect(); } catch {}
  process.exit(0);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
