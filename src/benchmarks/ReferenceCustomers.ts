export interface RefCustomer {
  name: string;
  category: string;
  voiceTech: string;
  paLevel: string;
  latency: string;
  pricing: string;
  differentiator: string;
}

export const referenceCustomers: RefCustomer[] = [
  {
    name: 'Duolingo',
    category: 'Gamified Learning',
    voiceTech: 'Custom TTS + ASR',
    paLevel: 'Limited (exercises)',
    latency: 'Async (not real-time)',
    pricing: 'Free / $7.99/mo Super',
    differentiator: 'Gamification, 500M+ users',
  },
  {
    name: 'ELSA Speak',
    category: 'Pronunciation Coach',
    voiceTech: 'Custom PA engine',
    paLevel: 'Phoneme-level scoring',
    latency: 'Near real-time (on-device)',
    pricing: '$11.99/mo Pro',
    differentiator: 'Deep pronunciation analytics',
  },
  {
    name: 'Speak (speakai)',
    category: 'AI Conversation',
    voiceTech: 'OpenAI GPT-4 + TTS',
    paLevel: 'Basic feedback',
    latency: '~1-2s turn latency',
    pricing: '$13.99/mo Premium',
    differentiator: 'Open-ended conversation',
  },
  {
    name: 'Babbel',
    category: 'Structured Courses',
    voiceTech: 'Speech recognition',
    paLevel: 'Word-level pass/fail',
    latency: 'Async',
    pricing: '$6.95-13.95/mo',
    differentiator: 'Native speaker audio, structured curriculum',
  },
  {
    name: 'Rosetta Stone',
    category: 'Immersion Method',
    voiceTech: 'TruAccent speech engine',
    paLevel: 'Sentence-level scoring',
    latency: 'Near real-time',
    pricing: '$11.99/mo',
    differentiator: 'Pure immersion, no translation',
  },
  {
    name: 'Speechling',
    category: 'Pronunciation Practice',
    voiceTech: 'Human coach + ASR',
    paLevel: 'Human review',
    latency: '24-48h (human feedback)',
    pricing: 'Free / $19.99/mo',
    differentiator: 'Human coach review, sentence dictation',
  },
];
