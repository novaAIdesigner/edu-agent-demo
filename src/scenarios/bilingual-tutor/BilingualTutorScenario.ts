import { ScenarioBase } from '../ScenarioBase.js';
import { getBilingualTutorPrompt } from './prompts.js';
import type { ScenarioId } from '../../core/types.js';
import { buildLanguageOptions } from '../../core/types.js';

export class BilingualTutorScenario extends ScenarioBase {
  private l1 = 'Chinese';
  private l2 = 'English';
  private level = 'intermediate';

  get id(): ScenarioId { return 'bilingual-tutor'; }
  get label(): string { return 'Bilingual Tutor'; }
  get icon(): string { return '\u{1F310}'; }

  getInstructions(): string {
    return getBilingualTutorPrompt(this.l1, this.l2, this.level);
  }

  renderControls(container: HTMLElement): void {
    container.innerHTML = `
      <h3 class="text-sm font-semibold text-white">Bilingual Tutor Mode</h3>
      <p class="text-xs text-gray-500">Practice a language with native-language scaffolding. Grammar in L1, practice in L2.</p>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Native Language (L1)</label>
        <select id="bt-l1" class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200">
          ${buildLanguageOptions('Chinese')}
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Target Language (L2)</label>
        <select id="bt-l2" class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200">
          ${buildLanguageOptions('English')}
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Proficiency Level</label>
        <div class="flex gap-2">
          ${['beginner','intermediate','advanced'].map(lv => `
            <button data-level="${lv}" class="bt-level flex-1 rounded-lg border px-2 py-1.5 text-xs font-medium transition-colors
              ${lv === 'intermediate' ? 'border-blue-500 bg-blue-500/10 text-blue-400' : 'border-gray-700 text-gray-400 hover:border-gray-600'}">
              ${lv.charAt(0).toUpperCase() + lv.slice(1)}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.querySelector('#bt-l1')?.addEventListener('change', (e) => {
      this.l1 = (e.target as HTMLSelectElement).value;
    });
    container.querySelector('#bt-l2')?.addEventListener('change', (e) => {
      this.l2 = (e.target as HTMLSelectElement).value;
    });
    container.querySelectorAll('.bt-level').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelectorAll('.bt-level').forEach(b => {
          b.classList.remove('border-blue-500', 'bg-blue-500/10', 'text-blue-400');
          b.classList.add('border-gray-700', 'text-gray-400');
        });
        btn.classList.add('border-blue-500', 'bg-blue-500/10', 'text-blue-400');
        btn.classList.remove('border-gray-700', 'text-gray-400');
        this.level = (btn as HTMLElement).dataset.level!;
      });
    });
  }
}
