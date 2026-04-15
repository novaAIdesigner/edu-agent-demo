import { ScenarioBase } from '../ScenarioBase.js';
import { getFSIDrillPrompt } from './prompts.js';
import type { ScenarioId } from '../../core/types.js';
import { buildLanguageOptions } from '../../core/types.js';

export class FSIDrillScenario extends ScenarioBase {
  private drillType = 'substitution';
  private language = 'English';
  private pattern = 'present tense verbs';

  get id(): ScenarioId { return 'fsi-drill'; }
  get label(): string { return 'FSI Drills'; }
  get icon(): string { return '\u{1F504}'; }
  get enablePA(): boolean { return true; }

  getInstructions(): string {
    return getFSIDrillPrompt(this.drillType, this.language, this.pattern);
  }

  renderControls(container: HTMLElement): void {
    container.innerHTML = `
      <h3 class="text-sm font-semibold text-white">FSI Pattern Drill</h3>
      <p class="text-xs text-gray-500">Foreign Service Institute rapid-fire drills for building fluency through mechanical repetition.</p>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Drill Type</label>
        <div class="space-y-1.5">
          ${['substitution','transformation','expansion'].map(dt => `
            <label class="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors
              ${dt === 'substitution' ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}">
              <input type="radio" name="drill-type" value="${dt}" ${dt === 'substitution' ? 'checked' : ''} class="text-blue-500" />
              <div>
                <div class="font-medium text-gray-200">${dt.charAt(0).toUpperCase() + dt.slice(1)}</div>
                <div class="text-xs text-gray-500">${dt === 'substitution' ? 'Replace one element with a cue word' : dt === 'transformation' ? 'Change sentence structure (tense, form)' : 'Add elements to build longer sentences'}</div>
              </div>
            </label>
          `).join('')}
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Target Language</label>
        <select id="fsi-lang" class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200">
          ${buildLanguageOptions('English')}
        </select>
      </div>

      <div>
        <label class="block text-xs font-medium text-gray-400 mb-1">Pattern / Focus</label>
        <input id="fsi-pattern" type="text" value="present tense verbs"
          class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-200 placeholder-gray-500"
          placeholder="e.g., past tense -ed, food vocabulary" />
      </div>
    `;

    container.querySelectorAll<HTMLInputElement>('input[name="drill-type"]').forEach(r => {
      r.addEventListener('change', () => {
        this.drillType = r.value;
        container.querySelectorAll('label').forEach(lbl => {
          const input = lbl.querySelector('input[name="drill-type"]') as HTMLInputElement | null;
          if (input) {
            lbl.classList.toggle('border-blue-500', input.checked);
            lbl.classList.toggle('bg-blue-500/10', input.checked);
            lbl.classList.toggle('border-gray-700', !input.checked);
          }
        });
      });
    });
    container.querySelector('#fsi-lang')?.addEventListener('change', (e) => {
      this.language = (e.target as HTMLSelectElement).value;
    });
    container.querySelector('#fsi-pattern')?.addEventListener('input', (e) => {
      this.pattern = (e.target as HTMLInputElement).value;
    });
  }
}
