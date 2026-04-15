import type { SkillDef } from './bilingual-tutor.js';

export const fsiPatternDrillSkill: SkillDef = {
  name: 'fsi-pattern-drill',
  emoji: '\u{1F504}',
  description: 'Run an FSI-style (Foreign Service Institute) pattern drill session with voice AI. Activated when the user asks for substitution drills, transformation drills, mechanical repetition practice, or FSI-method language exercises.',
  homepage: 'https://github.com/example/edu-agent-demo',
  allowedTools: ['bash'],
  requiredEnv: ['AZURE_VOICELIVE_ENDPOINT', 'AZURE_VOICELIVE_API_KEY'],
  body: `# FSI Pattern Drill

Runs rapid-fire substitution, transformation, or expansion drills following
the Foreign Service Institute methodology. The AI acts as a drill instructor,
presenting patterns and providing immediate correction.

## Drill Types

- **Substitution**: Replace one word in a sentence with a cue word
  - "I eat bread." CUE: rice → "I eat rice."
- **Transformation**: Change sentence structure (active→passive, tense changes)
  - "She goes to school." → past → "She went to school."
- **Expansion**: Add elements to build progressively longer sentences
  - "I go." → to school → "I go to school." → every day → "I go to school every day."

## Usage

\`\`\`
fsi-pattern-drill --type substitution --language english --pattern "present-tense-ar-verbs"
\`\`\`

## Behavior

1. AI presents a base sentence
2. Gives a cue or transformation instruction
3. User responds verbally
4. AI immediately confirms/corrects and gives next cue
5. Pace is rapid — no long explanations
6. Pronunciation errors below 60 accuracy are flagged briefly`,
};
