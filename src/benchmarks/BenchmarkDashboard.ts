import type { TurnMetric } from '../core/types.js';
import { referenceCustomers, type RefCustomer } from './ReferenceCustomers.js';

export class BenchmarkDashboard {
  private panel: HTMLElement;
  private metrics: TurnMetric[] = [];

  constructor() {
    this.panel = document.createElement('div');
    this.panel.className = 'p-6 space-y-6 max-w-screen-xl mx-auto';
  }

  getPanel(): HTMLElement {
    return this.panel;
  }

  addMetric(m: TurnMetric): void {
    this.metrics.push(m);
    this.refresh();
  }

  setMetrics(metrics: TurnMetric[]): void {
    this.metrics = metrics;
    this.refresh();
  }

  render(): void {
    this.refresh();
  }

  private refresh(): void {
    const m = this.metrics;
    const valid = (arr: (number | null)[]) => arr.filter((v): v is number => v != null);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
    const totalCost = m.reduce((s, t) => s + t.costEstUSD, 0);
    const totalIn = m.reduce((s, t) => s + t.inputTokensEst, 0);
    const totalOut = m.reduce((s, t) => s + t.outputTokensEst, 0);
    const avgS2F = avg(valid(m.map(t => t.speechToFirstAudioMs)));
    const avgPAIO = avg(valid(m.map(t => t.paIOMs)));
    const avgS2PA = avg(valid(m.map(t => t.speechToPAResultMs)));

    this.panel.innerHTML = `
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-4 lg:grid-cols-4">
        ${this.card('Total Turns', String(m.length), 'Sessions recorded')}
        ${this.card('Avg Speech-to-Audio', avgS2F ? `${avgS2F} ms` : '--', 'Time from speech end to first TTS chunk')}
        ${this.card('Avg PA I/O', avgPAIO ? `${avgPAIO} ms` : '--', 'Pronunciation assessment processing time')}
        ${this.card('Est. Session Cost', `$${totalCost.toFixed(4)}`, `${totalIn} in / ${totalOut} out tokens`)}
      </div>

      <!-- Latency Chart -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 class="text-sm font-semibold text-white mb-4">Per-Turn Latency (ms)</h3>
        ${m.length === 0
          ? '<p class="text-sm text-gray-600 text-center py-8">No data yet. Start a conversation to collect metrics.</p>'
          : `<div class="overflow-x-auto"><table class="w-full text-xs">
              <thead>
                <tr class="border-b border-gray-700 text-left text-gray-500">
                  <th class="pb-2 pr-4">Turn</th>
                  <th class="pb-2 pr-4">Scenario</th>
                  <th class="pb-2 pr-4">S2TTS1st</th>
                  <th class="pb-2 pr-4">PA I/O</th>
                  <th class="pb-2 pr-4">S2PAResult</th>
                  <th class="pb-2 pr-4">StreamClose</th>
                  <th class="pb-2 pr-4">Tokens (in/out)</th>
                  <th class="pb-2">Cost</th>
                </tr>
              </thead>
              <tbody>
                ${m.map(t => `
                  <tr class="border-b border-gray-800">
                    <td class="py-1.5 pr-4 font-mono text-gray-300">#${t.turnId}</td>
                    <td class="py-1.5 pr-4 text-gray-400">${t.scenarioId}</td>
                    <td class="py-1.5 pr-4 font-mono ${this.latencyColor(t.speechToFirstAudioMs)}">${t.speechToFirstAudioMs ?? '--'}</td>
                    <td class="py-1.5 pr-4 font-mono ${this.latencyColor(t.paIOMs)}">${t.paIOMs ?? '--'}</td>
                    <td class="py-1.5 pr-4 font-mono text-gray-400">${t.speechToPAResultMs ?? '--'}</td>
                    <td class="py-1.5 pr-4 font-mono text-gray-400">${t.streamCloseToPAMs ?? '--'}</td>
                    <td class="py-1.5 pr-4 font-mono text-gray-400">${t.inputTokensEst}/${t.outputTokensEst}</td>
                    <td class="py-1.5 font-mono text-gray-400">$${t.costEstUSD.toFixed(4)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table></div>`
        }
      </div>

      <!-- Latency Thresholds Reference -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 class="text-sm font-semibold text-white mb-3">Conversational AI Latency Benchmarks</h3>
        <div class="grid grid-cols-4 gap-3 text-center text-xs">
          <div class="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
            <div class="text-lg font-bold text-emerald-400">0-300ms</div>
            <div class="text-gray-300">Instant</div>
            <div class="text-gray-500">Ideal for real-time</div>
          </div>
          <div class="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
            <div class="text-lg font-bold text-amber-400">300-500ms</div>
            <div class="text-gray-300">Noticeable</div>
            <div class="text-gray-500">Acceptable</div>
          </div>
          <div class="rounded-lg bg-orange-500/10 border border-orange-500/30 p-3">
            <div class="text-lg font-bold text-orange-400">500ms-1s</div>
            <div class="text-gray-300">Awkward pause</div>
            <div class="text-gray-500">Marginal</div>
          </div>
          <div class="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
            <div class="text-lg font-bold text-red-400">&gt;1s</div>
            <div class="text-gray-300">Degraded UX</div>
            <div class="text-gray-500">Poor</div>
          </div>
        </div>
      </div>

      <!-- Cost Breakdown Reference -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 class="text-sm font-semibold text-white mb-3">Azure GPT-4o Realtime Pricing Reference</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-700 text-left text-gray-500">
                <th class="pb-2 pr-4">Component</th>
                <th class="pb-2 pr-4">Rate</th>
                <th class="pb-2">Notes</th>
              </tr>
            </thead>
            <tbody class="text-gray-400">
              <tr class="border-b border-gray-800"><td class="py-1.5 pr-4">Audio Input</td><td class="py-1.5 pr-4 font-mono">$0.06/min</td><td class="py-1.5">User speech captured via mic</td></tr>
              <tr class="border-b border-gray-800"><td class="py-1.5 pr-4">Audio Output</td><td class="py-1.5 pr-4 font-mono">$0.24/min</td><td class="py-1.5">AI-generated speech response</td></tr>
              <tr class="border-b border-gray-800"><td class="py-1.5 pr-4">Text Input</td><td class="py-1.5 pr-4 font-mono">$5.00/1M tokens</td><td class="py-1.5">System prompt + instructions</td></tr>
              <tr><td class="py-1.5 pr-4">Text Output</td><td class="py-1.5 pr-4 font-mono">$20.00/1M tokens</td><td class="py-1.5">Text-mode responses</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Reference Customers -->
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 class="text-sm font-semibold text-white mb-3">Reference: AI Language Learning Platforms</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="border-b border-gray-700 text-left text-gray-500">
                <th class="pb-2 pr-4">Platform</th>
                <th class="pb-2 pr-4">Category</th>
                <th class="pb-2 pr-4">Voice Tech</th>
                <th class="pb-2 pr-4">PA Level</th>
                <th class="pb-2 pr-4">Latency</th>
                <th class="pb-2 pr-4">Pricing</th>
                <th class="pb-2">Differentiator</th>
              </tr>
            </thead>
            <tbody class="text-gray-400">
              ${referenceCustomers.map((c: RefCustomer) => `
                <tr class="border-b border-gray-800">
                  <td class="py-1.5 pr-4 font-medium text-gray-300">${c.name}</td>
                  <td class="py-1.5 pr-4">${c.category}</td>
                  <td class="py-1.5 pr-4">${c.voiceTech}</td>
                  <td class="py-1.5 pr-4">${c.paLevel}</td>
                  <td class="py-1.5 pr-4">${c.latency}</td>
                  <td class="py-1.5 pr-4">${c.pricing}</td>
                  <td class="py-1.5">${c.differentiator}</td>
                </tr>
              `).join('')}
              <tr class="bg-blue-500/10 font-medium">
                <td class="py-1.5 pr-4 text-blue-400">EduVoice AI (This Demo)</td>
                <td class="py-1.5 pr-4 text-gray-300">Full-stack Voice AI</td>
                <td class="py-1.5 pr-4 text-gray-300">Azure VoiceLive + PA</td>
                <td class="py-1.5 pr-4 text-gray-300">Phoneme-level + Prosody</td>
                <td class="py-1.5 pr-4 text-gray-300">&lt;500ms real-time</td>
                <td class="py-1.5 pr-4 text-gray-300">Pay-per-use</td>
                <td class="py-1.5 text-gray-300">4 integrated scenarios + OpenClaw skills</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private card(title: string, value: string, subtitle: string): string {
    return `
      <div class="rounded-xl border border-gray-800 bg-gray-900/60 p-4">
        <div class="text-xs font-medium text-gray-500">${title}</div>
        <div class="mt-1 text-2xl font-bold text-white">${value}</div>
        <div class="mt-0.5 text-[10px] text-gray-600">${subtitle}</div>
      </div>
    `;
  }

  private latencyColor(ms: number | null): string {
    if (ms == null) return 'text-gray-500';
    if (ms < 300) return 'text-emerald-400';
    if (ms < 500) return 'text-amber-400';
    if (ms < 1000) return 'text-orange-400';
    return 'text-red-400';
  }
}
