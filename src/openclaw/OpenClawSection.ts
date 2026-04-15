import type { SkillDef } from './skills/bilingual-tutor.js';
import { bilingualTutorSkill } from './skills/bilingual-tutor.js';
import { fsiPatternDrillSkill } from './skills/fsi-pattern-drill.js';
import { ieltsExamSimSkill } from './skills/ielts-exam-sim.js';
import { freeConvoPASkill } from './skills/free-convo-pa.js';

const allSkills: SkillDef[] = [bilingualTutorSkill, fsiPatternDrillSkill, ieltsExamSimSkill, freeConvoPASkill];

export class OpenClawSection {
  private panel: HTMLElement;

  constructor() {
    this.panel = document.createElement('div');
    this.panel.className = 'p-6 max-w-screen-xl mx-auto space-y-6';
  }

  getPanel(): HTMLElement {
    return this.panel;
  }

  render(): void {
    this.panel.innerHTML = `
      <!-- Overview -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h2 class="text-lg font-bold text-white mb-2">OpenClaw Agent Skills</h2>
        <p class="text-sm text-gray-400 leading-relaxed mb-3">
          <a href="https://openclawpulse.com/openclaw-skills-guide/" target="_blank" class="text-blue-400 underline hover:text-blue-300">OpenClaw</a>
          is an open-source agent framework where capabilities are packaged as <strong class="text-gray-300">skills</strong> &mdash; modular directories with a
          <code class="bg-gray-800 px-1 py-0.5 rounded text-xs text-gray-300 ring-1 ring-gray-700">SKILL.md</code> file defining metadata and instructions.
          Below are 4 ready-to-use skills for the educational voice AI scenarios in this demo.
        </p>
        <div class="grid grid-cols-3 gap-3 text-xs text-center">
          <div class="rounded-lg bg-gray-800/50 border border-gray-700 p-3">
            <div class="font-semibold text-gray-300">Progressive Disclosure</div>
            <div class="text-gray-500 mt-1">Metadata always loaded. Body loads on trigger. References on demand.</div>
          </div>
          <div class="rounded-lg bg-gray-800/50 border border-gray-700 p-3">
            <div class="font-semibold text-gray-300">Activation via Description</div>
            <div class="text-gray-500 mt-1">The description field determines when OpenClaw triggers a skill.</div>
          </div>
          <div class="rounded-lg bg-gray-800/50 border border-gray-700 p-3">
            <div class="font-semibold text-gray-300">ClawHub Distribution</div>
            <div class="text-gray-500 mt-1">Skills can be published and shared via ClawHub package registry.</div>
          </div>
        </div>
      </div>

      <!-- Skill Cards -->
      <div class="grid gap-6 lg:grid-cols-2">
        ${allSkills.map(s => this.renderSkillCard(s)).join('')}
      </div>

      <!-- Integration Guide -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 class="text-sm font-semibold text-white mb-3">Quick Integration</h3>
        <div class="skill-code">
<span class="text-gray-500"># Install all 4 skills from ClawHub</span>
clawhub install edu-bilingual-tutor
clawhub install edu-fsi-pattern-drill
clawhub install edu-ielts-exam-sim
clawhub install edu-free-convo-pa

<span class="text-gray-500"># Or copy skill directories into your workspace</span>
cp -r skills/bilingual-tutor /path/to/openclaw/skills/
cp -r skills/fsi-pattern-drill /path/to/openclaw/skills/

<span class="text-gray-500"># Set required environment variables</span>
export AZURE_VOICELIVE_ENDPOINT="wss://your-endpoint/v1"
export AZURE_VOICELIVE_API_KEY="your-key-here"
        </div>
      </div>
    `;

    // Wire up copy buttons
    this.panel.querySelectorAll<HTMLButtonElement>('.copy-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const skillName = btn.dataset.skill!;
        const skill = allSkills.find(s => s.name === skillName);
        if (skill) {
          navigator.clipboard.writeText(this.buildSkillMd(skill));
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy SKILL.md'; }, 2000);
        }
      });
    });

    // Wire up expand toggles
    this.panel.querySelectorAll<HTMLButtonElement>('.expand-skill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.closest('.skill-card')?.querySelector('.skill-body') as HTMLElement;
        if (target) {
          target.classList.toggle('hidden');
          btn.textContent = target.classList.contains('hidden') ? 'Show Full SKILL.md' : 'Hide';
        }
      });
    });
  }

  private renderSkillCard(skill: SkillDef): string {
    return `
      <div class="skill-card rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden glow-card">
        <div class="p-5">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xl">${skill.emoji}</span>
            <h3 class="text-sm font-bold text-white font-mono">${skill.name}</h3>
          </div>
          <p class="text-xs text-gray-400 leading-relaxed mb-3">${skill.description}</p>

          <!-- Frontmatter -->
          <div class="rounded-lg bg-gray-800/50 border border-gray-700 p-3 text-xs space-y-1 mb-3">
            <div><span class="text-gray-500">name:</span> <span class="font-mono text-gray-300">${skill.name}</span></div>
            <div><span class="text-gray-500">allowed-tools:</span> <span class="font-mono text-gray-300">[${skill.allowedTools.map(t => `"${t}"`).join(', ')}]</span></div>
            <div><span class="text-gray-500">requires.env:</span> <span class="font-mono text-gray-300">[${skill.requiredEnv.map(e => `"${e}"`).join(', ')}]</span></div>
            <div><span class="text-gray-500">homepage:</span> <span class="font-mono text-gray-300">${skill.homepage}</span></div>
          </div>

          <div class="flex gap-2">
            <button class="expand-skill-btn rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-300 transition-colors">
              Show Full SKILL.md
            </button>
            <button class="copy-skill-btn rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 transition-colors" data-skill="${skill.name}">
              Copy SKILL.md
            </button>
          </div>
        </div>

        <div class="skill-body hidden border-t border-gray-800 bg-gray-950/50 p-4">
          <pre class="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">${this.escHtml(this.buildSkillMd(skill))}</pre>
        </div>
      </div>
    `;
  }

  private buildSkillMd(skill: SkillDef): string {
    return `---
name: ${skill.name}
description: >
  ${skill.description}
homepage: ${skill.homepage}
allowed-tools: [${skill.allowedTools.map(t => `"${t}"`).join(', ')}]
metadata:
  openclaw:
    emoji: "${skill.emoji}"
    requires:
      env:
${skill.requiredEnv.map(e => `        - ${e}`).join('\n')}
---

${skill.body}`;
  }

  private escHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}
