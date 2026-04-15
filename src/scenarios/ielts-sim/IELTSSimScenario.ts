import { ScenarioBase } from '../ScenarioBase.js';
import { getIELTSPart1Prompt, getIELTSPart2Prompt } from './prompts.js';
import { ExamTimer } from './Timer.js';
import type { ScenarioId } from '../../core/types.js';

const TOPIC_CARDS = [
  `Describe a person you admire.
You should say:
- who this person is
- how you know this person
- what this person does
- and explain why you admire this person.`,
  `Describe a place you have visited that you particularly enjoyed.
You should say:
- where it was
- when you went there
- what you did there
- and explain why you enjoyed it.`,
  `Describe a skill you would like to learn.
You should say:
- what the skill is
- why you want to learn it
- how you would learn it
- and explain how this skill would be useful.`,
  `Describe an important event in your life.
You should say:
- what the event was
- when and where it happened
- who was involved
- and explain why it was important to you.`,
];

export class IELTSSimScenario extends ScenarioBase {
  private part: '1' | '2' = '1';
  private topicCard = TOPIC_CARDS[0];
  private timer?: ExamTimer;

  get id(): ScenarioId { return 'ielts-sim'; }
  get label(): string { return 'IELTS Sim'; }
  get icon(): string { return '\u{1F393}'; }

  getInstructions(): string {
    return this.part === '1'
      ? getIELTSPart1Prompt('')
      : getIELTSPart2Prompt(this.topicCard);
  }

  renderControls(container: HTMLElement): void {
    container.innerHTML = `
      <h3 class="text-sm font-semibold text-white">IELTS Speaking Simulation</h3>
      <p class="text-xs text-gray-500">Practice IELTS Speaking Part 1 (interview) or Part 2 (long turn) with an AI examiner.</p>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Part</label>
        <div class="flex gap-2">
          <button data-part="1" class="ielts-part flex-1 rounded-lg border border-blue-500 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400">
            Part 1 — Interview
          </button>
          <button data-part="2" class="ielts-part flex-1 rounded-lg border border-gray-700 px-3 py-2 text-sm font-medium text-gray-400 hover:border-gray-600">
            Part 2 — Long Turn
          </button>
        </div>
      </div>

      <div id="ielts-part2-controls" class="hidden space-y-3">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Topic Card</label>
          <div id="ielts-topic-card" class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-200 whitespace-pre-line">${this.topicCard}</div>
        </div>
        <button id="ielts-new-topic" class="w-full rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors">
          Generate New Topic
        </button>
        <div id="ielts-timer-area" class="text-center">
          <div id="ielts-timer-display" class="text-3xl font-bold tabular-nums text-gray-600">--:--</div>
          <div class="flex gap-2 mt-2">
            <button id="ielts-prep-timer" class="flex-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors">
              Start 1-min Prep
            </button>
            <button id="ielts-speak-timer" class="flex-1 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors">
              Start 2-min Speaking
            </button>
          </div>
        </div>
      </div>

      <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
        <h4 class="text-xs font-semibold text-gray-300 mb-1">Band Score Guide</h4>
        <div class="grid grid-cols-2 gap-1 text-[10px] text-gray-500">
          <span>Fluency & Coherence</span><span>Band 1-9</span>
          <span>Lexical Resource</span><span>Band 1-9</span>
          <span>Grammar Range</span><span>Band 1-9</span>
          <span>Pronunciation</span><span>Band 1-9</span>
        </div>
      </div>
    `;

    // Part toggle
    container.querySelectorAll<HTMLButtonElement>('.ielts-part').forEach(btn => {
      btn.addEventListener('click', () => {
        this.part = btn.dataset.part as '1' | '2';
        container.querySelectorAll<HTMLElement>('.ielts-part').forEach(b => {
          b.classList.toggle('border-blue-500', b.dataset.part === this.part);
          b.classList.toggle('bg-blue-500/10', b.dataset.part === this.part);
          b.classList.toggle('text-blue-400', b.dataset.part === this.part);
          b.classList.toggle('border-gray-700', b.dataset.part !== this.part);
          b.classList.toggle('text-gray-400', b.dataset.part !== this.part);
        });
        container.querySelector('#ielts-part2-controls')!.classList.toggle('hidden', this.part !== '2');
      });
    });

    // New topic button
    container.querySelector('#ielts-new-topic')?.addEventListener('click', () => {
      const idx = Math.floor(Math.random() * TOPIC_CARDS.length);
      this.topicCard = TOPIC_CARDS[idx];
      container.querySelector('#ielts-topic-card')!.textContent = this.topicCard;
    });

    // Timer buttons
    const timerDisplay = container.querySelector('#ielts-timer-display') as HTMLElement;
    const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

    container.querySelector('#ielts-prep-timer')?.addEventListener('click', () => {
      this.timer?.stop();
      this.timer = new ExamTimer(60, (r) => { timerDisplay.textContent = fmt(r); }, () => { timerDisplay.textContent = 'START!'; });
      timerDisplay.classList.remove('text-gray-600');
      timerDisplay.classList.add('text-blue-400');
      this.timer.start();
    });
    container.querySelector('#ielts-speak-timer')?.addEventListener('click', () => {
      this.timer?.stop();
      this.timer = new ExamTimer(120, (r) => { timerDisplay.textContent = fmt(r); }, () => { timerDisplay.textContent = 'TIME'; });
      timerDisplay.classList.remove('text-blue-400', 'text-gray-600');
      timerDisplay.classList.add('text-emerald-400');
      this.timer.start();
    });
  }

  onDeactivated(): void {
    this.timer?.stop();
  }
}
