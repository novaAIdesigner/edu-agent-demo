import type { TurnLatencyTrace, TurnMetric, ScenarioId } from './types.js';

// Azure GPT-4o Realtime pricing estimates (per minute of audio)
const COST_INPUT_PER_MIN = 0.06;   // $0.06/min audio input
const COST_OUTPUT_PER_MIN = 0.24;  // $0.24/min audio output
const TOKENS_PER_SECOND_IN = 50;   // ~50 tokens/sec input estimate
const TOKENS_PER_SECOND_OUT = 30;  // ~30 tokens/sec output estimate

export class LatencyTracker {
  private metrics: TurnMetric[] = [];

  recordTurn(trace: TurnLatencyTrace, scenarioId: ScenarioId): TurnMetric {
    const speechToFirst = trace.firstAudioChunkAt != null
      ? Math.round(trace.firstAudioChunkAt - trace.speechStoppedAt)
      : null;

    const speechToPA = trace.paResultReadyAt != null
      ? Math.round(trace.paResultReadyAt - trace.speechStoppedAt)
      : null;

    const paIO = trace.paInputAt != null && trace.paOutputAt != null
      ? Math.round(trace.paOutputAt - trace.paInputAt)
      : null;

    const streamCloseToPA = trace.paStreamClosedAt != null && trace.paResultReadyAt != null
      ? Math.round(trace.paResultReadyAt - trace.paStreamClosedAt)
      : null;

    const totalResponse = speechToFirst; // best proxy for perceived latency

    // Rough token/cost estimation
    const audioDurSec = 3; // avg user turn ~3s
    const responseDurSec = speechToFirst ? speechToFirst / 1000 + 2 : 3;
    const inputTokensEst = Math.round(audioDurSec * TOKENS_PER_SECOND_IN);
    const outputTokensEst = Math.round(responseDurSec * TOKENS_PER_SECOND_OUT);
    const costEstUSD = +(
      (audioDurSec / 60) * COST_INPUT_PER_MIN +
      (responseDurSec / 60) * COST_OUTPUT_PER_MIN
    ).toFixed(4);

    const metric: TurnMetric = {
      turnId: trace.turnId,
      timestamp: new Date(),
      scenarioId,
      speechToFirstAudioMs: speechToFirst,
      speechToPAResultMs: speechToPA,
      paIOMs: paIO,
      streamCloseToPAMs: streamCloseToPA,
      totalResponseMs: totalResponse,
      inputTokensEst,
      outputTokensEst,
      costEstUSD,
    };

    this.metrics.push(metric);
    return metric;
  }

  getAll(): TurnMetric[] {
    return [...this.metrics];
  }

  getSessionSummary() {
    const m = this.metrics;
    if (m.length === 0) {
      return {
        turns: 0,
        avgSpeechToFirstAudioMs: 0,
        avgPAIOMs: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostUSD: 0,
      };
    }

    const valid = (arr: (number | null)[]) => arr.filter((v): v is number => v != null);
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    return {
      turns: m.length,
      avgSpeechToFirstAudioMs: avg(valid(m.map(t => t.speechToFirstAudioMs))),
      avgPAIOMs: avg(valid(m.map(t => t.paIOMs))),
      totalInputTokens: m.reduce((s, t) => s + t.inputTokensEst, 0),
      totalOutputTokens: m.reduce((s, t) => s + t.outputTokensEst, 0),
      totalCostUSD: +m.reduce((s, t) => s + t.costEstUSD, 0).toFixed(4),
    };
  }

  buildLatencyLabel(trace: TurnLatencyTrace): string {
    const paLatency =
      trace.paInputAt != null && trace.paOutputAt != null
        ? `${Math.round(trace.paOutputAt - trace.paInputAt)} ms`
        : 'N/A';
    const e2eLatency =
      trace.firstAudioChunkAt != null
        ? `${Math.round(trace.firstAudioChunkAt - trace.speechStoppedAt)} ms`
        : 'pending';

    return `PA: ${paLatency} | E2E: ${e2eLatency}`;
  }

  clear(): void {
    this.metrics = [];
  }
}
