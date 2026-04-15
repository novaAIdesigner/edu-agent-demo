export interface SkillDef {
  name: string;
  emoji: string;
  description: string;
  homepage: string;
  allowedTools: string[];
  requiredEnv: string[];
  body: string;
}

export const bilingualTutorSkill: SkillDef = {
  name: 'bilingual-tutor',
  emoji: '\u{1F310}',
  description: 'Launch a bilingual language tutoring session using Azure VoiceLive. Activated when the user asks to practice a language with native-language scaffolding, wants bilingual code-switching conversation practice, or requests L1/L2 tutor mode.',
  homepage: 'https://github.com/example/edu-agent-demo',
  allowedTools: ['bash', 'browser'],
  requiredEnv: ['AZURE_VOICELIVE_ENDPOINT', 'AZURE_VOICELIVE_API_KEY'],
  body: `# Bilingual Tutor

Starts an interactive voice session where the AI switches between the learner's
native language (L1) and target language (L2). Grammar explanations happen in L1,
practice drills in L2, with progressive reduction of L1 dependency.

## Usage

\`\`\`
bilingual-tutor --l1 chinese --l2 english --level intermediate
\`\`\`

## Behavior

1. Opens Azure VoiceLive WebSocket session with bilingual system prompt
2. Captures microphone at 24kHz PCM16 mono
3. Pronunciation assessment runs on L2 utterances via Azure Speech SDK
4. Feedback integrates naturally into tutoring flow
5. L1 scaffolding reduces as learner improves

## Language Pairs Supported

- Chinese + English (default)
- Spanish + English
- Japanese + English
- Korean + English
- French + English

## Integration Notes

- Requires Azure VoiceLive endpoint and API key
- Uses \`gpt-4o\` model via VoiceLive session
- PA uses phoneme-level granularity with prosody assessment
- Voice: configurable (default: \`alloy\`)`,
};
