import { configManager, type AppSettings } from '../core/config.js';

export class SettingsPanel {
  private container: HTMLElement;
  private sidebar: HTMLElement;
  private toggleBtn: HTMLElement;
  private onChange?: () => void;
  private flashTimer = 0;

  constructor(container: HTMLElement, sidebar: HTMLElement, toggleBtn: HTMLElement) {
    this.container = container;
    this.sidebar = sidebar;
    this.toggleBtn = toggleBtn;
    this.toggleBtn.addEventListener('click', () => this.toggle());
  }

  onSettingsChange(fn: () => void): void {
    this.onChange = fn;
  }

  render(): void {
    const s = configManager.get();
    this.container.innerHTML = `
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-white">Settings</h2>
          <button id="settings-close" class="text-gray-500 hover:text-gray-300 transition-colors text-xl">&times;</button>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Azure VoiceLive Endpoint</label>
          <input id="s-endpoint" type="text" value="${this.esc(s.endpoint)}"
            class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            placeholder="https://your-resource.cognitiveservices.azure.com/" />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Model Deployment Name</label>
          <input id="s-deployment" type="text" value="${this.esc(s.deploymentName)}"
            class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            placeholder="gpt-4o" />
          <p class="mt-1 text-[10px] text-gray-500">Must match your Azure AI deployment name exactly</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Authentication</label>
          <div class="flex gap-3">
            <label class="flex items-center gap-1.5 text-sm text-gray-300">
              <input type="radio" name="auth" value="apikey" ${s.authMethod === 'apikey' ? 'checked' : ''} class="text-blue-500" />
              API Key
            </label>
            <label class="flex items-center gap-1.5 text-sm text-gray-300">
              <input type="radio" name="auth" value="token" ${s.authMethod === 'token' ? 'checked' : ''} class="text-blue-500" />
              Token
            </label>
          </div>
        </div>

        <div id="apikey-field" class="${s.authMethod === 'token' ? 'hidden' : ''}">
          <label class="block text-xs font-medium text-gray-400 mb-1">API Key</label>
          <input id="s-apikey" type="password" value="${this.esc(configManager.getApiKey())}"
            class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            placeholder="Enter API key" />
          <p class="mt-1 text-[10px] text-gray-500">Get your endpoint and key at <a href="https://ai.azure.com" target="_blank" class="text-blue-400 underline hover:text-blue-300">ai.azure.com</a></p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Voice</label>
          <select id="s-voice" class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200">
            <optgroup label="en-US">
              ${[
                'en-US-Ava:DragonHDLatestNeural',
                'en-US-Andrew:DragonHDLatestNeural',
                'en-US-Aria:DragonHDLatestNeural',
                'en-US-Brian:DragonHDLatestNeural',
                'en-US-Emma:DragonHDLatestNeural',
                'en-US-Jenny:DragonHDLatestNeural',
                'en-US-Nova:DragonHDLatestNeural',
                'en-US-Phoebe:DragonHDLatestNeural',
                'en-US-Steffan:DragonHDLatestNeural',
                'en-US-Davis:DragonHDLatestNeural',
                'en-US-Adam:DragonHDLatestNeural',
                'en-US-Alloy:DragonHDLatestNeural',
                'en-US-Bree:DragonHDLatestNeural',
                'en-US-Jane:DragonHDLatestNeural',
                'en-US-Serena:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="en-GB">
              ${[
                'en-GB-Ada:DragonHDLatestNeural',
                'en-GB-Ollie:DragonHDLatestNeural',
                'en-GB-Ryan:DragonHDLatestNeural',
                'en-GB-Sonia:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="en-IN">
              ${[
                'en-IN-Aarti:DragonHDLatestNeural',
                'en-IN-Arjun:DragonHDLatestNeural',
                'en-IN-Meera:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="zh-CN">
              ${[
                'zh-CN-Xiaochen:DragonHDLatestNeural',
                'zh-CN-Yunfan:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="es-MX / es-ES">
              ${[
                'es-MX-Ximena:DragonHDLatestNeural',
                'es-MX-Tristan:DragonHDLatestNeural',
                'es-ES-Ximena:DragonHDLatestNeural',
                'es-ES-Tristan:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="fr-CA / fr-FR">
              ${[
                'fr-CA-Sylvie:DragonHDLatestNeural',
                'fr-CA-Thierry:DragonHDLatestNeural',
                'fr-FR-Vivienne:DragonHDLatestNeural',
                'fr-FR-Remy:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="de-DE">
              ${[
                'de-DE-Seraphina:DragonHDLatestNeural',
                'de-DE-Florian:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="ja-JP">
              ${[
                'ja-JP-Nanami:DragonHDLatestNeural',
                'ja-JP-Masaru:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="ko-KR">
              ${[
                'ko-KR-SunHi:DragonHDLatestNeural',
                'ko-KR-Hyunsu:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="it-IT">
              ${[
                'it-IT-Isabella:DragonHDLatestNeural',
                'it-IT-Alessio:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="pt-BR">
              ${[
                'pt-BR-Thalita:DragonHDLatestNeural',
                'pt-BR-Macerio:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
            <optgroup label="ms-MY">
              ${[
                'ms-MY-Yasmin:DragonHDLatestNeural',
              ].map(v =>
                `<option value="${v}" ${s.voice === v ? 'selected' : ''}>${v.replace(':DragonHDLatestNeural','')}</option>`
              ).join('')}
            </optgroup>
          </select>
          <p class="mt-1 text-xs text-gray-500">Azure DragonHD Latest voices (24kHz output)</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1">Recognition Language</label>
          <select id="s-lang" class="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200">
            ${['en-US','zh-CN','es-ES','fr-FR','ja-JP','ko-KR','de-DE','pt-BR'].map(l =>
              `<option value="${l}" ${s.recognitionLanguage === l ? 'selected' : ''}>${l}</option>`
            ).join('')}
          </select>
        </div>

        <label class="flex items-center gap-2 text-sm text-gray-300">
          <input id="s-debug" type="checkbox" ${s.debugMode ? 'checked' : ''} class="text-blue-500" />
          Debug Mode
        </label>

        <div id="s-saved-indicator" class="text-xs text-emerald-400 text-center opacity-0 transition-opacity duration-300">Settings saved</div>
      </div>
    `;

    this.container.querySelector('#settings-close')?.addEventListener('click', () => this.toggle());

    // Auto-save on any field change
    const autoSave = () => this.save();
    this.container.querySelector('#s-endpoint')?.addEventListener('input', autoSave);
    this.container.querySelector('#s-deployment')?.addEventListener('input', autoSave);
    this.container.querySelector('#s-apikey')?.addEventListener('input', autoSave);
    this.container.querySelector('#s-voice')?.addEventListener('change', autoSave);
    this.container.querySelector('#s-lang')?.addEventListener('change', autoSave);
    this.container.querySelector('#s-debug')?.addEventListener('change', autoSave);
    this.container.querySelectorAll<HTMLInputElement>('input[name="auth"]').forEach(r => {
      r.addEventListener('change', () => {
        this.container.querySelector('#apikey-field')?.classList.toggle('hidden', r.value === 'token');
        autoSave();
      });
    });
  }

  toggle(): void {
    this.sidebar.classList.toggle('hidden');
  }

  private save(): void {
    const endpoint = (this.container.querySelector('#s-endpoint') as HTMLInputElement).value.trim();
    const deploymentName = (this.container.querySelector('#s-deployment') as HTMLInputElement).value.trim() || 'gpt-4o';
    const authMethod = (this.container.querySelector<HTMLInputElement>('input[name="auth"]:checked')?.value || 'apikey') as 'apikey' | 'token';
    const voice = (this.container.querySelector('#s-voice') as HTMLSelectElement).value;
    const recognitionLanguage = (this.container.querySelector('#s-lang') as HTMLSelectElement).value;
    const debugMode = (this.container.querySelector('#s-debug') as HTMLInputElement).checked;
    const apiKey = (this.container.querySelector('#s-apikey') as HTMLInputElement)?.value.trim() || '';

    configManager.update({ endpoint, deploymentName, authMethod, voice, recognitionLanguage, debugMode });
    configManager.setApiKey(apiKey);
    this.onChange?.();

    // Flash saved indicator
    const indicator = this.container.querySelector('#s-saved-indicator') as HTMLElement | null;
    if (indicator) {
      indicator.style.opacity = '1';
      clearTimeout(this.flashTimer);
      this.flashTimer = window.setTimeout(() => { indicator.style.opacity = '0'; }, 1500);
    }
  }

  private esc(s: string): string {
    return s.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }
}
