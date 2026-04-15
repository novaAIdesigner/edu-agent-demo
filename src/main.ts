import './style.css';
import { VoiceEngine } from './core/VoiceEngine.js';
import { NavTabs } from './ui/NavTabs.js';
import { SettingsPanel } from './ui/SettingsPanel.js';
import { StatusBar } from './ui/StatusBar.js';
import { ErrorModal } from './ui/ErrorModal.js';
import { CoverPage } from './ui/CoverPage.js';
import { BilingualTutorScenario } from './scenarios/bilingual-tutor/BilingualTutorScenario.js';
import { FSIDrillScenario } from './scenarios/fsi-drill/FSIDrillScenario.js';
import { IELTSSimScenario } from './scenarios/ielts-sim/IELTSSimScenario.js';
import { FreeConversationScenario } from './scenarios/free-conversation/FreeConversationScenario.js';
import { BenchmarkDashboard } from './benchmarks/BenchmarkDashboard.js';
import { OpenClawSection } from './openclaw/OpenClawSection.js';

// SVG icon helper — returns inline SVG string for tab icons
function tabIcon(path: string): string {
  return `<svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

const icons = {
  home: tabIcon('<path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>'),
  bilingual: tabIcon('<path d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5"/>'),
  fsi: tabIcon('<path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"/>'),
  ielts: tabIcon('<path d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"/>'),
  convo: tabIcon('<path d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"/>'),
  benchmarks: tabIcon('<path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"/>'),
  openclaw: tabIcon('<path d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959v0a.64.64 0 0 1-.657.643 48.491 48.491 0 0 1-4.163-.3c.186 1.613.293 3.25.315 4.907a.656.656 0 0 1-.658.663v0c-.355 0-.676-.186-.959-.401a1.647 1.647 0 0 0-1.003-.349c-1.036 0-1.875 1.007-1.875 2.25s.84 2.25 1.875 2.25c.369 0 .713-.128 1.003-.349.283-.215.604-.401.959-.401v0c.31 0 .555.26.532.57a48.039 48.039 0 0 1-.642 5.056c1.518.19 3.058.309 4.616.354a.64.64 0 0 0 .657-.643v0c0-.355-.186-.676-.401-.959a1.647 1.647 0 0 1-.349-1.003c0-1.035 1.008-1.875 2.25-1.875 1.243 0 2.25.84 2.25 1.875 0 .369-.128.713-.349 1.003-.215.283-.4.604-.4.959v0c0 .333.277.599.61.58a48.1 48.1 0 0 0 5.427-.63 48.05 48.05 0 0 0 .582-4.717.532.532 0 0 0-.533-.57v0c-.355 0-.676.186-.959.401-.29.221-.634.349-1.003.349-1.035 0-1.875-1.007-1.875-2.25s.84-2.25 1.875-2.25c.37 0 .713.128 1.003.349.283.215.604.401.96.401v0a.656.656 0 0 0 .658-.663 48.422 48.422 0 0 0-.37-5.36c-1.886.342-3.81.574-5.766.689a.578.578 0 0 1-.61-.58v0Z"/>'),
};

function init() {
  // Core engine (shared across scenarios)
  const engine = new VoiceEngine();

  // UI pieces
  const statusBar = new StatusBar(
    document.getElementById('conn-dot')!,
    document.getElementById('conn-label')!,
    document.getElementById('assistant-status')!,
  );

  const settingsPanel = new SettingsPanel(
    document.getElementById('settings-container')!,
    document.getElementById('settings-sidebar')!,
    document.getElementById('settings-toggle')!,
  );
  settingsPanel.render();

  const errorModal = new ErrorModal();

  // Cover page
  const coverPage = new CoverPage();
  coverPage.render();

  // Tabs
  const navTabs = new NavTabs(
    document.getElementById('tab-buttons')!,
    document.getElementById('tab-content')!,
  );

  // Scenarios
  const bilingual = new BilingualTutorScenario(engine);
  const fsi = new FSIDrillScenario(engine);
  const ielts = new IELTSSimScenario(engine);
  const freeConvo = new FreeConversationScenario(engine);

  bilingual.render();
  fsi.render();
  ielts.render();
  freeConvo.render();

  // Benchmarks
  const benchmarks = new BenchmarkDashboard();
  benchmarks.render();

  // OpenClaw
  const openclaw = new OpenClawSection();
  openclaw.render();

  // Register tabs
  navTabs.registerTab('home', 'Overview', icons.home, coverPage.getPanel());
  navTabs.registerTab('bilingual-tutor', 'Bilingual Tutor', icons.bilingual, bilingual.getPanel());
  navTabs.registerTab('fsi-drill', 'FSI Drills', icons.fsi, fsi.getPanel());
  navTabs.registerTab('ielts-sim', 'IELTS Sim', icons.ielts, ielts.getPanel());
  navTabs.registerTab('free-conversation', 'Free Conversation', icons.convo, freeConvo.getPanel());
  navTabs.registerTab('benchmarks', 'Benchmarks', icons.benchmarks, benchmarks.getPanel());
  navTabs.registerTab('openclaw', 'OpenClaw Skills', icons.openclaw, openclaw.getPanel());

  // Disconnect old scenario when switching tabs
  const scenarios = [bilingual, fsi, ielts, freeConvo];
  navTabs.onTabSwitch(async (from, to) => {
    const fromScenario = scenarios.find(s => s.id === from);
    const toScenario = scenarios.find(s => s.id === to);
    if (fromScenario && engine.connected) {
      engine.stopConversation();
      await engine.disconnect();
    }
    fromScenario?.onDeactivated();
    toScenario?.onActivated();

    // Feed latency metrics to benchmark dashboard
    benchmarks.setMetrics(engine.latencyTracker.getAll());
  });

  navTabs.render();

  // Global status callback overlay — update header status from any scenario
  const origSetCallbacks = engine.setCallbacks.bind(engine);
  engine.setCallbacks = (cb) => {
    origSetCallbacks({
      ...cb,
      onConnectionStatusChange: (s) => {
        statusBar.setConnectionStatus(s);
        cb.onConnectionStatusChange(s);
      },
      onAssistantStatusChange: (s) => {
        statusBar.setAssistantStatus(s);
        cb.onAssistantStatusChange(s);
      },
      onError: (e) => {
        errorModal.show(e);
        cb.onError(e);
      },
      onLatencyMetric: (m) => {
        benchmarks.addMetric(m);
        cb.onLatencyMetric?.(m);
      },
    });
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    engine.cleanup();
  });
}

document.addEventListener('DOMContentLoaded', init);
