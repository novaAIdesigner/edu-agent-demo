// Configuration manager — persists settings to cookies automatically

const COOKIE_NAME = 'eduvoice_settings';
const COOKIE_KEY_NAME = 'eduvoice_apikey';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

export interface AppSettings {
  endpoint: string;
  authMethod: 'apikey' | 'token';
  voice: string;
  debugMode: boolean;
  recognitionLanguage: string;
  deploymentName: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  endpoint: '',
  authMethod: 'apikey',
  voice: 'en-US-Ava:DragonHDLatestNeural',
  debugMode: false,
  recognitionLanguage: 'en-US',
  deploymentName: 'gpt-4o',
};

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, maxAge: number): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

class ConfigManager {
  private settings: AppSettings;
  private apiKey = '';

  constructor() {
    this.settings = this.load();
    this.apiKey = getCookie(COOKIE_KEY_NAME) || '';
  }

  private load(): AppSettings {
    try {
      const raw = getCookie(COOKIE_NAME);
      if (raw) {
        const loaded = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        // Migrate legacy voice names (OpenAI voices no longer supported)
        if (loaded.voice && !loaded.voice.includes(':') && !loaded.voice.includes('Neural')) {
          loaded.voice = DEFAULT_SETTINGS.voice;
        }
        return loaded;
      }
    } catch {
      // ignore
    }
    return { ...DEFAULT_SETTINGS };
  }

  save(): void {
    try {
      setCookie(COOKIE_NAME, JSON.stringify(this.settings), COOKIE_MAX_AGE);
    } catch {
      // ignore
    }
  }

  get(): AppSettings {
    return { ...this.settings };
  }

  update(partial: Partial<AppSettings>): void {
    Object.assign(this.settings, partial);
    this.save();
  }

  getApiKey(): string {
    return this.apiKey;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
    try {
      setCookie(COOKIE_KEY_NAME, key, COOKIE_MAX_AGE);
    } catch {
      // ignore
    }
  }
}

export const configManager = new ConfigManager();
