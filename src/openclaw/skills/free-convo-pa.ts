import type { SkillDef } from './bilingual-tutor.js';

export const freeConvoPASkill: SkillDef = {
  name: 'free-convo-pa',
  emoji: '\u{1F3A4}',
  description: 'Start a free conversation with real-time pronunciation assessment feedback. Activated when the user wants open conversation practice with pronunciation coaching, word-level scoring, or PA-enhanced speaking practice.',
  homepage: 'https://github.com/example/edu-agent-demo',
  allowedTools: ['bash'],
  requiredEnv: ['AZURE_VOICELIVE_ENDPOINT', 'AZURE_VOICELIVE_API_KEY'],
  body: `# Free Conversation with Pronunciation Assessment

Natural conversation on any topic with real-time Azure Speech SDK pronunciation
assessment. Each user utterance receives word-level accuracy scores with color-coded
feedback.

## Modes

- **Conversation**: Natural chat with integrated pronunciation feedback (up to 4 sentences)
- **Concise**: Short responses (<30 words), focused on quick correction cycles
- **Read Along**: Bilingual (Chinese+English) shadowing exercises with guided sentences

## Pronunciation Scoring

- **Good** (green): Accuracy score >= 80
- **Fair** (orange): Accuracy score 60-80
- **Needs Work** (red): Accuracy score < 60
- **Omission**: Word was skipped
- **Insertion**: Extra word detected

## Azure PA Features Used

- Phoneme-level granularity
- Prosody assessment enabled
- HundredMark grading system
- Reference text mode (with transcript) and streaming mode

## Usage

\`\`\`
free-convo-pa --mode conversation
free-convo-pa --mode read-along --l1 chinese
free-convo-pa --mode concise
\`\`\`

## Technical Details

- Audio captured at 24kHz PCM16 mono → resampled to 16kHz for PA
- PA results injected into VoiceLive response via \`additionalInstructions\`
- Supports barge-in interruption during AI speech`,
};
