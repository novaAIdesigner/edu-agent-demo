import type { SkillDef } from './bilingual-tutor.js';

export const ieltsExamSimSkill: SkillDef = {
  name: 'ielts-exam-sim',
  emoji: '\u{1F393}',
  description: 'Simulate an IELTS Speaking exam (Part 1 and Part 2) with live voice AI. Activated when the user wants IELTS speaking practice, mock exam simulation, band score estimation, or exam preparation with timed responses.',
  homepage: 'https://github.com/example/edu-agent-demo',
  allowedTools: ['bash'],
  requiredEnv: ['AZURE_VOICELIVE_ENDPOINT', 'AZURE_VOICELIVE_API_KEY'],
  body: `# IELTS Speaking Exam Simulation

Full simulation of IELTS Speaking Test Part 1 (interview) and Part 2 (long turn).
The AI acts as an IELTS examiner, times responses, and provides Band scoring
across four dimensions.

## Parts

### Part 1: Interview (4-5 minutes)
- 8-12 questions on familiar topics (home, work, hobbies, daily routine)
- Warm-up questions followed by topic-specific questions
- Tests basic communication ability

### Part 2: Long Turn (3-4 minutes)
- Topic card provided with bullet points
- 1 minute preparation time (timed by client)
- 1-2 minute monologue (timed by client)
- 1-2 follow-up questions from examiner

## Scoring

Band   | Fluency & Coherence | Lexical Resource | Grammar | Pronunciation
-------|---------------------|-----------------|---------|---------------
7-9    | Speaks at length    | Wide range      | Complex | Clear, natural
5-6    | Some hesitation     | Adequate        | Mix     | Generally clear
3-4    | Long pauses         | Limited         | Errors  | Difficult

## Usage

\`\`\`
ielts-exam-sim --part 1 --topic "hometown"
ielts-exam-sim --part 2
\`\`\`

## After Exam

Provides detailed band score breakdown with justification for each dimension.
Pronunciation band leverages Azure PA JSON data for objective scoring.`,
};
