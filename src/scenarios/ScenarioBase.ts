import { VoiceEngine } from '../core/VoiceEngine.js';
import { configManager } from '../core/config.js';
import { ConversationPanel } from '../ui/ConversationPanel.js';
import { AudioLevelMeter } from '../ui/AudioLevelMeter.js';
import type { ScenarioId, VoiceEngineConfig, ConversationMessage } from '../core/types.js';

export abstract class ScenarioBase {
  protected engine: VoiceEngine;
  protected panel: HTMLElement;
  protected conversationPanel!: ConversationPanel;
  protected levelMeter!: AudioLevelMeter;
  protected connectBtn!: HTMLButtonElement;
  protected startBtn!: HTMLButtonElement;

  constructor(engine: VoiceEngine) {
    this.engine = engine;
    this.panel = document.createElement('div');
    this.panel.className = 'flex h-full flex-col';
  }

  abstract get id(): ScenarioId;
  abstract get label(): string;
  abstract get icon(): string;
  abstract getInstructions(): string;
  abstract renderControls(container: HTMLElement): void;

  get enablePA(): boolean { return true; }
  get paWithReferenceText(): boolean { return true; }

  getPanel(): HTMLElement {
    return this.panel;
  }

  render(): void {
    this.panel.innerHTML = `
      <div class="relative flex flex-1 overflow-hidden max-w-screen-xl mx-auto w-full">
        <!-- Floating controls panel -->
        <div id="sidebar-${this.id}" class="absolute left-4 top-4 z-10 w-72 max-h-[calc(100%-2rem)] overflow-y-auto rounded-xl border border-gray-700 bg-gray-900/95 backdrop-blur-sm p-4 shadow-xl transition-transform">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wide">Controls</h3>
            <button id="sidebar-toggle-${this.id}" class="rounded-md p-1 text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors" title="Collapse panel">
              <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd"/></svg>
            </button>
          </div>
          <div id="scenario-controls-${this.id}" class="space-y-4"></div>
          <div class="mt-4 space-y-2">
            <button id="connect-${this.id}" class="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50 transition-colors">
              Connect
            </button>
            <button id="start-${this.id}" class="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 transition-colors" disabled>
              Start Conversation
            </button>
            <div id="level-${this.id}" class="mt-2"></div>
          </div>
        </div>
        <!-- Collapsed sidebar button -->
        <button id="sidebar-show-${this.id}" class="hidden absolute left-4 top-4 z-10 rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-sm p-2 shadow-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors" title="Show controls">
          <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/></svg>
        </button>
        <!-- Conversation area -->
        <div class="flex flex-1 flex-col overflow-hidden bg-gray-950">
          <div id="convo-${this.id}" class="flex-1 overflow-y-auto"></div>
        </div>
      </div>
    `;

    const controlsContainer = this.panel.querySelector(`#scenario-controls-${this.id}`) as HTMLElement;
    this.renderControls(controlsContainer);

    this.connectBtn = this.panel.querySelector(`#connect-${this.id}`) as HTMLButtonElement;
    this.startBtn = this.panel.querySelector(`#start-${this.id}`) as HTMLButtonElement;
    const convoEl = this.panel.querySelector(`#convo-${this.id}`) as HTMLElement;
    const levelEl = this.panel.querySelector(`#level-${this.id}`) as HTMLElement;

    this.conversationPanel = new ConversationPanel(convoEl);
    this.levelMeter = new AudioLevelMeter(levelEl);

    this.connectBtn.addEventListener('click', () => this.handleConnect());
    this.startBtn.addEventListener('click', () => this.handleStartStop());

    // Sidebar toggle
    const sidebar = this.panel.querySelector(`#sidebar-${this.id}`) as HTMLElement;
    const showBtn = this.panel.querySelector(`#sidebar-show-${this.id}`) as HTMLElement;
    this.panel.querySelector(`#sidebar-toggle-${this.id}`)?.addEventListener('click', () => {
      sidebar.classList.add('hidden');
      showBtn.classList.remove('hidden');
    });
    showBtn.addEventListener('click', () => {
      showBtn.classList.add('hidden');
      sidebar.classList.remove('hidden');
    });
  }

  private async handleConnect(): Promise<void> {
    if (this.engine.connected) {
      await this.engine.disconnect();
      this.connectBtn.textContent = 'Connect';
      this.startBtn.disabled = true;
      return;
    }

    const s = configManager.get();
    if (!s.endpoint) {
      alert('Please configure the Azure VoiceLive endpoint in Settings.');
      return;
    }

    const config: VoiceEngineConfig = {
      endpoint: s.endpoint,
      apiKey: s.authMethod === 'apikey' ? configManager.getApiKey() : undefined,
      useTokenCredential: s.authMethod === 'token',
      voice: s.voice,
      instructions: this.getInstructions(),
      debugMode: s.debugMode,
      enablePronunciationAssessment: this.enablePA,
      paWithReferenceText: this.paWithReferenceText,
      recognitionLanguage: s.recognitionLanguage,
      deploymentName: s.deploymentName,
    };

    this.engine.setScenarioId(this.id);
    this.engine.setCallbacks({
      onConnectionStatusChange: (st) => {
        this.connectBtn.textContent = st === 'connected' ? 'Disconnect' : 'Connect';
        this.startBtn.disabled = st !== 'connected';
      },
      onAssistantStatusChange: () => {},
      onConversationMessage: (msg) => this.conversationPanel.addMessage(msg),
      onConversationMessageUpdate: (msg) => this.conversationPanel.updateMessage(msg),
      onEventReceived: () => {},
      onError: (err) => this.conversationPanel.addMessage({ role: 'error', content: err, timestamp: new Date() }),
      onAudioLevel: (level) => this.levelMeter.setLevel(level),
    });

    try {
      this.connectBtn.textContent = 'Connecting...';
      this.connectBtn.disabled = true;
      await this.engine.connect(config);
    } catch {
      // error handled via callback
    } finally {
      this.connectBtn.disabled = false;
    }
  }

  private async handleStartStop(): Promise<void> {
    if (this.engine.conversationActive) {
      this.engine.stopConversation();
      this.startBtn.textContent = 'Start Conversation';
      this.startBtn.className = this.startBtn.className.replace('bg-red-600 hover:bg-red-500', 'bg-emerald-600 hover:bg-emerald-500');
    } else {
      await this.engine.startConversation();
      this.startBtn.textContent = 'Stop Conversation';
      this.startBtn.className = this.startBtn.className.replace('bg-emerald-600 hover:bg-emerald-500', 'bg-red-600 hover:bg-red-500');
    }
  }

  onActivated(): void {}
  onDeactivated(): void {}
}
