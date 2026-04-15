import { ScenarioBase } from '../ScenarioBase.js';
import { predefinedInstructions, predefinedInstructionsConcise, predefinedInstructionsReadAlong } from './prompts.js';
import type { ScenarioId } from '../../core/types.js';

export class FreeConversationScenario extends ScenarioBase {
  private mode: 'conversation' | 'concise' | 'readAlong' = 'conversation';

  get id(): ScenarioId { return 'free-conversation'; }
  get label(): string { return 'Free Conversation'; }
  get icon(): string { return '\u{1F3A4}'; }
  get enablePA(): boolean { return true; }

  getInstructions(): string {
    switch (this.mode) {
      case 'concise': return predefinedInstructionsConcise;
      case 'readAlong': return predefinedInstructionsReadAlong;
      default: return predefinedInstructions;
    }
  }

  renderControls(container: HTMLElement): void {
    container.innerHTML = `
      <h3 class="text-sm font-semibold text-white">Free Conversation + PA</h3>
      <p class="text-xs text-gray-500">Open conversation with real-time pronunciation assessment. Words are color-coded by accuracy.</p>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Mode</label>
        <div class="space-y-1.5">
          ${[
            { id: 'conversation', name: 'Conversation', desc: 'Natural chat with integrated pronunciation feedback' },
            { id: 'concise', name: 'Concise', desc: 'Short responses, quick correction cycles (<30 words)' },
            { id: 'readAlong', name: 'Read Along', desc: 'Bilingual shadowing with guided sentences (CN+EN)' },
          ].map(m => `
            <label class="fc-mode flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors
              ${m.id === 'conversation' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}">
              <input type="radio" name="fc-mode" value="${m.id}" ${m.id === 'conversation' ? 'checked' : ''} class="text-blue-500" />
              <div>
                <div class="font-medium text-gray-200">${m.name}</div>
                <div class="text-xs text-gray-500">${m.desc}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <div class="rounded-lg border border-gray-700 bg-gray-800/50 p-3 space-y-1">
        <h4 class="text-xs font-semibold text-gray-300">PA Color Legend</h4>
        <div class="flex flex-wrap gap-2 text-xs">
          <span class="pa-word-good">Good (&ge;80)</span>
          <span class="pa-word-fair">Fair (60-80)</span>
          <span class="pa-word-bad">Needs Work (&lt;60)</span>
          <span class="pa-word-omission">Omitted</span>
          <span class="pa-word-insertion">Inserted</span>
        </div>
      </div>
    `;

    container.querySelectorAll<HTMLInputElement>('input[name="fc-mode"]').forEach(r => {
      r.addEventListener('change', () => {
        this.mode = r.value as typeof this.mode;
        container.querySelectorAll('.fc-mode').forEach(lbl => {
          const input = lbl.querySelector('input[name="fc-mode"]') as HTMLInputElement;
          lbl.classList.toggle('border-blue-500', input.checked);
          lbl.classList.toggle('bg-blue-500/10', input.checked);
          lbl.classList.toggle('border-gray-700', !input.checked);
        });
      });
    });
  }
}
